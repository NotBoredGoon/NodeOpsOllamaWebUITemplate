import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import ChatMessage from './ChatMessage';

const ChatView = ({ currentChat, onSendMessage, selectedModel, setSelectedModel, availableModels }) => {
    const [input, setInput] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentChat.messages]);

    const handleSend = () => {
        if (input.trim()) {
            onSendMessage(input, currentChat.id);
            setInput('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    
    return (
        <div className="chat-view">
            <div className="chat-header">
                 <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="model-select"
                    disabled={!availableModels || availableModels.length === 0}
                >
                    {availableModels && availableModels.length > 0 ? (
                        availableModels.map(model => (
                            <option key={model.id} value={model.id}>{model.name}</option>
                        ))
                    ) : (
                        <option value="">No models available</option>
                    )}
                </select>
            </div>

            <div className="chat-messages">
                {currentChat.messages.length === 0 ? (
                    <div className="chat-empty">
                         <img src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/663152d83030315c139c829f_65f1a6037471208d0a5198e2_ollama.png" alt="Ollama Logo" className="ollama-logo" />
                        <h2>Self-Hosted LLM Chat</h2>
                        <p>How can I help you today?</p>
                    </div>
                ) : (
                    <div>
                        {currentChat.messages.map((msg, index) => (
                            <ChatMessage key={index} message={msg} />
                        ))}
                         <div ref={chatEndRef} />
                    </div>
                )}
            </div>

            <div className="chat-input-bar">
                <div className="chat-input-container">
                    <div className="chat-input-relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Send a message..."
                            rows="1"
                            className="chat-input"
                        />
                        <button
                            onClick={handleSend}
                            className="send-btn"
                            disabled={!input.trim()}
                        >
                            <Send size={20} className="icon" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatView; 