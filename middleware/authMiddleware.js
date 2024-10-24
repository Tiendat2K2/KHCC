const jwt = require('jsonwebtoken');

// Middleware to verify token
const authMiddleware = (req, res, next) => {
    // Get token from the authorization header
    const token = req.headers['authorization']?.split(' ')[1];

    // Check if token exists
    if (!token) {
        return res.status(401).json({ message: 'Không có token' }); // No token provided
    }
    
    // Verify token
    jwt.verify(token, process.env.access_token, (err, decoded) => { // Ensure your secret key is set in environment variables
        if (err) {
            return res.status(403).json({ message: 'Token không hợp lệ' }); // Invalid token
        }
        // Store user information in req for later use
        req.user = decoded; // Store user info in req object
        next(); // Proceed to the next middleware or route
    });
};
// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.roleId === 1) {
        next();
    } else {
        res.status(403).json({ message: 'Truy cập bị từ chối. Yêu cầu quyền admin.' });
    }
};

// Middleware to check if user is a teacher
const isTeacher = (req, res, next) => {
    if (req.user && req.user.roleId === 2) {
        next();
    } else {
        res.status(403).json({ message: 'Truy cập bị từ chối. Yêu cầu quyền giáo viên.' });
    }
};

// Middleware to check if user is either an admin or the teacher themselves
const isAdminOrSelf = (req, res, next) => {
    const requestedUserId = parseInt(req.params.id || req.body.UserID);
    if (req.user && (req.user.roleId === 1 || req.user.id === requestedUserId)) {
        next();
    } else {
        res.status(403).json({ message: 'Truy cập bị từ chối. Bạn không có quyền thực hiện hành động này.' });
    }
};

module.exports = {
    authMiddleware,
    isAdmin,
    isTeacher,
    isAdminOrSelf
};
