import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './loginPage.css'; // Import CSS file for styling
import logo from '../assets/logoIMG.jpeg'; // Import your logo image
import authAPI from '../api/auth.js'; // Import your API file

const RegisterPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        try {
            // Validate password and confirmPassword
            if (password !== confirmPassword) {
                setErrorMessage('Passwords do not match');
                return;
            }

            // Make API request to register user
            const response = await authAPI.register({ firstName, lastName, email, password });

            // Check response status and navigate accordingly
            if (response.status === 200) {
                navigate('/');
            } else if (response.status === 400) {
                // Handle validation errors from the server
                const { message } = await response.json();
                setErrorMessage(message);
            } else {
                setErrorMessage('An error occurred during registration');
            }
        } catch (error) {
            console.error('Registration failed: ', error);
            setErrorMessage('An error occurred during registration');
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <img src={logo} alt="Logo" className="logo" />
                <h2>Register for an account</h2>
                <form onSubmit={handleRegister}>
                    <input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
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
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button type="submit">Register</button>
                </form>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
        </div>
    );
};

export default RegisterPage;
