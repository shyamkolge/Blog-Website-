import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";


const storage = multer.memoryStorage();

// File filter (images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// File upload limmit 
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});


export default upload;