import { NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { ApiError } from "../utils/api-error";
import { userRequest } from "../types/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const verifyJWT = asyncHandler(async (req: userRequest, _: null, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized Access");
        }
        const decoded = await jwt.verify(token, process.env.JWT_SECURTY_KEY as Secret) as JwtPayload;
        const { id, role } = decoded;

        if (!role) {
            throw new ApiError(401, "Invalid access token");
        }
        const user = await prisma.user.findUnique({
            where: { id: id }, select: {
                role: true,
                id: true,
                name: true,
                email: true,
                phone: true,
            }
        })
        // let user: any = null;
        if (!user) {
            throw new ApiError(401, "User not found");
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in verifyJWT middleware:", error);
        throw new ApiError(401, "Invalid access token");
    }
});