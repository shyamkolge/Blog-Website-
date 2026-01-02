import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "uploads");
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName = `${uuid()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});


// File filter (images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};


const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

export default upload;