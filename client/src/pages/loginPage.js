import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './loginPage.css'; // Import CSS file for styling
import logo from '../assets/logoIMG.jpeg'; // Import your logo image
import authAPI from '../api/auth.js'; // Import your API file

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        try {

            const response = await authAPI.login({ email, password });
            if(response.status === 200){
                navigate('/homePage');
            } else if(response.status === 401){
                setErrorMessage('Invalid email or password');
            }
        } catch (error) {
            console.error('login failed: ', error);
            setErrorMessage('Invalid email or password');
        }
    };

    const handleGuest = () => {
        navigate('/homePage');
    };

    const handleRegister = () => {
        navigate('/registerPage');
    };

    return (
        <div className="login-page">
            <div className="login-container">
            <img src={logo} alt="Logo" className="logo" />
                <h2>Login to your account</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">Login</button>
                </form>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <button onClick={handleGuest}>Sign in as Guest</button>
                <button onClick={handleRegister}>Register</button>
            </div>
        </div>
    );
};

export default LoginPage;
