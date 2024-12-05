import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { SignUpRequestBody } from "../types/singup";
import { ApiError } from "../utils/api-error";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { userRequest } from "../types/auth";
import { ApiResponse } from "../utils/api-response";
import { generateAccessTokenRefreshToken } from "../helper/generate-access-token-refresh-token";
import { uploadOnCloudinary } from "../helper/cloudinary";

const prisma = new PrismaClient();
const validRoles = ["ADMIN", "USER"];

class AuthController {
    // Register a new user
    register = asyncHandler(async (req: Request, res: Response) => {
        const { name, email, password, phone, role } = req.body;

        if ([name, email, password, phone, role].some((field) => !field)) {
            throw new ApiError(400, "Missing required fields");
        }

        if (!validRoles.includes(role.toUpperCase())) {
            throw new ApiError(400, "Invalid role");
        }

        const checkUser = await prisma.user.findUnique({
            where: { email },
            select: { email: true },
        });

        if (checkUser?.email) {
            throw new ApiError(400, "User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                role: role.toUpperCase() as "ADMIN" | "USER",
            },
        });

        res.status(201).json(new ApiResponse(201, "User signed up successfully"));
    });

    // Login an existing user
    login = asyncHandler(async (req: userRequest, res: Response) => {
        const { email, password } = req.body;

        if ([email, password].some((field) => !field)) {
            throw new ApiError(400, "Missing required fields");
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password ?? "");
        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid password");
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };

        const jwtSecret = process.env.JWT_SECURTY_KEY;
        if (!jwtSecret) {
            throw new ApiError(500, "Server error: Missing JWT_SECRET");
        }

        req.user = payload;

        const { accessToken, refreshToken } = await generateAccessTokenRefreshToken(payload);

        res
            .status(200)
            .cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            })
            .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            })
            .json(new ApiResponse(200, "User logged in successfully", payload));
    });

    // Update user profile
    updateProfile = asyncHandler(async (req: userRequest, res: Response) => {
        const id = req?.user?.id;

        if (!id) {
            throw new ApiError(403, "User not authorized");
        }

        const { email, phone, address, name } = req.body;

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const productImage = files?.["image"]?.[0];

        let imageUrl;
        if (productImage) {
            const uploadPath = await uploadOnCloudinary(productImage.path);
            if (!uploadPath) {
                return res
                    .status(500)
                    .json(new ApiError(500, "Failed to upload image", "Failed to upload image"));
            }
            imageUrl = uploadPath.url;
        }

        const updatedProfile = await prisma.user.update({
            data: {
                email,
                phone,
                address,
                name,
                profile: imageUrl || undefined, // Only set imageUrl if available
            },
            where: { id },
        });

        if (!updatedProfile) {
            throw new ApiError(403, "User not updated");
        }

        res.status(200).json(new ApiResponse(200, "Profile updated successfully"));
    });

    // Logout user
    logout = asyncHandler(async (req: userRequest, res: Response) => {
        const id = req?.user?.id;
        if (!id) {
            throw new ApiError(403, "User not authorized");
        }
        await prisma.user.update({
            data: {
                refreshToken: null,
            },
            where: { id },
        });

        res
            .status(200)
            .cookie("accessToken", "", { httpOnly: true, secure: true, sameSite: "none", maxAge: 0 })
            .cookie("refreshToken", "", { httpOnly: true, secure: true, sameSite: "none", maxAge: 0 })
            .json(new ApiResponse(200, "User logged out successfully"));
    });

    // Get profile
    getProfile = asyncHandler(async (req: userRequest, res: Response) => {
        const id = req?.user?.id;

        if (!id) return res.status(403).json(new ApiError(403, "User not authorized"));

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                email: true,
                phone: true,
                address: true,
                name: true,
                profile: true,
            },
        });

        if (!user) return res.status(404).json(new ApiError(404, "User not found"));

        return res.status(200).json(new ApiResponse(200, "User profile", user));
    });

    // Update password
    updatePassword = asyncHandler(async (req: userRequest, res: Response) => {
        try {
            const id = req?.user?.id;

            const { oldPassword, newPassword } = req.body;

            if (!id) return res.status(403).json(new ApiError(403, "User not authorized"));

            if ([oldPassword, newPassword].some((field) => !field)) return res.status(400).json(new ApiError(400, "Missing required fields"));
            const user = await prisma.user.findUnique({ where: { id } });

            if (!user) return res.status(404).json(new ApiError(404, "User not found"));
            const isPasswordValid = await bcrypt.compare(oldPassword, user.password ?? "");

            if (!isPasswordValid) return res.status(401).json(new ApiError(401, "Invalid password"));
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await prisma.user.update({
                data: {
                    password: hashedPassword,
                },
                where: { id },
            });

            return res.status(200).json(new ApiResponse(200, "Password updated successfully"));
        } catch (error) {
            throw new ApiError(500, "Internal Server Error", error);
        }
    });
}

export const authController = new AuthController();
