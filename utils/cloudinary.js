import dotenv from "dotenv"; // Use import instead of require
dotenv.config(); // Load environment variables

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UploadOnCloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) return null;
    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });
    console.log(response.url);
    return response.url; // Ensure the URL is returned
  } catch (error) {
    if (fs.existsSync(localfilepath)) {
      fs.unlinkSync(localfilepath); // Safely delete the file if it exists
    }
    throw error; // Re-throw the error for proper error handling
  }
};

export { UploadOnCloudinary };
