import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const users = {
        Faiyaz: {
            password: 'faiyazstl@123',
            role: 'admin',
            center: 'both'
        },
        Shark: {
            password: 'sharkstl@123',
            role: 'user',
            center: 'SHARK'
        },
        Fortune: {
            password: 'fortunestl@123',
            role: 'user',
            center: 'FORTUNE'
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();

        if (users[username] && users[username].password === password) {
            navigate('/SessionSelection', { state: { username, role: users[username].role, center: users[username].center } });
        } else {
            alert('Invalid username or password');
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="login-container">
            <h1>Quality Performance Analysis Tool</h1>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <div className="password-container">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="show-password-btn"
                            onClick={toggleShowPassword}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
