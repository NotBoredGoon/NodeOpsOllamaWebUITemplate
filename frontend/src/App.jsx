import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { MessageSquare } from 'lucide-react';
import { initializeFirebase, auth } from './firebase';
import { availableModels } from './constants';
import AuthModal from './components/AuthModal';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';

export default function App() {
    const [user, setUser] = useState(null);
    const [isFirebaseReady, setIsFirebaseReady] = useState(false);
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [selectedModel, setSelectedModel] = useState(availableModels[0].id);
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const init = async () => {
            const { auth: firebaseAuth } = await initializeFirebase();
            if (firebaseAuth) {
                // Firebase auth listener
                const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
                    setUser(currentUser);
                    setIsFirebaseReady(true);
                    if (currentUser) {
                        // For a real app, you would load chats from a database like Firestore
                        // For this demo, we'll start with one new chat
                        const loadedChats = JSON.parse(localStorage.getItem(`chats_${currentUser.uid}`)) || [];
                        if (loadedChats.length === 0) {
                            const newChatId = `chat_${Date.now()}`;
                            const newChats = [{ id: newChatId, title: 'New Conversation', messages: [] }];
                            setChats(newChats);
                            setActiveChatId(newChatId);
                        } else {
                            setChats(loadedChats);
                            setActiveChatId(loadedChats[0]?.id || null)
                        }
                    } else {
                        setChats([]);
                        setActiveChatId(null);
                    }
                });
                return () => unsubscribe();
            } else {
                // Handle Firebase init error
                setIsFirebaseReady(true); // Stop loading, show error state
            }
        };
        init();
    }, []);

    useEffect(() => {
        if(user && chats.length > 0) {
             localStorage.setItem(`chats_${user.uid}`, JSON.stringify(chats));
        }
    }, [chats, user]);
    
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    const handleNewChat = () => {
        const newChatId = `chat_${Date.now()}`;
        const newChat = { id: newChatId, title: 'New Conversation', messages: [] };
        setChats(prevChats => [newChat, ...prevChats]);
        setActiveChatId(newChatId);
    };
    
    const handleDeleteChat = (chatId) => {
        setChats(prev => {
            const newChats = prev.filter(c => c.id !== chatId);
            if (activeChatId === chatId) {
                setActiveChatId(newChats[0]?.id || null);
            }
            return newChats;
        });
    };

    const handleSendMessage = async (messageContent, chatId) => {
        const userMessage = { role: 'user', content: messageContent };

        setChats(prevChats =>
            prevChats.map(chat => {
                if (chat.id === chatId) {
                    const updatedMessages = [...chat.messages, userMessage];
                    // Update chat title from first message
                    const updatedTitle = updatedMessages.length === 1 ? messageContent.substring(0, 30) : chat.title;
                    return { ...chat, title: updatedTitle, messages: updatedMessages };
                }
                return chat;
            })
        );
        
        // Add a loading message
        const loadingMessage = { role: 'assistant', content: 'Thinking...'};
         setChats(prevChats =>
            prevChats.map(chat =>
                chat.id === chatId ? { ...chat, messages: [...chat.messages, loadingMessage] } : chat
            )
        );

        try {
            const response = await fetch('http://localhost:8080/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: selectedModel,
                    prompt: messageContent,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const aiMessage = { role: 'assistant', content: data.response };
            
             setChats(prevChats =>
                prevChats.map(chat => {
                    if (chat.id === chatId) {
                        // Replace 'Thinking...' with the actual response
                        const finalMessages = chat.messages.filter(m => m.content !== 'Thinking...');
                        finalMessages.push(aiMessage);
                        return { ...chat, messages: finalMessages };
                    }
                    return chat;
                })
            );

        } catch (error) {
            console.error("Error fetching AI response:", error);
            const errorMessage = { role: 'assistant', content: "Sorry, I couldn't get a response. Please check the backend server." };
             setChats(prevChats =>
                prevChats.map(chat => {
                     if (chat.id === chatId) {
                        const finalMessages = chat.messages.filter(m => m.content !== 'Thinking...');
                        finalMessages.push(errorMessage);
                        return { ...chat, messages: finalMessages };
                    }
                    return chat;
                })
            );
        }
    };

    const handleLogout = () => {
        signOut(auth);
    };

    if (!isFirebaseReady) {
        return (
            <div className="app-root loading-screen">
                Connecting...
            </div>
        );
    }

    if (!user) {
        return <AuthModal setUser={setUser} />;
    }
    
    const activeChat = chats.find(c => c.id === activeChatId);

    return (
        <div className={`app-root${theme === 'dark' ? ' dark-theme' : ' light-theme'}`}> 
            <Sidebar 
                chats={chats} 
                activeChatId={activeChatId}
                onNewChat={handleNewChat}
                onSelectChat={setActiveChatId}
                onDeleteChat={handleDeleteChat}
                onLogout={handleLogout}
                user={user}
                theme={theme}
                toggleTheme={toggleTheme}
            />
            <div className="main-content">
            {activeChat ? (
                <ChatView 
                    currentChat={activeChat} 
                    onSendMessage={handleSendMessage}
                    selectedModel={selectedModel}
                    setSelectedModel={setSelectedModel}
                />
            ) : (
                <div className="no-chat-selected">
                    <div className="no-chat-inner">
                        <MessageSquare size={48} className="icon"/>
                        <h2>No chat selected</h2>
                        <p>Create a new chat or select one from the list to start.</p>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
