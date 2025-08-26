const Message = require('../models/messageModel');
const User = require('../models/userModel');
const Chat = require('../models/chatModel');

const sendMessage = async (req, res) => {
    const { content, chatId, replyToId } = req.body;

    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
        replyTo: replyToId || null,
    };

    try {
        var message = await Message.create(newMessage);

        message = await message.populate("sender", "name profilePic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name profilePic email",
        });

        if (message.replyTo) {
            message = await message.populate("replyTo", "content");
        }

        await Chat.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message,
        });

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

const allMessages = async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name profilePic email")
            .populate("chat")
            .populate("replyTo", "content"); // Populate replyTo
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

const deleteMessage = async (req, res) => {
    const { messageId } = req.params;

    try {
        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Check if the logged-in user is the sender of the message
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this message" });
        }

        await Message.deleteOne({ _id: messageId });
        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const updateMessage = async (req, res) => {
    const { messageId } = req.params;
    const { content } = req.body;

    try {
        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to edit this message" });
        }

        message.content = content;
        const updatedMessage = await message.save();

        res.status(200).json(updatedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const reactToMessage = async (req, res) => {
    const { messageId } = req.params;
    const { emoji } = req.body;

    try {
        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        const existingReactionIndex = message.reactions.findIndex(
            r => r.user.toString() === req.user._id.toString()
        );

        if (existingReactionIndex !== -1) {
            if (message.reactions[existingReactionIndex].emoji === emoji) {
                message.reactions.splice(existingReactionIndex, 1);
            } else {
                message.reactions[existingReactionIndex].emoji = emoji;
            }
        } else {
            message.reactions.push({ user: req.user._id, emoji });
        }

        await message.save();

        // New: Populate the sender and other necessary fields before sending the response
        const populatedMessage = await Message.findById(message._id)
            .populate("sender", "name profilePic email")
            .populate({
                path: "chat",
                populate: {
                    path: "users",
                    select: "name profilePic email",
                }
            });

        if (populatedMessage && populatedMessage.chat && populatedMessage.chat._id) {
            const io = require('../server').io;
            io.to(populatedMessage.chat._id.toString()).emit("message updated", populatedMessage);
        }

        res.status(200).json(populatedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const starMessage = async (req, res) => {
    const { messageId } = req.params;

    try {
        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        const isStarred = message.starredBy.some(
            (userId) => userId.toString() === req.user._id.toString()
        );

        if (isStarred) {
            // Unstar the message
            message.starredBy.pull(req.user._id);
            await message.save();
            res.status(200).json({ message: "Message unstarred!" });
        } else {
            // Star the message
            message.starredBy.push(req.user._id);
            await message.save();
            res.status(200).json({ message: "Message starred!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { sendMessage, allMessages, deleteMessage, updateMessage, reactToMessage, starMessage };