import React from 'react';
import { Search, Plus, MessageSquare, Trash2, LogOut, User, Sun, Moon } from 'lucide-react';

const Sidebar = ({ chats, activeChatId, onNewChat, onSelectChat, onDeleteChat, onLogout, user, theme, toggleTheme }) => {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h1>My Chats</h1>
            </div>

            <button
                onClick={onNewChat}
                className="sidebar-btn new-chat-btn"
            >
                <Plus size={20} className="icon" /> New Chat
            </button>
            
            <div className="sidebar-search">
                <Search className="icon search-icon" size={18} />
                <input type="text" placeholder="Search chats..." className="search-input" />
            </div>

            <div className="sidebar-chat-list">
                <nav>
                    {chats.map(chat => (
                        <a
                            key={chat.id}
                            href="#"
                            onClick={(e) => { e.preventDefault(); onSelectChat(chat.id); }}
                            className={`chat-list-item${activeChatId === chat.id ? ' active' : ''}`}
                        >
                            <div className="chat-list-title">
                                <MessageSquare size={16} className="icon" />
                                <span>{chat.title}</span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }} className="delete-chat-btn">
                               <Trash2 size={14} />
                            </button>
                        </a>
                    ))}
                </nav>
            </div>

            <div className="sidebar-footer">
                 <div className="sidebar-user">
                    <User size={20} className="icon" />
                    <span>{user?.email}</span>
                 </div>
                 <button onClick={toggleTheme} className="sidebar-btn theme-btn">
                     {theme === 'dark' ? <Sun size={16} className="icon"/> : <Moon size={16} className="icon"/>}
                     {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button onClick={onLogout} className="sidebar-btn logout-btn">
                    <LogOut size={16} className="icon" />
                    Log Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar; 