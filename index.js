// Nạp các thư viện cần thiết
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const ChuyenNganh = require('./routes/ChuyenNganhRoutes');
const Dulieu = require('./routes/DulieuRoutes');
const setupSwagger = require('./swagger/swagger');

// Nạp các biến môi trường từ file .env
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Đăng ký các route
app.use('/', authRoutes);
app.use('/', ChuyenNganh);
app.use('/', Dulieu);

// Thiết lập Swagger
setupSwagger(app);

// Lấy cổng từ biến môi trường hoặc sử dụng cổng mặc định
const PORT = process.env.PORT || 3000;

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Base URL is: ${process.env.BASE_URL}`); // In ra Base URL từ biến môi trường
});
