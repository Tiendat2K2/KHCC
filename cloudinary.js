const cloudinary = require('cloudinary').v2;
require('dotenv').config(); // Nạp biến môi trường từ file .env

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME, // Sử dụng biến môi trường
  api_key: process.env.API_KEY,       // Sử dụng biến môi trường
  api_secret: process.env.API_SECRET   // Sử dụng biến môi trường
});

module.exports = cloudinary;
