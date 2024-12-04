// generate access token and refesh token
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();

interface Payload {
    id: string;
    email: string;
    role: string;
    name?:string
}

export  async function generateAccessTokenRefreshToken(payload: Payload) {
    const id = { id: payload.id };
    const jwtSecret = process.env.JWT_SECURTY_KEY;
    if (!jwtSecret) {
        throw new Error('Server error: Missing JWT_SECRET');
    }

    const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
    const refreshToken = jwt.sign(id, jwtSecret, { expiresIn: '7d' });

    await prisma.user.update({
        where: { id: payload.id },
        data: { refreshToken: refreshToken },
    });

    return { accessToken, refreshToken };
}