import React from 'react';
import { createPortal } from 'react-dom';
import { IoClose } from 'react-icons/io5';
import '../styles/PinnedMessagesModal.css';

const PinnedMessagesModal = ({ isOpen, onClose, pinnedMessages, onMessageClick }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="pinned-messages-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Pinned Messages</h2>
                    <button onClick={onClose} className="modal-close-btn">
                        <IoClose size={24} />
                    </button>
                </div>
                <div className="pinned-messages-list">
                    {pinnedMessages.map((message) => (
                        <div key={message._id} className="pinned-message-item" onClick={() => onMessageClick(message._id)}>
                            <div className="message-info">
                                <span className="sender-name">{message.sender.name}</span>
                                <span className="message-content">{message.content}</span>
                            </div>
                        </div>
                    ))}
                    {pinnedMessages.length === 0 && (
                        <p className="no-messages-text">No pinned messages in this chat.</p>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PinnedMessagesModal;