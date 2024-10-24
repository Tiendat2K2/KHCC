const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); 
const path = require('path');
const { poolPromise } = require('../config/db');
require('dotenv').config();
exports.register = async (req, res) => {
    const { Email, Username, Password } = req.body;
    
    // Kiểm tra xem các trường có rỗng không
    if (!Email || !Username || !Password) {
        return res.status(400).json({ message: 'Vui lòng nhập tất cả các trường!' });
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(Email)) {
        return res.status(400).json({ message: 'Địa chỉ email không hợp lệ! Vui lòng kiểm tra định dạng email của bạn.' });
    }

    try {
        const pool = await poolPromise;

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(Password, 10);
        
        // Kiểm tra xem email đã tồn tại chưa
        const checkUser = await pool
            .request()
            .input('email', sql.NVarChar, Email)
            .query('SELECT * FROM Users WHERE Email = @email');
        
        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ message: 'Email đã được đăng ký!' });
        }

        // Kiểm tra xem username đã tồn tại chưa
        const checkUsername = await pool
            .request()
            .input('username', sql.NVarChar, Username)
            .query('SELECT * FROM Users WHERE Username = @username');
        
        if (checkUsername.recordset.length > 0) {
            return res.status(400).json({ message: 'Username đã được đăng ký!' });
        }

        // Thiết lập RoleID mặc định là 2
        const roleID = 2;

        // Thực hiện thêm người dùng mới vào cơ sở dữ liệu
        await pool
            .request()
            .input('username', sql.NVarChar, Username)
            .input('email', sql.NVarChar, Email)
            .input('password', sql.NVarChar, hashedPassword)
            .input('roleID', sql.Int, roleID)
            .query('INSERT INTO Users (Username, Email, Password, RoleID) VALUES (@username, @email, @password, @roleID)');

        res.status(200).json({ status:1,message: 'Đăng ký thành công!' });
    } catch (err) {
        console.error('Đăng ký lỗi:', err);
        res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
    }
};
// Đăng nhập người dùng
exports.login = async (req, res) => {
    const { Username, Password } = req.body;
    if (!Username || !Password) {
        return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu!' });
    }
    try {
        const pool = await poolPromise;
        const user = await pool
            .request()
            .input('username', sql.NVarChar, Username)
            .query('SELECT UserID, RoleID, Email, Username, Password FROM Users WHERE Username = @username');
        if (user.recordset.length === 0) {
            return res.status(400).json({ message: 'Sai tên đăng nhập hoặc mật khẩu!' });
        }
        const validPassword = await bcrypt.compare(Password, user.recordset[0].Password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Sai tên đăng nhập hoặc mật khẩu!' });
        }
        // Tạo access_token với roleId và UserID
        const access_token = jwt.sign(
            { id: user.recordset[0].UserID, roleId: user.recordset[0].RoleID },
            process.env.access_token,
            { expiresIn: '300d' }
        );
        // Tạo refresh_token
        const refresh_token = jwt.sign(
            { id: user.recordset[0].UserID, roleId: user.recordset[0].RoleID }, 
            process.env.refresh_token,
            { expiresIn: '365h' }
        );
        res.json({
            status: 1,
            message: 'Đăng nhập thành công!',
            access_token,
            refresh_token
        });
    } catch (err) {
        console.error('Đăng nhập lỗi:', err);
        res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
    }
};
exports.getAllUsers = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool
            .request()
            .query('SELECT UserID, Hoten ,Ngaysinh,Noisinh,Chuyenganh,Sonam,Gioitinh,Std,Tendonvi,Nganh,Img,MGV FROM Users Where RoleID =2'); // Corrected syntax

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng nào!' });
        }
        res.status(200).json({
            status: 1, // Return status code
            message: 'Danh sách người dùng', // Return a message
            data: result.recordset // Return the fetched users
        });
    } catch (err) {
        console.error('Lỗi lấy danh sách người dùng:', err);
        res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
    }
};
exports.getUserById = async (req, res) => {
    const userId = req.params.id; // Lấy UserID từ tham số của yêu cầu

    try {
        const pool = await poolPromise;

        // Câu truy vấn SQL để lấy thông tin người dùng theo ID
        const result = await pool
            .request()
            .input('UserID', userId) // Sử dụng truy vấn tham số để tránh SQL injection
            .query(`
                SELECT 
                    Hoten,
                    Ngaysinh,
                    Noisinh,
                    Chuyenganh,
                    Sonam,
                    Gioitinh,
                    Std,
                    Tendonvi,
                    Nganh,
                    Img,
                    MGV 
                FROM 
                    Users 
                WHERE 
                    UserID = @UserID
            `); // Truy vấn chỉ lấy các trường cần thiết

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        }

        res.status(200).json({
            status: 1, // Return status code
            message: 'Danh sách người dùng', // Return a message
            data: result.recordset // Return the fetched users
        }); // Trả về thông tin người dùng t��m thấy
    } catch (err) {
        console.error('Lỗi lấy người dùng:', err);
        res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
    }
};
exports.updatePassword = async (req, res) => {
    const { UserID, oldPassword, newPassword } = req.body;

    if (!UserID || !oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Vui lòng nhập tất cả các trường!' });
    }

    try {
        const pool = await poolPromise;

        const user = await pool
            .request()
            .input('UserID', sql.Int, UserID)
            .query('SELECT Password FROM Users WHERE UserID = @UserID');

        if (user.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        }

        const validPassword = await bcrypt.compare(oldPassword, user.recordset[0].Password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Mật khẩu cũ không chính xác!' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await pool
            .request()
            .input('UserID', sql.Int, UserID)
            .input('Password', sql.NVarChar, hashedNewPassword)
            .query('UPDATE Users SET Password = @Password WHERE UserID = @UserID');

        res.status(200).json({status: 1, message: 'Cập nhật mật khẩu thành công!' });
    } catch (err) {
        console.error('Lỗi cập nhật mật khẩu:', err);
        res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
    }
};
function generateRandomPassword(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
}
exports.sendVerificationEmail = async (req, res) => {
    const { Email } = req.body;

    if (!Email) {
        return res.status(400).json({ message: 'Vui lòng cung cấp địa chỉ email!' });
    }

    try {
        const pool = await poolPromise;

        // Kiểm tra email tồn tại
        const user = await pool
            .request()
            .input('email', sql.NVarChar, Email)
            .query('SELECT UserID FROM Users WHERE Email = @email');

        if (user.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy tài khoản với email đã cho!' });
        }

        // Tạo mật khẩu mới
        const newPassword = generateRandomPassword(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu mới vào cơ sở dữ liệu
        await pool
            .request()
            .input('UserID', sql.Int, user.recordset[0].UserID)
            .input('Password', sql.NVarChar, hashedNewPassword)
            .query('UPDATE Users SET Password = @Password WHERE UserID = @UserID');

        // Cấu hình gửi email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: Email,
            subject: 'Mật khẩu mới của bạn',
            text: `Mật khẩu mới của bạn là: ${newPassword}`,
        };

        // Gửi email
        await transporter.sendMail(mailOptions);

        res.status(200).json({status: 1, message: 'Mật khẩu mới đã được gửi tới email của bạn!' });
    } catch (err) {
        console.error('Lỗi khi đặt lại mật khẩu:', err);
        res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
    }
};
exports.updateUser = async (req, res) => {
    const { UserID } = req.body;
    let Img = null;

    if (req.file) {
        Img = req.file.path.replace(/\\/g, '/');
    }

    if (!UserID) {
        return res.status(400).json({ message: 'Vui lòng cung cấp UserID!' });
    }

    try {
        const pool = await poolPromise;

        // Check if the user exists
        const userCheck = await pool
            .request()
            .input('UserID', sql.Int, UserID)
            .query('SELECT * FROM Users WHERE UserID = @UserID');

        if (userCheck.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng với UserID đã cho!' });
        }

        // Check if the phone number already exists for another user
        if (req.body.Std) {
            const phoneCheck = await pool
                .request()
                .input('Std', sql.NVarChar, req.body.Std)
                .input('UserID', sql.Int, UserID)
                .query('SELECT * FROM Users WHERE Std = @Std AND UserID != @UserID');

            if (phoneCheck.recordset.length > 0) {
                return res.status(400).json({ message: 'Số điện thoại đã tồn tại!' });
            }
        }

        let query = 'UPDATE Users SET ';
        const request = pool.request().input('UserID', sql.Int, UserID);

        if (Img) {
            query += 'Img = @Img';
            request.input('Img', sql.NVarChar, Img);
        }

        // Add other fields if they are provided
        const fields = ['Hoten', 'Ngaysinh', 'Noisinh', 'Chuyenganh', 'Sonam', 'Gioitinh', 'Std', 'Tendonvi', 'Nganh', 'MGV'];
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                if (query !== 'UPDATE Users SET ') query += ', ';
                query += `${field} = @${field}`;
                request.input(field, req.body[field]);
            }
        });

        query += ' WHERE UserID = @UserID';

        await request.query(query);

        res.status(200).json({ 
            status: 1, 
            message: 'Cập nhật thông tin người dùng thành công!',
            imageUrl: Img ? `/uploads/${path.basename(Img)}` : null
        });
    } catch (err) {
        console.error('Lỗi cập nhật thông tin người dùng:', err);
        res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
    }
};
exports.getUserCount = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool
            .request()
            .query('SELECT COUNT(*) AS UserCount FROM Users');

        // Check if the result contains data
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        }

        // Return the user count
        res.status(200).json({
            status: 1,
            message: 'Số lượng người dùng',
            userCount: result.recordset[0].UserCount // Access the UserCount from the result
        });
    } catch (err) {
        console.error('Lỗi lấy số lượng người dùng:', err);
        res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
    }
};
exports.getTeachers = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool
            .request()
            .query(`
                SELECT 
                    UserID, 
                    Email, 
                    Username,
                    Std
                FROM Users 
                WHERE RoleID = 2
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy giáo viên nào!' });
        }

        res.status(200).json({
            status: 1,
            message: 'Danh sách giáo viên',
            data: result.recordset
        });
    } catch (err) {
        console.error('Lỗi lấy danh sách giáo viên:', err);
        res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
    }
};
// Cập nhật thông tin người dùng
exports.updateTeacher = async (req, res) => {
    let { UserID, Email, Username, Std } = req.body;
    
    if (!UserID) {
        return res.status(400).json({ status: 0, message: 'Vui lòng cung cấp UserID!' });
    }

    // Loại bỏ khoảng trắng thừa
    if (Email) Email = Email.trim();
    if (Username) Username = Username.trim();
    if (Std) Std = Std.trim();
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (Email && !gmailRegex.test(Email)) {
        return res.status(400).json({ status: 0, message: 'Vui lòng nhập đúng định dạng email Gmail!' });
    }
    try {
        const pool = await poolPromise;
        
        // Kiểm tra xem giáo viên có tồn tại không
        const userCheck = await pool
            .request()
            .input('UserID', sql.Int, UserID)
            .query('SELECT * FROM Users WHERE UserID = @UserID AND RoleID = 2');

        if (userCheck.recordset.length === 0) {
            return res.status(404).json({ status: 0, message: 'Không tìm thấy giáo viên với UserID đã cho!' });
        }

        // Kiểm tra Email
        if (Email) {
            const emailCheck = await pool
                .request()
                .input('Email', sql.NVarChar, Email)
                .input('UserID', sql.Int, UserID)
                .query('SELECT * FROM Users WHERE Email = @Email AND UserID != @UserID');

            if (emailCheck.recordset.length > 0) {
                return res.status(400).json({ status: 0, message: 'Email đã tồn tại!' });
            }
        }

        // Kiểm tra Username
        if (Username) {
            const usernameCheck = await pool
                .request()
                .input('Username', sql.NVarChar, Username)
                .input('UserID', sql.Int, UserID)
                .query('SELECT * FROM Users WHERE Username = @Username AND UserID != @UserID');

            if (usernameCheck.recordset.length > 0) {
                return res.status(400).json({ status: 0, message: 'Username đã tồn tại!' });
            }
        }

        // Kiểm tra Std
        if (Std) {
            const stdCheck = await pool
                .request()
                .input('Std', sql.NVarChar, Std)
                .input('UserID', sql.Int, UserID)
                .query('SELECT * FROM Users WHERE Std = @Std AND UserID != @UserID');

            if (stdCheck.recordset.length > 0) {
                return res.status(400).json({ status: 0, message: 'Số điện thoại đã tồn tại!' });
            }
        }

        // Thực hiện cập nhật
        let query = 'UPDATE Users SET ';
        const request = pool.request().input('UserID', sql.Int, UserID);

        if (Email) {
            query += 'Email = @Email, ';
            request.input('Email', sql.NVarChar, Email);
        }
        if (Username) {
            query += 'Username = @Username, ';
            request.input('Username', sql.NVarChar, Username);
        }
        if (Std) {
            query += 'Std = @Std, ';
            request.input('Std', sql.NVarChar, Std);
        }

        query = query.slice(0, -2); // Loại bỏ dấu phẩy và khoảng trắng cuối cùng
        query += ' WHERE UserID = @UserID AND RoleID = 2';

        await request.query(query);

        res.status(200).json({ 
            status: 1, 
            message: 'Cập nhật thông tin giáo viên thành công!'
        });
    } catch (err) {
        console.error('Lỗi cập nhật thông tin giáo viên:', err);
        res.status(500).json({ status: 0, message: 'Lỗi máy chủ', error: err.message });
    }
};
exports.deleteTeacher = async (req, res) => {
    const { UserID } = req.params;

    if (!UserID) {
        return res.status(400).json({ message: 'Vui lòng cung cấp UserID!' });
    }

    try {
        const pool = await poolPromise;

        // Kiểm tra xem giáo viên có tồn tại không
        const userCheck = await pool
            .request()
            .input('UserID', sql.Int, UserID)
            .query('SELECT * FROM Users WHERE UserID = @UserID AND RoleID = 2');

        if (userCheck.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy giáo viên với UserID đã cho!' });
        }

        // Thực hiện xóa giáo viên
        await pool
            .request()
            .input('UserID', sql.Int, UserID)
            .query('DELETE FROM Users WHERE UserID = @UserID AND RoleID = 2');

        res.status(200).json({ 
            status: 1, 
            message: 'Xóa giáo viên thành công!'
        });
    } catch (err) {
        console.error('Lỗi xóa giáo viên:', err);
        res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
    }
};
exports.resetTeacherPassword = async (req, res) => {
    const { UserID } = req.params;

    if (!UserID) {
        return res.status(400).json({ message: 'Vui lòng cung cấp UserID!' });
    }

    try {
        const pool = await poolPromise;

        // Kiểm tra xem giáo viên có tồn tại không
        const userCheck = await pool
            .request()
            .input('UserID', sql.Int, UserID)
            .query('SELECT * FROM Users WHERE UserID = @UserID AND RoleID = 2');

        if (userCheck.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy giáo viên với UserID đã cho!' });
        }

        // Mật khẩu mặc định
        const defaultPassword = '1111';

        // Mã hóa mật khẩu mặc định
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Cập nhật mật khẩu mới
        await pool
            .request()
            .input('UserID', sql.Int, UserID)
            .input('Password', sql.NVarChar, hashedPassword)
            .query('UPDATE Users SET Password = @Password WHERE UserID = @UserID AND RoleID = 2');

        res.status(200).json({ 
            status: 1, 
            message: 'Đặt lại mật khẩu giáo viên thành công!'
        });
    } catch (err) {
        console.error('Lỗi đặt lại mật khẩu giáo viên:', err);
        res.status(500).json({ message: 'Lỗi máy chủ', error: err.message });
    }
};
exports.refreshToken = async (req, res) => {
    const { refresh_token } = req.body;
    if (!refresh_token) {
        return res.status(400).json({ message: 'Cần có refresh token' });
    }
    try {
        // Xác minh refresh token
        const decoded = jwt.verify(refresh_token, process.env.refresh_token);
        // Tính thời gian còn lại của refresh token cũ
        const remainingTime = Math.floor((decoded.exp * 1000 - Date.now()) / 1000); 
        // Tạo access token mới
        const access_token = jwt.sign(
            { id: decoded.id, roleId: decoded.roleId },
            process.env.access_token,
            { expiresIn: '30s' } // Thay đổi thời gian nếu cần
        );
        // Tạo refresh token mới với thời gian hết hạn bằng thời gian còn lại của refresh token cũ
        const new_refresh_token = jwt.sign(
            { id: decoded.id, roleId: decoded.roleId },
            process.env.refresh_token,
            { expiresIn: remainingTime + 's' } // Thay đổi thời gian nếu cần
        );
        res.json({
            status: 1,
            message: 'Làm mới token thành công',
            access_token,
            refresh_token: new_refresh_token
        });
    } catch (err) {
        console.error('Lỗi làm mới token:', err);
        res.status(401).json({ message: 'Refresh token không hợp lệ hoặc đã hết hạn' });
    }
};