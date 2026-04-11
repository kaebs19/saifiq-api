const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

const UPLOADS_ROOT = path.join(__dirname, '..', '..', 'uploads');

const createImageUploader = (subfolder) => {
  const dir = path.join(UPLOADS_ROOT, subfolder);
  fs.mkdirSync(dir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const name = `${crypto.randomUUID()}${ext}`;
      cb(null, name);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('\u0635\u064A\u063A\u0629 \u0627\u0644\u0635\u0648\u0631\u0629 \u063A\u064A\u0631 \u0645\u062F\u0639\u0648\u0645\u0629 (jpg/png/webp \u0641\u0642\u0637)'));
  };

  return multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });
};

const deleteUpload = (relativeUrl) => {
  if (!relativeUrl) return;
  const filename = path.basename(relativeUrl);
  const subfolder = relativeUrl.replace(/^\/uploads\//, '').replace(/\/[^/]+$/, '');
  const fullPath = path.join(UPLOADS_ROOT, subfolder, filename);
  fs.unlink(fullPath, () => {});
};

module.exports = { createImageUploader, deleteUpload, UPLOADS_ROOT };
