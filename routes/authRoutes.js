const express = require('express');
const { register, login, getAllUsers, updatePassword, getUserById, sendVerificationEmail, updateUser, getUserCount,getTeachers,  // Thêm hàm mới
    updateTeacher,resetTeacherPassword,deleteTeacher,refreshToken } = require('../controllers/authController');
const { authMiddleware,isAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Cấu hình multer để xử lý upload file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads/')); // Đường dẫn tới thư mục uploads
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Đặt tên file
    }
});

const upload = multer({ storage: storage });

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng ký người dùng mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Email:
 *                 type: string
 *                 format: email
 *               Username:
 *                 type: string
 *               Password:
 *                 type: string
 *             required:
 *               - Email
 *               - Username
 *               - Password
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Email hoặc username đã tồn tại
 *       500:
 *         description: Lỗi máy chủ
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng nhập người dùng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Username:
 *                 type: string
 *               Password:
 *                 type: string
 *             required:
 *               - Username
 *               - Password
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       401:
 *         description: Thông tin xác thực không hợp lệ
 *       404:
 *         description: Người dùng không tồn tại
 *       500:
 *         description: Lỗi máy chủ
 */

/**
 * @swagger
 * /api/auth/getAllUsers:
 *   get:
 *     summary: Lấy danh sách tất cả người dùng
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: [] # Ensure authentication is required
 *     responses:
 *       200:
 *         description: Danh sách người dùng
 *       404:
 *         description: Không tìm thấy người dùng nào
 *       500:
 *         description: Lỗi máy chủ
 */

/**
 * @swagger
 * /api/auth/getUserById/{id}:
 *   get:
 *     tags: [Auth]
 *     summary: Lấy thông tin người dùng theo ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID của người dùng
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin người dùng thành công
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi máy chủ
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Gửi liên kết đặt lại mật khẩu đến email người dùng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Email
 *             properties:
 *               Email:
 *                 type: string
 *                 format: email
 *                 description: Địa chỉ email của người dùng
 *     responses:
 *       200:
 *         description: Liên kết đặt lại mật khẩu đã được gửi tới email của bạn
 *       400:
 *         description: Yêu cầu không hợp lệ, thiếu email
 *       404:
 *         description: Không tìm thấy người dùng với email đã cho
 *       500:
 *         description: Lỗi máy chủ
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/auth/updatePassword:
 *   put:
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []  # Ensure authentication is required
 *     summary: Update user password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UserID:
 *                 type: integer
 *                 description: The ID of the user
 *               oldPassword:
 *                 type: string
 *                 description: The current password of the user
 *               newPassword:
 *                 type: string
 *                 description: The new password for the user
 *             required:
 *               - UserID
 *               - oldPassword
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Bad request - user input is invalid
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/auth/updateUser:
 *   put:
 *     tags: [Auth]
 *     summary: Cập nhật thông tin người dùng
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data: 
 *           schema:
 *             type: object
 *             properties:
 *               UserID:
 *                 type: integer
 *               Hoten:
 *                 type: string
 *               Ngaysinh:
 *                 type: string
 *                 format: date
 *               Noisinh:
 *                 type: string
 *               Chuyenganh:
 *                 type: string
 *               Sonam:
 *                 type: integer
 *               Gioitinh:
 *                 type: string
 *               Std:
 *                 type: string
 *               Tendonvi:
 *                 type: string
 *               Nganh:
 *                 type: string         
 *               MGV:
 *                 type: integer
 *               Img:
 *                 type: string
 *                 format: binary
 *             required:
 *               - UserID
 *     responses:
 *       200:
 *         description: Cập nhật thông tin người dùng thành công
 *       400:
 *         description: Thiếu UserID hoặc thông tin không hợp lệ
 *       404:
 *         description: Không tìm thấy người dùng với UserID đã cho
 *       500:
 *         description: Lỗi máy chủ
 */
router.put('/api/auth/updateUser', authMiddleware, upload.single('Img'), updateUser);
/**
 * @swagger
 * /api/auth/user-count:
 *   get:
 *     tags: [Auth]
 *     summary: Get the total number of users
 *     description: Returns the count of users in the Users table.
 *     responses:
 *       200:
 *         description: Successful response with user count.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: Số lượng người dùng
 *                 userCount:
 *                   type: integer
 *                   example: 42
 *       404:
 *         description: No users found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Không tìm thấy người dùng!
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lỗi máy chủ
 */
/**
 * @swagger
 * /api/auth/getTeachers:
 *   get:
 *     tags: [Auth]
 *     summary: Lấy danh sách giáo viên
 *     description: Trả về danh sách tất cả giáo viên (người dùng có RoleID = 2)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách giáo viên được trả về thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: Danh sách giáo viên
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       UserID:
 *                         type: integer
 *                       Email:
 *                         type: string
 *                       Username:
 *                         type: string
 *       404:
 *         description: Không tìm thấy giáo viên nào
 *       500:
 *         description: Lỗi máy chủ
 */

/**
 * @swagger
 * /api/auth/updateTeacher:
 *   put:
 *     tags: [Auth]
 *     summary: Cập nhật thông tin giáo viên
 *     description: Cập nhật thông tin của một giáo viên dựa trên UserID
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UserID:
 *                 type: integer
 *               Email:
 *                 type: string
 *               Username:
 *                 type: string
 *               Std:
 *                 type: string
 *                 description: Số điện thoại của giáo viên
 *             required:
 *               - UserID
 *     responses:
 *       200:
 *         description: Thông tin giáo viên được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: Cập nhật thông tin giáo viên thành công!
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       404:
 *         description: Không tìm thấy giáo viên với UserID đã cho
 *       500:
 *         description: Lỗi máy chủ
 */
/**
 * @swagger
 * /api/auth/resetTeacherPassword/{UserID}:
 *   post:
 *     tags: [Auth]
 *     summary: Đặt lại mật khẩu giáo viên
 *     description: Đặt lại mật khẩu của một giáo viên về giá trị mặc định (1111) dựa trên UserID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: UserID
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của giáo viên cần đặt lại mật khẩu
 *     responses:
 *       200:
 *         description: Đặt lại mật khẩu giáo viên thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: Đặt lại mật khẩu giáo viên thành công!
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       404:
 *         description: Không tìm thấy giáo viên với UserID đã cho
 *       500:
 *         description: Lỗi máy chủ
 */
/**
 * @swagger
 * /api/auth/deleteTeacher/{UserID}:
 *   delete:
 *     tags: [Auth]
 *     summary: Xóa tài khoản giáo viên
 *     description: Xóa tài khoản của một giáo viên dựa trên UserID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: UserID
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của giáo viên cần xóa
 *     responses:
 *       200:
 *         description: Xóa giáo viên thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: Xóa giáo viên thành công!
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       404:
 *         description: Không tìm thấy giáo viên với UserID đã cho
 *       500:
 *         description: Lỗi máy chủ
 */
/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Làm mới access token
 *     description: Sử dụng refresh token để nhận access token và refresh token mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: Refresh token
 *             required:
 *               - refresh_token
 *     responses:
 *       200:
 *         description: Làm mới token thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: Làm mới token thành công
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *       400:
 *         description: Thiếu refresh token
 *       401:
 *         description: Refresh token không hợp lệ hoặc đã hết hạn
 */
router.post('/api/auth/register', register);
router.post('/api/auth/login', login);
router.get('/api/auth/getAllUsers',authMiddleware, isAdmin,getAllUsers); // Endpoint for getting users
router.get('/api/auth/getUserById/:id', authMiddleware, getUserById);
router.put('/api/auth/updatePassword', authMiddleware, updatePassword);
router.post('/api/auth/forgot-password', sendVerificationEmail); // Thay đổi route thành forgot-password
router.get('/api/auth/user-count', authMiddleware, isAdmin,getUserCount);
router.get('/api/auth/getTeachers', authMiddleware, getTeachers);
router.put('/api/auth/updateTeacher', authMiddleware, updateTeacher);
router.post('/api/auth/resetTeacherPassword/:UserID', authMiddleware, resetTeacherPassword);
router.delete('/api/auth/deleteTeacher/:UserID', authMiddleware, deleteTeacher);
router.post('/api/auth/refresh-token', refreshToken);
module.exports = router;
