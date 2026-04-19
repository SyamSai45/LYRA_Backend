import { v2 as cloudinary } from "cloudinary";
import pkg from "multer-storage-cloudinary";
import multer from "multer";


const CloudinaryStorage = pkg.CloudinaryStorage || pkg.default || pkg;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const productStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "lyra/products", allowed_formats: ["jpg", "jpeg", "png", "webp"] },
});

const bannerStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "lyra/banners", allowed_formats: ["jpg", "jpeg", "png", "webp"] },
});

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: "lyra/profiles", allowed_formats: ["jpg", "jpeg", "png", "webp"] },
});

export const uploadProduct = multer({ storage: productStorage });
export const uploadBanner  = multer({ storage: bannerStorage });
export const uploadProfile = multer({ storage: profileStorage });

export default cloudinary;