const { poolPromise } = require('../config/db');
const multer = require('multer');
const path = require('path');
const sql = require('mssql');
const fs = require('fs');
// Cấu hình multer để xử lý upload file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Thư mục lưu trữ file
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname) // Đặt tên file
    }
});
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Chỉ cho phép upload file Word hoặc PDF
        if (file.mimetype === "application/msword" || 
            file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file Word hoặc PDF!'), false);
        }
    }
}).single('Files'); // 'Files' là tên trường trong form-data

// Hàm tạo đường dẫn file
function createFilePath(file) {
    if (file) {
        let filePath = path.join('C:/Users/nguye/Desktop/KHCN/Backend/quanlyquanao/uploads', file.filename);
        return filePath.replace(/\\/g, '/');
    }
    return null;
}
// Lấy dữ liệu từ bảng Dulieu
exports.getDulieu = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Dulieu');
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error.message);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy dữ liệu.' });
    }
};
exports.getDulieuID = async (req, res) => {
    try {
        const pool = await poolPromise;
        const userId = req.params.UserID; // Lấy UserID từ tham số yêu cầu
        const result = await pool.request()
            .input('UserID', sql.Int, userId) // Giả sử UserID là kiểu Int
            .query('SELECT * FROM Dulieu WHERE UserID = @UserID'); // Lấy bản ghi theo UserID

        if (result.recordset.length === 0) {
            return res.status(404).json({ status: 0, message: 'Không tìm thấy bản ghi.' });
        }

        // Trả về bản ghi và thông báo thành công
        res.status(200).json({
            status: 1,
            message: 'Dữ liệu đã được lấy thành công.',
            data: result.recordset // Wrap the data in an object
        });
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu theo UserID:', error.message);
        res.status(500).json({ status: 0, message: 'Đã xảy ra lỗi trong quá trình lấy dữ liệu theo UserID.' });
    }
};
// Thêm mới bản ghi vào bảng Dulieu
exports.addDulieu = async (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: 'Lỗi upload file: ' + err.message });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            const { Tieude, Nhomtacgia, Tapchixuatban, Thongtinmatapchi, Namhoc, Ghichu, UserID, ChuyenNganhID } = req.body;
            const filePath = createFilePath(req.file);

            const pool = await poolPromise;

            // Kiểm tra UserID và ChuyenNganhID
            const [userCheck, chuyenNganhCheck] = await Promise.all([
                pool.request().input('UserID', sql.Int, UserID).query('SELECT * FROM Users WHERE UserID = @UserID'),
                pool.request().input('ChuyenNganhID', sql.Int, ChuyenNganhID).query('SELECT * FROM ChuyenNganh WHERE IDChuyenNganh = @ChuyenNganhID')
            ]);

            if (userCheck.recordset.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy UserID!' });
            }
            if (chuyenNganhCheck.recordset.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy ChuyenNganhID!' });
            }

            const insertQuery = `
                INSERT INTO Dulieu (Tieude, Files, Nhomtacgia, Tapchixuatban, Thongtinmatapchi, Namhoc, Ghichu, UserID, ChuyenNganhID) 
                VALUES (@Tieude, @Files, @Nhomtacgia, @Tapchixuatban, @Thongtinmatapchi, @Namhoc, @Ghichu, @UserID, @ChuyenNganhID);
                SELECT SCOPE_IDENTITY() AS ID;
            `;
            const result = await pool.request()
                .input('Tieude', sql.NVarChar, Tieude)
                .input('Files', sql.NVarChar, filePath)
                .input('Nhomtacgia', sql.NVarChar, Nhomtacgia)
                .input('Tapchixuatban', sql.NVarChar, Tapchixuatban)
                .input('Thongtinmatapchi', sql.NVarChar, Thongtinmatapchi)
                .input('Namhoc', sql.Int, parseInt(Namhoc))
                .input('Ghichu', sql.NVarChar, Ghichu)
                .input('UserID', sql.Int, parseInt(UserID))
                .input('ChuyenNganhID', sql.Int, parseInt(ChuyenNganhID))
                .query(insertQuery);

            const insertedId = result.recordset[0].ID;

            res.status(201).json({ 
                message: 'Dữ liệu đã được thêm thành công!',
                data: {
                    ID: insertedId,
                    Tieude,
                    Files: filePath,
                    Nhomtacgia,
                    Tapchixuatban,
                    Thongtinmatapchi,
                    Namhoc,
                    Ghichu,
                    UserID,
                    ChuyenNganhID
                }
            });
        } catch (error) {
            console.error('Lỗi khi thêm dữ liệu:', error.message);
            res.status(500).json({ message: 'Lỗi khi thêm dữ liệu.', error: error.message });
        }
    });
};
// Cập nhật bản ghi trong bảng Dulieu
exports.updateDulieu = async (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: 'Lỗi upload file: ' + err.message });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            const { ID } = req.params;
            const { Tieude, Nhomtacgia, Tapchixuatban, Thongtinmatapchi, Namhoc, Ghichu, UserID, ChuyenNganhID } = req.body;
            const newFilePath = createFilePath(req.file);

            const pool = await poolPromise;

            // Kiểm tra xem bản ghi có tồn tại không
            const dulieuCheck = await pool.request()
                .input('ID', sql.Int, ID)
                .query('SELECT * FROM Dulieu WHERE ID = @ID');

            if (dulieuCheck.recordset.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy dữ liệu với ID đã cho!' });
            }
            // Lấy đường dẫn file cũ
            const oldFilePath = dulieuCheck.recordset[0].Files;

            // Chuẩn bị câu lệnh cập nhật
            let updateQuery = 'UPDATE Dulieu SET ';
            const updateFields = [];
            const request = pool.request().input('ID', sql.Int, ID);

            if (Tieude) {
                updateFields.push('Tieude = @Tieude');
                request.input('Tieude', sql.NVarChar, Tieude);
            }
            if (newFilePath) {
                updateFields.push('Files = @Files');
                request.input('Files', sql.NVarChar, newFilePath);
            }
            if (Nhomtacgia) {
                updateFields.push('Nhomtacgia = @Nhomtacgia');
                request.input('Nhomtacgia', sql.NVarChar, Nhomtacgia);
            }
            if (Tapchixuatban) {
                updateFields.push('Tapchixuatban = @Tapchixuatban');
                request.input('Tapchixuatban', sql.NVarChar, Tapchixuatban);
            }
            if (Thongtinmatapchi) {
                updateFields.push('Thongtinmatapchi = @Thongtinmatapchi');
                request.input('Thongtinmatapchi', sql.NVarChar, Thongtinmatapchi);
            }
            if (Namhoc) {
                updateFields.push('Namhoc = @Namhoc');
                request.input('Namhoc', sql.Int, parseInt(Namhoc));
            }
            if (Ghichu) {
                updateFields.push('Ghichu = @Ghichu');
                request.input('Ghichu', sql.NVarChar, Ghichu);
            }

            // Kiểm tra nếu người dùng là admin thì không cập nhật UserID
            if (req.user.RoleID === 1) { // Giả sử RoleID của admin là 1
                console.log("Admin đang cập nhật dữ liệu, bỏ qua trường UserID.");
            } else if (UserID) {
                updateFields.push('UserID = @UserID');
                request.input('UserID', sql.Int, parseInt(UserID));
            }

            if (ChuyenNganhID) {
                updateFields.push('ChuyenNganhID = @ChuyenNganhID');
                request.input('ChuyenNganhID', sql.Int, parseInt(ChuyenNganhID));
            }

            updateQuery += updateFields.join(', ') + ' WHERE ID = @ID';

            // Thực hiện cập nhật
            await request.query(updateQuery);

            // Xóa file cũ nếu có file mới được upload
            if (newFilePath && oldFilePath) {
                fs.unlink(oldFilePath, (err) => {
                    if (err) console.error('Lỗi khi xóa file cũ:', err);
                });
            }
            // Lấy dữ liệu sau khi cập nhật
            const updatedData = await pool.request()
                .input('ID', sql.Int, ID)
                .query('SELECT * FROM Dulieu WHERE ID = @ID');

            res.status(200).json({ 
                message: 'Dữ liệu đã được cập nhật thành công!',
                data: updatedData.recordset[0]
            });
        } catch (error) {
            console.error('Lỗi khi cập nhật dữ liệu:', error.message);
            res.status(500).json({ message: 'Lỗi khi cập nhật dữ liệu.', error: error.message });
        }
    });
};

// Xóa bản ghi từ bảng Dulieu
exports.deleteDulieu = async (req, res) => {
    try {
        const { ID } = req.params;

        const pool = await poolPromise;
        await pool.request()
            .input('ID', ID)
            .query('DELETE FROM Dulieu WHERE ID = @ID');

        res.status(200).json({ message: 'Dữ liệu đã được xóa thành công!' });
    } catch (error) {
        console.error('Lỗi khi xóa dữ liệu:', error.message);
        res.status(500).json({ message: 'Lỗi khi xóa dữ liệu.' });
    }
};

// Lấy số lượng bản ghi trong bảng Dulieu
exports.getDulieuCount = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT COUNT(*) AS DulieuCount FROM Dulieu');
        const count = result.recordset[0].DulieuCount;
        res.status(200).json({
            status: 1,
            message: 'Số lần Dulieu',
            count: count,
        });
    } catch (error) {
        console.error('Lỗi khi lấy số lượng bản ghi:', error.message);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy số lượng bản ghi.' });
    }
};
exports.downloadFile = async (req, res) => {
    try {
        const { ID } = req.params; // retrieve file ID from request parameters
        const pool = await poolPromise;

        // Query the database to get the file path and title
        const result = await pool.request()
            .input('ID', sql.Int, ID)
            .query('SELECT Files, Tieude FROM Dulieu WHERE ID = @ID');

        // If no data is found
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy dữ liệu với ID đã cho!' });
        }

        const { Files: filePath, Tieude } = result.recordset[0];

        // Check if the file exists on the server
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Không tìm thấy file trên máy chủ!' });
        }

        // Download the file using res.download
        res.download(filePath, path.basename(filePath), (err) => {
            if (err) {
                console.error('Lỗi khi tải file:', err);
                res.status(500).json({ message: 'Lỗi khi tải file.' });
            }
        });

    } catch (error) {
        // Catch any unexpected errors
        console.error('Lỗi khi tải file:', error);
        res.status(500).json({ message: 'Lỗi khi tải file.', error: error.message });
    }
};

// Xem file PDF
exports.viewFile = async (req, res) => {
    try {
        const { ID } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ID', sql.Int, ID)
            .query('SELECT Files, Tieude FROM Dulieu WHERE ID = @ID');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy dữ liệu với ID đã cho!' });
        }

        const { Files: filePath, Tieude } = result.recordset[0];

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Không tìm thấy file trên máy chủ!' });
        }

        const fileExtension = path.extname(filePath).toLowerCase();
        
        if (fileExtension !== '.pdf') {
            return res.status(400).json({ message: 'Chỉ hỗ trợ xem file PDF.' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        fileStream.on('error', (err) => {
            console.error('Lỗi khi đọc file:', err);
            res.status(500).json({ message: 'Lỗi khi đọc file.' });
        });

    } catch (error) {
        console.error('Lỗi khi xem file:', error);
        res.status(500).json({ message: 'Lỗi khi xem file.', error: error.message });
    }
};