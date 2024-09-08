import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinaryConfig.js';
import dotenv from 'dotenv';
dotenv.config(); 


// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // folder cloudinary account mai present hona chaiye
    format: async (req, file) => {
      // getting file extension 
      const extension = file.mimetype.split('/')[1];
      // jpg jpeg and png format are only allowed
      if (['jpg', 'jpeg', 'png'].includes(extension)) {
        return extension;
      }
      // default to png if extension not given
      return 'png';
    },
    public_id: (req, file) => `${req.user._id}-${Date.now()}`, // Setting a unique public_id by adding date 
  },
});

// file filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

export default upload;
