const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup,
    pinMessageToChat // New import
} = require('../controllers/chatController');

const router = express.Router();

router.route('/').post(protect, accessChat).get(protect, fetchChats);
router.route('/group').post(protect, createGroupChat);
router.route('/rename').put(protect, renameGroup);
router.route('/groupadd').put(protect, addToGroup);
router.route('/groupremove').put(protect, removeFromGroup);
router.route('/pin').put(protect, pinMessageToChat); // New route for pinning

module.exports = router;