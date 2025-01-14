import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';
import { backendURL } from '../utils/backendUrl';

function Register() {
    const navigate = useNavigate();
    const { updateAlertBox } = useAuth();

    const handleRegister = async (formData) => {
        try {
            const response = await fetch(`${backendURL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                updateAlertBox('User Registered Successfully', 'success');
                navigate('/login');
            } else {
                updateAlertBox('Registration failed, please try again', 'error');
            }
        } catch (error) {
            updateAlertBox('Registration failed, please try again', 'error');
            console.error('Error during registration:', error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <nav className="fixed top-0 left-0 w-full  text-black z-10 text-xl font-bold p-4">
                <a href="/" >
                    CodeMarker
                </a>
            </nav>
            <AuthForm onSubmit={handleRegister} isRegistration title="Register" buttonText="Register" />
        </div>
    );
}

export default Register;
