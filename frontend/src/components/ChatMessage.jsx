import React from 'react';
import { User } from 'lucide-react';

const ChatMessage = ({ message }) => {
    const isUser = message.role === 'user';
    const Icon = isUser ? User : ({ size, className }) => <img src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/663152d83030315c139c829f_65f1a6037471208d0a5198e2_ollama.png" alt="AI" className={`ai-avatar ${className}`} style={{ width: size, height: size }} />;

    return (
        <div className={`chat-message${isUser ? ' chat-message-user' : ' chat-message-ai'}`}>
            <div className="chat-message-inner">
                <div className={`chat-message-avatar${isUser ? ' user-avatar' : ' ai-avatar-bg'}`}>
                    <Icon size={32} className="icon" />
                </div>
                <div className="chat-message-content">
                    <p>{message.content}</p>
                </div>
            </div>
        </div>
    );
};

export default ChatMessage; 