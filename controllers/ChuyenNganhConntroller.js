const { poolPromise } = require('../config/db');
const sql = require('mssql');
// Get all Chuyen Nganh
exports.getChuyenNganh = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT IDChuyenNganh, TenChuyenNganh, UserID FROM ChuyenNganh');
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Lỗi khi lấy Chuyên Ngành:', error.message);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy Chuyên Ngành.' });
    }
};
// Add new Chuyen Nganh
exports.addChuyenNganh = async (req, res) => {
    const { TenChuyenNganh, UserID } = req.body;
    
    // Check for missing fields
    if (!TenChuyenNganh || !UserID) {
        return res.status(400).json({ status: 0, message: 'Vui lòng cung cấp đầy đủ thông tin Tên Chuyên Ngành và UserID.' });
    }

    try {
        const pool = await poolPromise;

        // Check if TenChuyenNganh already exists
        const checkExisting = await pool.request()
            .input('TenChuyenNganh', sql.NVarChar, TenChuyenNganh)
            .query('SELECT COUNT(*) AS count FROM ChuyenNganh WHERE TenChuyenNganh = @TenChuyenNganh');

        if (checkExisting.recordset[0].count > 0) {
            return res.status(400).json({ status: 0, message: 'Tên Chuyên Ngành đã tồn tại. Vui lòng nhập tên khác.' });
        }

        // Proceed to insert the new Chuyen Nganh
        await pool.request()
            .input('TenChuyenNganh', sql.NVarChar, TenChuyenNganh)
            .input('UserID', sql.Int, UserID)
            .query('INSERT INTO ChuyenNganh (TenChuyenNganh, UserID) VALUES (@TenChuyenNganh, @UserID)');

        res.status(201).json({ status: 1, message: 'Chuyên Ngành đã được thêm thành công!' });
    } catch (error) {
        console.error('Lỗi khi thêm Chuyên Ngành:', error.message);
        res.status(500).json({ status: 0, message: 'Có lỗi xảy ra khi thêm Chuyên Ngành.' });
    }
};

// Update Chuyen Nganh
exports.updateChuyenNganh = async (req, res) => {
    const { IDChuyenNganh, TenChuyenNganh, UserID } = req.body;

    // Check for missing fields
    if (!IDChuyenNganh || !TenChuyenNganh || !UserID) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ các trường: IDChuyenNganh, TenChuyenNganh, UserID." });
    }

    try {
        const pool = await poolPromise;

        // Check if IDChuyenNganh exists
        const checkIDQuery = 'SELECT * FROM ChuyenNganh WHERE IDChuyenNganh = @IDChuyenNganh';
        const checkIDResult = await pool.request().input('IDChuyenNganh', IDChuyenNganh).query(checkIDQuery);

        // Check if UserID exists
        const checkUserIDQuery = 'SELECT * FROM Users WHERE UserID = @UserID';
        const checkUserIDResult = await pool.request().input('UserID', UserID).query(checkUserIDQuery);

        const errors = [];

        // Collect error messages
        if (checkIDResult.recordset.length === 0) {
            errors.push("IDChuyenNganh không tồn tại.");
        }

        if (checkUserIDResult.recordset.length === 0) {
            errors.push("UserID không tồn tại.");
        }

        // If errors exist, return them
        if (errors.length > 0) {
            return res.status(404).json({ message: errors.join(' ') });
        }

        // Check if the new TenChuyenNganh already exists (excluding current IDChuyenNganh)
        const checkNameQuery = 'SELECT COUNT(*) AS count FROM ChuyenNganh WHERE TenChuyenNganh = @TenChuyenNganh AND IDChuyenNganh <> @IDChuyenNganh';
        const checkNameResult = await pool.request()
            .input('TenChuyenNganh', TenChuyenNganh)
            .input('IDChuyenNganh', IDChuyenNganh)
            .query(checkNameQuery);

        if (checkNameResult.recordset[0].count > 0) {
            return res.status(400).json({ message: 'Tên Chuyên Ngành đã tồn tại. Vui lòng nhập tên khác.' });
        }

        // Proceed with the update if all checks are passed
        await pool.request()
            .input('IDChuyenNganh', IDChuyenNganh)
            .input('TenChuyenNganh', TenChuyenNganh)
            .input('UserID', UserID)
            .query('UPDATE ChuyenNganh SET TenChuyenNganh = @TenChuyenNganh, UserID = @UserID WHERE IDChuyenNganh = @IDChuyenNganh');

        res.status(200).json({ status: 1, message: 'Chuyên Ngành đã được cập nhật thành công!' });
    } catch (error) {
        console.error('Lỗi khi cập nhật Chuyên Ngành:', error.message);
        res.status(500).json({ message: 'Có lỗi xảy ra khi cập nhật Chuyên Ngành.' });
    }
};

// Delete Chuyen Nganh
exports.deleteChuyenNganh = async (req, res) => {
    const { IDChuyenNganh } = req.params; // Extract IDChuyenNganh from request parameters
    console.log(`Attempting to delete Chuyên Ngành with ID: ${IDChuyenNganh}`); // Add this line for debugging
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('IDChuyenNganh', IDChuyenNganh) // Bind IDChuyenNganh parameter
            .query('DELETE FROM ChuyenNganh WHERE IDChuyenNganh = @IDChuyenNganh');
        console.log(result); // Log the result of the deletion
        
        // Check if any rows were affected
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Chuyên Ngành không tìm thấy.' });
        }

        res.status(200).json({ status:1,message: 'Chuyên Ngành đã được xóa thành công!' });
    } catch (error) {
        console.error('Lỗi khi xóa Chuyên Ngành:', error.message);
        res.status(500).json({ message: 'Có lỗi xảy ra khi xóa Chuyên Ngành.' });
    }
};
exports.getChuyenNganhCount = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT COUNT(*) AS ChuyenNganhCount FROM ChuyenNganh');
        const count = result.recordset[0].ChuyenNganhCount;

        res.status(200).json({
            status: 1,
            message: 'Số lượng Chuyên Ngành đã được lấy thành công!',
            count: count,
        });
    } catch (error) {
        console.error('Lỗi khi lấy số lượng Chuyên Ngành:', error.message);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy số lượng Chuyên Ngành.' });
    }
};