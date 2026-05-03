const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = (folder) => new CloudinaryStorage({
  cloudinary,
  params: {
    folder: `mauri-ticket/${folder}`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

const imageFilter = (req, file, cb) => {
  if (/image\/(jpeg|jpg|png|gif|webp)/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Images uniquement (jpg, png, webp, gif)'));
};

exports.uploadEventImage   = multer({ storage: storage('events'),   fileFilter: imageFilter, limits: { fileSize: 5e6 } }).single('image');
exports.uploadPaymentProof = multer({ storage: storage('receipts'), fileFilter: imageFilter, limits: { fileSize: 5e6 } }).single('paymentProof');
exports.uploadLogo         = multer({ storage: storage('logos'),    fileFilter: imageFilter, limits: { fileSize: 2e6 } }).single('logo');
