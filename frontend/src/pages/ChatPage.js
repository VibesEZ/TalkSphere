import React, { useState } from 'react';
import ChatList from '../components/ChatList';
import ChatBox from '../components/ChatBox';
import { useAuth } from '../context/AuthContext';

const ChatPage = () => {
    const [selectedChat, setSelectedChat] = useState(null);
    const { user, logout } = useAuth();

    return (
        <p>
            Chatpage
        </p>
    );
};

export default ChatPage;