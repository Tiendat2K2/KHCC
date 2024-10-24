const express = require('express');
const router = express.Router();
const { 
    getDulieu, 
    addDulieu, 
    updateDulieu, 
    deleteDulieu,
    getDulieuCount,
    downloadFile,
    viewFile
    ,
    getDulieuID
} = require('../controllers/DulieuController');
const { authMiddleware, isAdmin, isTeacher } = require('../middleware/authMiddleware');
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
 * /api/dulieu:
 *   get:
 *     summary: Retrieve all Dulieu entries
 *     tags: [Dulieu]
 *     security:
 *       - BearerAuth: []  
 *     responses:
 *       200:
 *         description: Successfully retrieved all Dulieu entries
 *       500:
 *         description: Server error
 */
router.get('/api/dulieu', authMiddleware, getDulieu);
/**
 * @swagger
 * /api/dulieu/addDulieu:
 *   post:
 *     summary: Add a new Dulieu entry
 *     tags: [Dulieu]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               Tieude:
 *                 type: string
 *               Files:
 *                 type: string
 *                 format: binary
 *               Nhomtacgia:
 *                 type: string
 *               Tapchixuatban:
 *                 type: string
 *               Thongtinmatapchi:
 *                 type: string
 *               Namhoc:
 *                 type: integer
 *               Ghichu:
 *                 type: string
 *               UserID:
 *                 type: integer
 *               ChuyenNganhID:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Successfully added a new Dulieu entry
 *       400:
 *         description: Bad request - Missing required fields or invalid data
 *       401:
 *         description: Unauthorized - Invalid or missing Bearer token
 *       404:
 *         description: UserID or ChuyenNganhID not found
 *       500:
 *         description: Server error - Something went wrong
 */
router.post('/api/dulieu/addDulieu', authMiddleware, addDulieu);

/**
 * @swagger
 * /api/dulieu/updateDulieu/{ID}:
 *   put:
 *     summary: Update a Dulieu entry
 *     tags: [Dulieu]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ID
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the Dulieu entry
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               Tieude:
 *                 type: string
 *               Files:
 *                 type: string
 *                 format: binary
 *               Nhomtacgia:
 *                 type: string
 *               Tapchixuatban:
 *                 type: string
 *               Thongtinmatpchi:
 *                 type: string
 *               Namhoc:
 *                 type: integer
 *               Ghichu:
 *                 type: string
 *               UserID:
 *                 type: integer
 *               ChuyenNganhID:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Successfully updated the Dulieu entry
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Dulieu entry not found
 *       500:
 *         description: Server error
 */
router.put('/api/dulieu/updateDulieu/:ID', authMiddleware, updateDulieu);

/**
 * @swagger
 * /api/dulieu/deleteDulieu/{ID}:
 *   delete:
 *     summary: Delete a Dulieu entry
 *     tags: [Dulieu]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ID
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the Dulieu entry
 *     responses:
 *       200:
 *         description: Successfully deleted the Dulieu entry
 *       404:
 *         description: Dulieu entry not found
 *       500:
 *         description: Server error
 */
router.delete('/api/dulieu/deleteDulieu/:ID', authMiddleware, deleteDulieu);
/**
 * @swagger
 * /api/dulieu/count:
 *   get:
 *     summary: Get the count of Dulieu entries
 *     tags: [Dulieu]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the count of Dulieu entries
 *       500:
 *         description: Server error
 */

router.get('/api/dulieu/count', authMiddleware, getDulieuCount);
/**
 * @swagger
 * /api/dulieu/download/{ID}:
 *   get:
 *     summary: Download a file associated with a Dulieu entry
 *     tags: [Dulieu]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ID
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the Dulieu entry
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File or Dulieu entry not found
 *       500:
 *         description: Server error
 */
router.get('/api/dulieu/download/:ID', authMiddleware, downloadFile);
/**
 * @swagger
 * /api/dulieu/view/{ID}:
 *   get:
 *     summary: View a file (PDF or Word) associated with a Dulieu entry
 *     tags: [Dulieu]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ID
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the Dulieu entry
 *     responses:
 *       200:
 *         description: File viewed successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File or Dulieu entry not found
 *       500:
 *         description: Server error
 */
router.get('/api/dulieu/view/:ID', authMiddleware, viewFile);
/**
 * @swagger
 * /api/dulieu/getDulieuID/{UserID}:
 *   get:
 *     summary: Retrieve a Dulieu entry by UserID
 *     tags: [Dulieu]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: UserID
 *         required: true
 *         description: The UserID of the Dulieu entry to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved the Dulieu entry
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ID:
 *                   type: integer
 *                 Tieude:
 *                   type: string
 *                 Files:
 *                   type: string
 *                 Nhomtacgia:
 *                   type: string
 *                 Tapchixuatban:
 *                   type: string
 *                 Thongtinmatapchi:
 *                   type: string
 *                 Namhoc:
 *                   type: integer
 *                 Ghichu:
 *                   type: string
 *                 UserID:
 *                   type: integer
 *                 ChuyenNganhID:
 *                   type: integer
 *       404:
 *         description: Dulieu entry not found
 *       500:
 *         description: Server error
 */
router.get('/api/dulieu/getDulieuID/:UserID', authMiddleware, getDulieuID);
module.exports = router;
