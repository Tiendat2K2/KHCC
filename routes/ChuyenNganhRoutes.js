const express = require('express');
const router = express.Router();
const { getChuyenNganh, addChuyenNganh, updateChuyenNganh, deleteChuyenNganh,getChuyenNganhCount } = require('../controllers/ChuyenNganhConntroller'); // Adjust path if necessary
const { authMiddleware ,isAdmin } = require('../middleware/authMiddleware');
/**
 * @swagger
 * /api/chuyennganh:
 *   get:
 *     summary: Retrieve all Chuyen Nganh
 *     tags: [ChuyenNganh]
 *     responses:
 *       200:
 *         description: A list of Chuyen Nganh
 *         content:
 *         
 */
/**
 * @swagger
 * /api/chuyennganh/addChuyenNganh:
 *   post:
 *     summary: Add a new Chuyen Nganh
 *     tags: [ChuyenNganh]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               TenChuyenNganh:
 *                 type: string
 *                 description: The name of the Chuyen Nganh
 *               UserID:
 *                 type: integer
 *                 description: The ID of the user associated with the Chuyen Nganh
 *     responses:
 *       201:
 *         description: Chuyen Nganh created successfully
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/chuyennganh/updateChuyenNganh:
 *   put:
 *     summary: Update an existing Chuyen Nganh
 *     tags: [ChuyenNganh]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               IDChuyenNganh:
 *                 type: integer
 *                 description: The unique identifier for the Chuyen Nganh
 *               TenChuyenNganh:
 *                 type: string
 *                 description: The name of the Chuyen Nganh
 *               UserID:
 *                 type: integer
 *                 description: The ID of the user associated with the Chuyen Nganh
 *     responses:
 *       200:
 *         description: Chuyen Nganh updated successfully
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/chuyennganh/deleteChuyenNganh/{id}:
 *   delete:
 *     summary: Delete a Chuyen Nganh
 *     tags: [ChuyenNganh]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: IDChuyenNganh of the Chuyen Nganh to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chuyên Ngành đã được xóa thành công!
 *         content:
 */
/**
 * @swagger
 * /api/chuyennganh/count:
 *   get:
 *     summary: Get the count of Chuyên Ngành
 *     tags: [ChuyenNganh]
 *     responses:
 *       200:
 *         description: Successful response with the count of Chuyên Ngành
 *         content:

 */
router.get('/api/chuyennganh', authMiddleware, getChuyenNganh);
router.post('/api/chuyennganh/addChuyenNganh', authMiddleware, isAdmin,addChuyenNganh);
router.put('/api/chuyennganh/updateChuyenNganh', authMiddleware,isAdmin, updateChuyenNganh);
router.delete('/api/chuyennganh/deleteChuyenNganh/:IDChuyenNganh', authMiddleware,isAdmin, deleteChuyenNganh);
router.get('/api/chuyennganh/count', authMiddleware,isAdmin,getChuyenNganhCount);

module.exports = router;