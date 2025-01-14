import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';
import { backendURL } from '../utils/backendUrl';

function LoginPage() {
    const { login, updateAlertBox } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (formData) => {
        try {
            const response = await fetch(`${backendURL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                login(data.token, data.user);
                navigate('/');
                updateAlertBox('Login successful', 'success');

            } else {
                updateAlertBox('Login failed , please try again', 'error');
            }
        } catch (error) {
            updateAlertBox('Login failed , please try again', 'error');
            console.error('Error during login:', error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <nav className="fixed top-0 left-0 w-full  text-black z-10 text-xl font-bold p-4">
                <a href="/" >
                    CodeMarker
                </a>
            </nav>

            <AuthForm onSubmit={handleLogin} title="Login" buttonText="Login" />
        </div>
    );
}

export default LoginPage;
