import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';



const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'eibelabangla-news',
    format: async (req, file) => 'webp', // convert images to webp
    public_id: (req, file) => file.originalname.split('.')[0] + '-' + Date.now(),
    transformation: [{ width: 800, height: 400, crop: 'limit' }] // resize images
  },
});

const upload = multer({ storage: storage });

export default upload;
