const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

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

exports.uploadEventImage   = multer({ storage: storage('events'),   limits: { fileSize: 5e6 } }).single('image');
exports.uploadPaymentProof = multer({ storage: storage('receipts'), limits: { fileSize: 5e6 } }).single('paymentProof');
exports.uploadLogo         = multer({ storage: storage('logos'),    limits: { fileSize: 2e6 } }).single('logo');
