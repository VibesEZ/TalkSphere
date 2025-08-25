import React, { useState, useRef, useEffect } from 'react';
import Picker from 'emoji-picker-react';
import '../styles/chat.css';

const EmojiPicker = ({ onEmojiSelect, onClose, style }) => {
    const pickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleEmojiClick = (emojiObject, event) => {
        onEmojiSelect(emojiObject.emoji);
        onClose();
    };

    return (
        <div ref={pickerRef} className="full-emoji-picker" style={style}>
            <Picker onEmojiClick={handleEmojiClick} />
        </div>
    );
};

export default EmojiPicker;