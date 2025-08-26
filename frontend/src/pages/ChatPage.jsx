// frontend/src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { fetchChats, fetchMessages, sendMessage as sendMessageAPI, deleteMessage as deleteMessageAPI, updateMessage as updateMessageAPI, reactToMessage as reactToMessageAPI, starMessage as starMessageAPI, pinMessage as pinMessageAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';
import "../styles/chat.css";

import ChatList from '../components/ChatList';
import ChatBox from '../components/ChatBox';

const ChatPage = () => {
    const { user, logout } = useAuth();
    const { selectedChat, setSelectedChat, chats, setChats } = useChat();
    const selectedChatRef = useRef(selectedChat);

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);

    const socket = useSocket();

    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [emojiPicker, setEmojiPicker] = useState(null);

    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        if (!socket) return;
        socket.on('typing', () => setIsTyping(true));
        socket.on('stop typing', () => setIsTyping(false));
    }, [socket]);

    const handleTyping = (e) => {
        setMessageInput(e.target.value);
        if (!socket) return;
        socket.emit('typing', selectedChat._id);
        if (typingTimeout) clearTimeout(typingTimeout);
        const timer = setTimeout(() => {
            socket.emit('stop typing', selectedChat._id);
        }, 3000);
        setTypingTimeout(timer);
    };

    useEffect(() => {
        if (socket) {
            const getChats = async () => {
                try {
                    const { data } = await fetchChats();
                    setChats(data);
                    data.forEach(chat => socket.emit("join chat", chat._id));
                } catch (error) {
                    toast.error("Failed to load chats");
                }
            };
            getChats();
        }
    }, [setChats, socket]);

    useEffect(() => {
        if (!selectedChat) return;
        const getMessages = async () => {
            setLoading(true);
            try {
                const { data } = await fetchMessages(selectedChat._id);
                setMessages(data);
            } catch (error) {
                toast.error("Failed to load messages");
            } finally {
                setLoading(false);
            }
        };
        getMessages();
    }, [selectedChat]);

    useEffect(() => {
        if (!socket) return;
        const messageReceivedHandler = (newMessage) => {
            setChats((prevChats) =>
                prevChats.map((chat) =>
                    chat._id === newMessage.chat._id ? { ...chat, latestMessage: newMessage } : chat
                )
            );
            if (selectedChatRef.current && selectedChatRef.current._id === newMessage.chat._id) {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            } else {
                if (newMessage.sender._id !== user._id) {
                    toast.info(`New message in ${newMessage.chat.isGroupChat ? newMessage.chat.chatName : newMessage.sender.name}`);
                }
            }
        };

        const messageUpdatedHandler = (updatedMessage) => {
            setMessages((prevMessages) =>
                prevMessages.map((m) => (m._id === updatedMessage._id ? updatedMessage : m))
            );
            setChats((prevChats) =>
                prevChats.map((c) =>
                    c._id === updatedMessage.chat._id
                        ? { ...c, latestMessage: updatedMessage }
                        : c
                )
            );
        };

        socket.on("message received", messageReceivedHandler);
        socket.on("message updated", messageUpdatedHandler);

        return () => {
            socket.off("message received", messageReceivedHandler);
            socket.off("message updated", messageUpdatedHandler);
        };
    }, [socket, setChats, selectedChat, user._id]);



    const sendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;

        try {
            if (editingMessage) {
                const { data } = await updateMessageAPI(editingMessage._id, { content: messageInput });
                setMessages(messages.map(m => m._id === data._id ? { ...m, content: data.content } : m));
                toast.success("Message updated!");
            } else {
                const { data } = await sendMessageAPI({
                    content: messageInput,
                    chatId: selectedChat._id,
                    replyToId: replyingTo ? replyingTo._id : null,
                });
                socket.emit("new message", data);
                setMessages([...messages, data]);
                setChats(
                    chats.map((chat) =>
                        chat._id === selectedChat._id ? { ...chat, latestMessage: data } : chat
                    )
                );
            }

            setMessageInput('');
            setReplyingTo(null);
            setEditingMessage(null);
        } catch (error) {
            toast.error("Failed to send/update message");
        }
    };

    const handleReact = async (message, emoji) => {
        try {
            const { data } = await reactToMessageAPI(message._id, emoji);
            const updatedMessages = messages.map(m => m._id === data._id ? data : m);
            setMessages(updatedMessages);
            toast.success("Reaction updated!");
        } catch (error) {
            toast.error("Failed to react to message.");
        }
    };

    const handleStar = async (message) => {
        try {
            const { data } = await starMessageAPI(message._id);
            const isStarred = message.starredBy.includes(user._id);

            const updatedMessages = messages.map(m => {
                if (m._id === message._id) {
                    const updatedStarredBy = isStarred
                        ? m.starredBy.filter(id => id !== user._id)
                        : [...m.starredBy, user._id];
                    return { ...m, starredBy: updatedStarredBy };
                }
                return m;
            });
            setMessages(updatedMessages);
            toast.success(data.message);
        } catch (error) {
            toast.error("Failed to star/unstar message.");
        }
    };

    const handlePin = async (message) => {
        try {
            const { data } = await pinMessageAPI(selectedChat._id, message._id);
            // Update the selected chat state immediately with the new data
            setSelectedChat(data);
            // Update the chats list as well
            setChats(
                chats.map((chat) =>
                    chat._id === data._id ? data : chat
                )
            );
            toast.success(`Message ${data.pinnedMessages.some(m => m._id === message._id) ? "pinned" : "unpinned"}!`);
        } catch (error) {
            toast.error("Failed to pin message.");
        }
    };

    const handleDeleteMessage = async (message) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        try {
            await deleteMessageAPI(message._id);
            setMessages(messages.filter(m => m._id !== message._id));
            toast.success("Message deleted!");
        } catch (error) {
            toast.error("Failed to delete message.");
        }
    }

    const handleBack = () => setSelectedChat(null);

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const handleLogoutClick = () => setShowLogoutConfirm(true);
    const handleLogoutConfirm = () => {
        setShowLogoutConfirm(false);
        logout();
    };
    const handleLogoutCancel = () => setShowLogoutConfirm(false);

    return (
        <>
            <div className={`chat-layout ${selectedChat ? 'view-chat' : ''}`}>
                <ChatList />
                <ChatBox
                    currentChat={selectedChat}
                    currentMessages={messages}
                    messageInput={messageInput}
                    setMessageInput={setMessageInput}
                    sendMessage={sendMessage}
                    handleBack={handleBack}
                    loading={loading}
                    isTyping={isTyping}
                    handleTyping={handleTyping}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                    editingMessage={editingMessage}
                    setEditingMessage={setEditingMessage}
                    onDeleteMessage={handleDeleteMessage}
                    onReactMessage={handleReact}
                    onStarMessage={handleStar}
                    onPinMessage={handlePin}
                    emojiPicker={emojiPicker}
                    setEmojiPicker={setEmojiPicker}
                />
            </div>
            {showLogoutConfirm && (
                <div className="logout-confirm-overlay">
                    <div className="logout-confirm-modal">
                        <p>Are you sure you want to logout?</p>
                        <button onClick={handleLogoutConfirm}>Yes</button>
                        <button onClick={handleLogoutCancel}>No</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatPage;