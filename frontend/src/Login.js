import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // const users = {
    //     Faiyaz: {
    //         password: 'faiyazstl@123',
    //         role: 'admin',
    //         center: 'both'
    //     },
    //     Shark: {
    //         password: 'Sharkstl@123',
    //         role: 'user',
    //         center: 'Shark'
    //     },
    //     Fortune: {
    //         password: 'Fortunestl@123',
    //         role: 'user',
    //         center: 'Fortune'
    //     }
    // };

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store center and role in session storage
                sessionStorage.setItem('centerName', data.center);
                sessionStorage.setItem('role', data.role);
                
                navigate('/SessionSelection', { state: { username, role: data.role, center: data.center } });
            } else {
                alert('Invalid username or password');
            }
        } catch (error) {
            console.error('Login failed:', error);
            alert('An error occurred. Please try again.');
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