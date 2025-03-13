import multer from "multer";

const storage = multer.memoryStorage(); // Store in memory buffer
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg/;
    if (allowedTypes.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPEG/JPG files are allowed!"));
  },
});

export default upload;
