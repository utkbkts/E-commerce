import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const upload_file = async (file, folder) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
      folder: folder,
    });
    return {
      url: result.secure_url,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("File upload failed");
  }
};

export const delete_file = async (file) => {
  try {
    const res = await cloudinary.uploader.destroy(file);
    if (res.result === "ok") {
      return true;
    } else {
      throw new Error("File deletion failed");
    }
  } catch (error) {
    throw new Error("File deletion failed");
  }
};
