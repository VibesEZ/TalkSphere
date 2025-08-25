import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import ScrollableChat from './ScrollableChat';
import ProfileModal from './ProfileModal';
import UpdateGroupChatModal from './UpdateGroupChatModal';
import EmojiPicker from './EmojiPicker';
import PinnedMessagesModal from './PinnedMessagesModal'; // Import the new modal
import { IoClose, IoPin } from 'react-icons/io5';

const ChatBox = ({
    currentChat,
    currentMessages,
    messageInput,
    setMessageInput,
    sendMessage,
    handleBack,
    loading,
    fetchMessages,
    isTyping,
    handleTyping,
    replyingTo,
    setReplyingTo,
    editingMessage,
    setEditingMessage,
    onDeleteMessage,
    onReactMessage,
    onStarMessage,
    onPinMessage,
}) => {
    const { user } = useAuth();
    const [isProfileModalOpen, setProfileModalOpen] = useState(false);
    const [isGroupModalOpen, setGroupModalOpen] = useState(false);
    const [fullEmojiPicker, setFullEmojiPicker] = useState(null);
    const [showPinnedModal, setShowPinnedModal] = useState(false); // New state for pinned modal
    const chatMessagesRef = useRef(null);
    const pickerWidth = 350;
    const pickerHeight = 450;

    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [currentMessages, isTyping]);

    const handleReply = (message) => {
        setReplyingTo(message);
    };

    const handleEdit = (message) => {
        setEditingMessage(message);
        setMessageInput(message.content);
    };

    const handleDelete = (message) => {
        onDeleteMessage(message);
    };

    const handleReact = (message, emoji) => {
        onReactMessage(message, emoji);
    };

    const handleStar = (message) => {
        onStarMessage(message);
    };

    const handlePin = (message) => {
        onPinMessage(message);
    };

    const handleFullEmojiPicker = (message, coordinates) => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let x = coordinates.x;
        let y = coordinates.y;

        if (x + pickerWidth > viewportWidth) {
            x = x - pickerWidth;
        }

        if (y + pickerHeight > viewportHeight) {
            y = y - pickerHeight;
        }

        setFullEmojiPicker({ message, x, y });
    };

    const handleMessageClick = (messageId) => {
        // Here you can implement the logic to scroll to the specific message
        // For now, we'll just close the modal.
        console.log("Scrolling to message:", messageId);
        setShowPinnedModal(false);
    };

    const getSender = (loggedUser, users) => {
        return users[0]?._id === loggedUser?._id ? users[1] : users[0];
    };

    const getSenderAvatar = (senderObject) => {
        return senderObject?.name?.substring(0, 2).toUpperCase() || '??';
    };

    const sender = currentChat ? getSender(user, currentChat.users) : null;

    if (!currentChat) {
        return (
            <div className="chat-box">
                <div className="welcome-state">
                    <h2>TalkSphere Web</h2>
                    <p>Select a user to start chatting.</p>
                </div>
            </div>
        );
    }

    const pinnedMessageCount = currentChat.pinnedMessages?.length || 0;
    const latestPinnedMessage = currentChat.pinnedMessages?.[pinnedMessageCount - 1];

    return (
        <>
            <div className="chat-box">
                <div className="chat-header">
                    <button className="back-btn" onClick={handleBack}>&#8592;</button>
                    <div
                        className="chat-header-clickable"
                        onClick={() => currentChat.isGroupChat ? setGroupModalOpen(true) : setProfileModalOpen(true)}
                    >
                        <div className="chat-avatar">
                            {!currentChat.isGroupChat
                                ? getSenderAvatar(sender)
                                : currentChat.chatName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="chat-header-info">
                            <h3>{!currentChat.isGroupChat ? sender?.name : currentChat.chatName}</h3>
                            <p>Click here for info</p>
                        </div>
                    </div>
                </div>
                {/* Consolidated pinned message bar */}
                {pinnedMessageCount > 0 && (
                    <div className="pinned-message-bar" onClick={() => setShowPinnedModal(true)}>
                        <IoPin />
                        <span>{pinnedMessageCount > 1 ? `${pinnedMessageCount} pinned messages` : latestPinnedMessage?.content}</span>
                    </div>
                )}
                <div className="chat-messages" ref={chatMessagesRef}>
                    {loading ? <p>Loading messages...</p> : <ScrollableChat messages={currentMessages} onReply={handleReply} onEdit={handleEdit} onDelete={handleDelete} onReact={handleReact} onStar={handleStar} onPin={handlePin} onFullEmojiPicker={handleFullEmojiPicker} />}
                    {isTyping ? <div className="typing-indicator">Typing...</div> : <></>}
                </div>

                <div className="chat-input-container">
                    {(replyingTo || editingMessage) && (
                        <div className="preview-container">
                            {replyingTo && (
                                <div className="reply-preview">
                                    <div className="reply-preview-content">
                                        Replying to: {replyingTo.content}
                                    </div>
                                    <button className="close-preview-btn" onClick={() => setReplyingTo(null)}>
                                        <IoClose />
                                    </button>
                                </div>
                            )}
                            {editingMessage && (
                                <div className="edit-preview">
                                    <div className="edit-preview-content">
                                        Editing message: {editingMessage.content}
                                    </div>
                                    <button className="close-preview-btn" onClick={() => setEditingMessage(null)}>
                                        <IoClose />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    <form className="chat-input-form" onSubmit={sendMessage}>
                        <input
                            type="text"
                            className="chat-input"
                            value={messageInput}
                            onChange={(e) => {
                                setMessageInput(e.target.value);
                                handleTyping(e);
                            }}
                            placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
                            required
                        />
                        <button type="submit" className="send-btn" title="Send">&#10148;</button>
                    </form>
                </div>
            </div>

            {fullEmojiPicker && (
                <EmojiPicker
                    onEmojiSelect={(emoji) => onReactMessage(fullEmojiPicker.message, emoji)}
                    onClose={() => setFullEmojiPicker(null)}
                    style={{ top: fullEmojiPicker.y, left: fullEmojiPicker.x }}
                />
            )}

            <ProfileModal user={sender} isOpen={isProfileModalOpen} onClose={() => setProfileModalOpen(false)} />
            <UpdateGroupChatModal isOpen={isGroupModalOpen} onClose={() => setGroupModalOpen(false)} fetchMessages={fetchMessages} />
            <PinnedMessagesModal
                isOpen={showPinnedModal}
                onClose={() => setShowPinnedModal(false)}
                pinnedMessages={currentChat.pinnedMessages || []}
                onMessageClick={handleMessageClick}
            />
        </>
    );
};

export default ChatBox;