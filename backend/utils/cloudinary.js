import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadCloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) return null;
    
    // Configure cloudinary when the function is called to ensure env vars are loaded
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    
    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });
    console.log("✅ Uploaded:", response.secure_url);
    
    // Clean up local file after successful upload
    if (fs.existsSync(localfilepath)) {
      fs.unlinkSync(localfilepath);
    }
    return response;
    
  } catch (error) {
    // Clean up local file on error too
    if (fs.existsSync(localfilepath)) {
      fs.unlinkSync(localfilepath);
    }
    console.error("Cloudinary Upload Error:", error);
    return null;
  }
};

export { uploadCloudinary };
