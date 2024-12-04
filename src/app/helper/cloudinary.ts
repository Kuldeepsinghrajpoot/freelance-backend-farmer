import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

const uploadOnCloudinary = async (localFilePath: string): Promise<UploadApiResponse | null> => {
    try {
        if (!localFilePath) {
            console.error("No file path provided.");
            return null; // Does not upload the file to Cloudinary
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        // File has been uploaded successfully
        console.log('File is uploaded:', response);

        // Remove the locally saved temporary file
        fs.unlinkSync(localFilePath);

        return response;
    } catch (error) {
        // Log the error and clean up the locally saved file
        console.error("Error uploading file to Cloudinary:", error);

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
};

export { uploadOnCloudinary };
