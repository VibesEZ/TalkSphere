const Chat = require('../models/chatModel');
const User = require('../models/userModel');

// @desc    Create or fetch one-on-one chat
// @route   POST /api/chat
// @access  Protected
const accessChat = async (req, res) => {
    const { userId } = req.body; // The user ID to chat with

    if (!userId) {
        return res.status(400).send({ message: "UserId param not sent with request" });
    }

    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } }, // Logged in user
            { users: { $elemMatch: { $eq: userId } } },      // The other user
        ],
    })
        .populate("users", "-password")
        .populate("latestMessage");

    // Further populating sender info
    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name profilePic email",
    });

    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        // Create a new chat
        var chatData = {
            chatName: "sender", // Not really used for 1-on-1
            isGroupChat: false,
            users: [req.user._id, userId],
        };

        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
            res.status(200).json(FullChat);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

const fetchChats = async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "name profilePic email",
                });
                res.status(200).send(results);
            });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};


// @desc    Create a new group chat
// @route   POST /api/chat/group
// @access  Protected
const createGroupChat = async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please fill all the fields" });
    }

    var users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res
            .status(400)
            .send("More than 2 users are required to form a group chat");
    }

    users.push(req.user); // Add the creator to the group

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

// @desc    Rename a group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = async (req, res) => {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { chatName: chatName },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!updatedChat) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(updatedChat);
    }
};

// @desc    Add user to a group
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    const added = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { users: userId } },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!added) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(added);
    }
};

// @desc    Remove user from a group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        { $pull: { users: userId } },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!removed) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(removed);
    }
};

// @desc    Pin a message to a chat
// @route   PUT /api/chat/pin
// @access  Protected
const pinMessageToChat = async (req, res) => {
    const { chatId, messageId } = req.body;
    try {
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { pinnedMessage: messageId },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!updatedChat) {
            return res.status(404).json({ message: "Chat Not Found" });
        }
        res.status(200).json(updatedChat);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// You would create other functions like fetchChats, createGroupChat, etc. here
module.exports = {
    accessChat,
    fetchChats,
    pinMessageToChat,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup
};