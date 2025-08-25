const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { sendMessage, allMessages, deleteMessage, updateMessage, reactToMessage, starMessage } = require('../controllers/messageController');

const router = express.Router();

router.route('/').post(protect, sendMessage);
router.route('/:chatId').get(protect, allMessages);
router.route('/:messageId').delete(protect, deleteMessage);
router.route('/:messageId').put(protect, updateMessage);
router.route('/:messageId/react').put(protect, reactToMessage); // New: React route
router.route('/:messageId/star').put(protect, starMessage); // New: Star route

module.exports = router;