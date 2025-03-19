import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinaryConfig.js";

// Set up Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products", // Folder in Cloudinary
    format: async (req, file) => "png", // Convert all images to PNG
    public_id: (req, file) => `${Date.now()}-${file.originalname}`, // Unique file name
  },
});

const upload = multer({ storage });

export default upload;
