import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    cb(null, `emp-${randomUUID()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (/^image\/(png|jpe?g|webp|gif|avif)$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error('Only image files (png, jpg, webp, gif, avif) are allowed');
    err.statusCode = 400;
    cb(err);
  }
};

// Accepts a single file from the "photo" field, max 5 MB.
export const uploadPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('photo');
