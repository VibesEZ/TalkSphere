const express = require('express');
const {
    registerUser,
    loginUser,
    verifyOtp,
    resetPassword,
    forgotPassword,
    allUsers,
    updateUserProfile,
    updateUserPassword,
    getAdminStats,
    getUsers,
    updateUserRole,
    deleteUser,
    googleLogin
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware'); // Import admin middleware

const router = express.Router();

router.route('/').get(protect, allUsers);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);
router.route('/profile').put(protect, updateUserProfile);
router.post('/forgot-password', forgotPassword);
router.route('/password').put(protect, updateUserPassword);
router.post('/verify-reset-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// Add the new admin route
router.route('/admin/stats').get(protect, admin, getAdminStats);
router.route('/admin/users').get(protect, admin, getUsers);
router
    .route('/admin/users/:id')
    .delete(protect, admin, deleteUser)
    .put(protect, admin, updateUserRole);


module.exports = router;