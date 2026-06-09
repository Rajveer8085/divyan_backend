import multer from 'multer';
import path from 'path';
import { unlink } from 'fs';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

// Best-effort removal of a previously stored upload (e.g. "/uploads/emp-xxx.png").
// Ignores missing files and any error — orphan cleanup must never break a request.
export const removeUploadedFile = (imgPath) => {
  if (!imgPath || typeof imgPath !== 'string' || !imgPath.startsWith('/uploads/')) return;
  unlink(path.join(UPLOAD_DIR, path.basename(imgPath)), () => {});
};

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
