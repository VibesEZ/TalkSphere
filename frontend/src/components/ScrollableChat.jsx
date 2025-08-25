import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext'; // Import the useChat hook
import { toast } from 'react-toastify';
import { IoArrowForward, IoCopy, IoTrash, IoStar, IoPencil, IoPin, IoCodeOutline } from 'react-icons/io5';

const ScrollableChat = ({ messages, onReply, onEdit, onDelete, onReact, onStar, onPin, onFullEmojiPicker }) => {
    const { user } = useAuth();
    const { selectedChat } = useChat(); // Added to check for pinned status
    const [contextMenu, setContextMenu] = useState(null);
    const [hoveredMessage, setHoveredMessage] = useState(null);
    const [showQuickReactions, setShowQuickReactions] = useState(null);
    const contextMenuRef = useRef();

    const isMessageStarredByUser = (message) => message?.starredBy?.includes(user?._id);
    const isMessagePinnedInChat = (messageId) => selectedChat.pinnedMessages.some(pin => pin._id === messageId);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
                setContextMenu(null);
            }
            setShowQuickReactions(null);
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleContextMenu = (event, message) => {
        event.preventDefault();

        const menuWidth = 200;
        const menuHeight = 300;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let x = event.clientX;
        let y = event.clientY;

        if (x + menuWidth > viewportWidth) {
            x = viewportWidth - menuWidth - 10;
        }

        if (y + menuHeight > viewportHeight) {
            y = viewportHeight - menuHeight - 10;
        }

        setContextMenu({
            messageId: message._id,
            x: x,
            y: y,
            message,
        });
        setShowQuickReactions(null);
    };

    const handleActionClick = (action, message) => {
        setContextMenu(null);
        switch (action) {
            case 'copy':
                navigator.clipboard.writeText(message.content)
                    .then(() => toast.success('Message copied to clipboard!'))
                    .catch(err => toast.error('Failed to copy message.'));
                break;
            case 'reply':
                if (onReply) onReply(message);
                break;
            case 'pin':
                if (onPin) onPin(message);
                break;
            case 'star':
                if (onStar) onStar(message);
                break;
            case 'edit':
                if (onEdit) onEdit(message);
                break;
            case 'delete':
                if (onDelete) onDelete(message);
                break;
            default:
                break;
        }
    };

    const renderReply = (message) => {
        if (!message.replyTo) return null;
        return (
            <div className="reply-content">
                <div className="reply-indicator">
                    <IoArrowForward />
                </div>
                <div className="reply-text">
                    Replying to: {message.replyTo.content}
                </div>
            </div>
        );
    };

    const renderReactions = (message) => {
        if (!message.reactions || message.reactions.length === 0) return null;

        const uniqueReactions = message.reactions.reduce((acc, current) => {
            const existing = acc.find(item => item.emoji === current.emoji);
            if (existing) {
                existing.count++;
                if (current.user.toString() === user._id.toString()) {
                    existing.isUserReacted = true;
                }
            } else {
                acc.push({
                    emoji: current.emoji,
                    count: 1,
                    isUserReacted: current.user.toString() === user._id.toString()
                });
            }
            return acc;
        }, []);

        return (
            <div className="reactions-container">
                {uniqueReactions.map((reaction, index) => (
                    <span
                        key={index}
                        className={`reaction-badge ${reaction.isUserReacted ? 'reacted-by-user' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onReact(message, reaction.emoji);
                            setShowQuickReactions(null);
                        }}
                    >
                        {reaction.emoji} {reaction.count > 1 && reaction.count}
                    </span>
                ))}
            </div>
        );
    };

    const handleQuickReactClick = (e, message) => {
        e.stopPropagation();
        if (showQuickReactions === message._id) {
            setShowQuickReactions(null);
        } else {
            setShowQuickReactions(message._id);
        }
    };

    const handleFullPickerClick = (e, message) => {
        e.stopPropagation();
        const rect = e.target.getBoundingClientRect();
        const coordinates = { x: rect.right + 10, y: rect.top - 200 };
        if (onFullEmojiPicker) {
            onFullEmojiPicker(message, coordinates);
        }
        setShowQuickReactions(null);
    };

    return (
        <>
            {messages && messages.map((m) => {
                const isSentByMe = m.sender._id === user._id;
                const isStarred = isMessageStarredByUser(m);
                return (
                    <div
                        className={`message ${isSentByMe ? 'sent' : 'received'}`}
                        key={m._id}
                        onMouseEnter={() => setHoveredMessage(m._id)}
                        onMouseLeave={() => setHoveredMessage(null)}
                        onContextMenu={(e) => handleContextMenu(e, m)}
                        onClick={(e) => {
                            if (window.innerWidth < 768) {
                                handleContextMenu(e, m);
                            }
                        }}
                    >
                        {(hoveredMessage === m._id || showQuickReactions === m._id) && (
                            <>
                                <button
                                    className="quick-react-btn"
                                    onClick={(e) => handleQuickReactClick(e, m)}
                                >
                                    😀
                                </button>
                                {showQuickReactions === m._id && (
                                    <div className="quick-reactions-bar">
                                        <span onClick={(e) => { e.stopPropagation(); onReact(m, '👍'); setShowQuickReactions(null); }}>👍</span>
                                        <span onClick={(e) => { e.stopPropagation(); onReact(m, '❤️'); setShowQuickReactions(null); }}>❤️</span>
                                        <span onClick={(e) => { e.stopPropagation(); onReact(m, '😂'); setShowQuickReactions(null); }}>😂</span>
                                        <span onClick={(e) => { e.stopPropagation(); onReact(m, '😮'); setShowQuickReactions(null); }}>😮</span>
                                        <span onClick={(e) => { e.stopPropagation(); onReact(m, '😢'); setShowQuickReactions(null); }}>😢</span>
                                        <button className="full-picker-btn" onClick={(e) => handleFullPickerClick(e, m)}>
                                            +
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                        <div className="message-content">
                            {!isSentByMe && m.chat.isGroupChat && (
                                <p className="sender-name">{m.sender.name}</p>
                            )}
                            {renderReply(m)}
                            <p>{m.content}</p>
                            <span className="timestamp">
                                {isStarred && <IoStar className="star-icon" />}
                                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {renderReactions(m)}
                        </div>
                    </div>
                );
            })}

            {contextMenu && (
                <ul
                    className="message-context-menu"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    ref={contextMenuRef}
                >
                    <li onClick={() => onReply(contextMenu.message)}>
                        <IoArrowForward /> Reply
                    </li>
                    <li onClick={() => handleActionClick('copy', contextMenu.message)}>
                        <IoCopy /> Copy
                    </li>
                    <li onClick={(e) => onFullEmojiPicker(contextMenu.message, { x: contextMenu.x + 10, y: contextMenu.y - 200 })}>
                        <IoCodeOutline /> React
                    </li>
                    {/* Dynamic Pin/Unpin option */}
                    <li onClick={() => handleActionClick('pin', contextMenu.message)}>
                        <IoPin />
                        {isMessagePinnedInChat(contextMenu.message._id) ? 'Unpin Message' : 'Pin Message'}
                    </li>
                    <li onClick={() => handleActionClick('star', contextMenu.message)}>
                        {isMessageStarredByUser(contextMenu.message) ? <IoStar /> : <IoStar />}
                        {isMessageStarredByUser(contextMenu.message) ? 'Unstar' : 'Star'}
                    </li>
                    {contextMenu.message.sender._id === user._id && (
                        <li onClick={() => handleActionClick('edit', contextMenu.message)}>
                            <IoPencil /> Edit
                        </li>
                    )}
                    <li onClick={() => handleActionClick('delete', contextMenu.message)} className="delete-option">
                        <IoTrash /> Delete
                    </li>
                </ul>
            )}
        </>
    );
};

export default ScrollableChat;