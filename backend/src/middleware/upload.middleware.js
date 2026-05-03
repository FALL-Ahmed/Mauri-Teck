const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createStorage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, `../../uploads/${folder}`);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

const imageFilter = (req, file, cb) => {
  if (/image\/(jpeg|jpg|png|gif|webp)/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Images uniquement (jpg, png, webp, gif)'));
};

exports.uploadEventImage   = multer({ storage: createStorage('events'),   fileFilter: imageFilter, limits: { fileSize: 5e6 } }).single('image');
exports.uploadPaymentProof = multer({ storage: createStorage('receipts'), fileFilter: imageFilter, limits: { fileSize: 5e6 } }).single('paymentProof');
exports.uploadLogo         = multer({ storage: createStorage('logos'),    fileFilter: imageFilter, limits: { fileSize: 2e6 } }).single('logo');
