import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthForm({ onSubmit, title, buttonText, isRegistration = false }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('developer');
    const navigate = useNavigate()
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ username, password, role });
    };

    const redirect = () => {
        if (isRegistration) {
            navigate("/login")
        } else {
            navigate("/register")
        }
    }

    return (
        <div className="w-[380px] bg-white  rounded-lg shadow-lg overflow-hidden">
            <div className="p-8">
                <h2 className="text-2xl font-bold text-center text-gray-900  mb-2">{title}</h2>
                <p className="text-center text-gray-900 mb-6">
                    {isRegistration ? 'Create an account to get started' : 'Enter your credentials to continue'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700  mb-2"
                        >
                            Username
                        </label>
                        <div className="relative">
                            <input
                                id="username"
                                type="text"
                                required
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300   text-gray-900 bg-white  focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400  focus:border-transparent outline-none transition-colors"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700  mb-2"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type="password"
                                required
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300   text-gray-900 bg-white  focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400  focus:border-transparent outline-none transition-colors"

                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {isRegistration && (
                        <div>
                            <label
                                htmlFor="role"
                                className="block text-sm font-medium text-gray-700  mb-2"
                            >
                                Role
                            </label>
                            <div className="relative">
                                <select
                                    id="role"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300   text-gray-900 bg-white  focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400  focus:border-transparent outline-none transition-colors"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="developer">Developer</option>
                                    <option value="reviewer">Reviewer</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                        {buttonText}
                    </button>
                </form>
                {isRegistration ? (
                    <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
                        Already have an account?
                        <button onClick={redirect} className="text-blue-600 ml-1 dark:text-blue-400 underline">
                            Login
                        </button>
                    </p>
                ) : (

                    <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
                        Don't have an account?  <button onClick={redirect} className="text-blue-600 ml-1 dark:text-blue-400 underline">
                            Register
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
}
// <!-- ℑ♑︎  亖⌽⎭🂱⎶☀️☀️⌶⍱   -->
export default AuthForm;
