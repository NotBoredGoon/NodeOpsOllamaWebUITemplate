import React, { useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from 'firebase/auth';
import { User, Key } from 'lucide-react';
import { auth } from '../firebase';

const AuthModal = ({ setUser }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleAuthAction = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            // The onAuthStateChanged listener in App will handle setting the user
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-modal">
            <div className="auth-modal-box">
                <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <form onSubmit={handleAuthAction}>
                    <div className="auth-input-group">
                        <User className="auth-input-icon" size={20} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="auth-input"
                            required
                        />
                    </div>
                    <div className="auth-input-group">
                         <Key className="auth-input-icon" size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="auth-input"
                            required
                        />
                    </div>
                    {error && <p className="auth-error">{error}</p>}
                    <button
                        type="submit"
                        className="auth-btn"
                    >
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                </form>
                <p className="auth-switch">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button onClick={() => setIsLogin(!isLogin)} className="auth-switch-btn">
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthModal; 