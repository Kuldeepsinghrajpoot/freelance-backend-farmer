import { PrismaClient } from "@prisma/client";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { uploadOnCloudinary } from "../helper/cloudinary";
import { ApiResponse } from "../utils/api-response";
import { userRequest } from "../types/auth";
import bcrypt from 'bcrypt'
import { generateAccessTokenRefreshToken } from "../helper/generate-access-token-refresh-token";
const prisma = new PrismaClient();
class AdminController {
    // register admin
    register = asyncHandler(async (req: Request, res: Response) => {
        try {
            // const { email, password, role, phone } = req.body;
            const { name, email, password, phone, role } = req.body;
            if ([name, email, password, phone, role].some((field) => !field)) {
                return res.status(400).json(new ApiError(400, "Missing required fields", ""));
            }
            const checkUser = await prisma.admin.findUnique({
                where: { email },
            });

            if (!checkUser) {
                return res.status(400).json(new ApiError(400, "User already exists", ""));
            }
            const hashedPassword = await bcrypt.hash(password, 10);

            await prisma.admin.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    phone,
                    role: role.toUpperCase() as "ADMIN" | "USER",
                }
            })

            res.status(201).json(new ApiResponse(201, "User signed up successfully"));
        } catch (error) {
            console.error("Error registering user:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });

    // login admin
    login = asyncHandler(async (req: userRequest, res: Response) => {
        try {
            const { email, password } = req.body;

            if ([email, password].some((field) => !field)) {
                return res.status(400).json(new ApiError(400, "Missing required fields", ""));
            }

            const user = await prisma.admin.findUnique({ where: { email } });

            if (!user) {
                return res.status(404).json(new ApiError(404, "User not found", ""));
            }

            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                return res.status(400).json(new ApiError(400, "Invalid password", ""));
            }

            const payload = {
                id: user.id,
                email: user.email,
                role: user.role,
                // name: user.name,
            };

            const { accessToken, refreshToken } = await generateAccessTokenRefreshToken(payload);
            req.user = payload;
            // res.status(200).json({ accessToken, refreshToken });
            res.status(200).cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            }).cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            }).json(new ApiResponse(200, "Login successful", { accessToken, refreshToken }));
        } catch (error) {
            console.error("Error logging in user:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    })
    // Update admin profile
    updateProfile = asyncHandler(async (req: userRequest, res: Response) => {
        const id = req?.user?.id;
        if (!id) {
            return res.status(403).json(new ApiError(403, "User not authorized", ""));
        }

        const { email, phone, name, password, address } = req.body;

        const file = req?.files as { [fieldname: string]: Express.Multer.File[] };
        const getImage = file?.["profile"]?.[0];

        if (!file || !getImage) {
            return res
                .status(400)
                .json(new ApiError(400, "Please provide a valid image", ""));
        }

        const upload = await uploadOnCloudinary(getImage.path);
        if (!upload) {
            return res
                .status(500)
                .json(new ApiError(500, "Failed to upload image", ""));
        }

        const updateProfile = await prisma.admin.update({
            where: { id },
            data: {
                email,
                phone,
                name,
                password,
                address,
                profile: upload?.url,
            },
        });

        if (!updateProfile) {
            return res
                .status(400)
                .json(
                    new ApiError(
                        400,
                        "Something went wrong while updating the profile",
                        ""
                    )
                );
        }
        res
            .status(200)
            .json(new ApiResponse(200, "Profile updated successfully", updateProfile));
    });
}


export const adminController = new AdminController();