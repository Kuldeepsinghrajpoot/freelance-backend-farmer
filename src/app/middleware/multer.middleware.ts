import multer from "multer";
import { Request } from "express"; // Assuming you're using Express.js

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void): void => {
        cb(null, './public/temp');
    },
    // todo: here null indicate the error to pass null otherwise pass to cb
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void): void => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    }
});

export const upload = multer({ storage });