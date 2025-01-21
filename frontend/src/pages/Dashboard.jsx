import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SnippetForm from '../components/SnippetForm';
import SnippetList from '../components/SnippetList';
import { useNavigate } from 'react-router-dom';
import { backendURL } from '../utils/backendUrl';


function Dashboard() {
    const { token, user, logout, fetchWithToken, updateAlertBox } = useAuth();
    const navigate = useNavigate();
    const [snippets, setSnippets] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingSnippetId, setEditingSnippetId] = useState(null);
    const [updateSnippetData, setUpdateSnippetData] = useState(null);

    useEffect(() => {
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);

    useEffect(() => {
        const fetchSnippets = async () => {
            try {
                let url = `${backendURL}/snippets`;
                if (user?.role === 'reviewer') {
                    url = `${backendURL}/snippets/review/assigned`;
                }
                const data = await fetchWithToken(url);
                setSnippets(data);
            } catch (error) {
                updateAlertBox('Error fetching snippets', 'error');
                navigate("/login")
                console.log(error);
            }
        };
        if (token) {
            fetchSnippets();
        }
    }, [token, fetchWithToken]);

    const handleLogout = () => {
        logout();
        navigate('/login');
        updateAlertBox('Logout successful', 'success');
    };
    const handleCreateSnippet = async (formData) => {
        try {
            const response = await fetch(`${backendURL}/snippets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                setShowForm(false);
                setEditingSnippetId(null);
                setUpdateSnippetData(null);
                const data = await response.json();
                setSnippets(prevSnippets => [...prevSnippets, data])
                updateAlertBox('Snippet created successfull', 'success');
            } else {
                updateAlertBox('Error creating snippet', 'error');

            }
        } catch (error) {
            updateAlertBox('Error creating snippet', 'error');
            console.log(error);
        }
    };

    const handleDeleteSnippet = async (snippetId) => {
        try {
            const response = await fetch(`${backendURL}/snippets/${snippetId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (response.ok) {
                setSnippets(prevSnippets => prevSnippets.filter(s => s._id !== snippetId));
                updateAlertBox('Snippet deleted successfull', 'success');
            } else {
                updateAlertBox('Error deleting snippet', 'error');

            }
        } catch (error) {
            updateAlertBox('Error deleting snippet', 'error');
            console.log(error);
        }
    };

    const handleEditSnippet = async (snippetId) => {
        setShowForm(true);
        setEditingSnippetId(snippetId);
        try {
            const response = await fetch(`${backendURL}/snippets/${snippetId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUpdateSnippetData(data);
            }
        } catch (error) {
            updateAlertBox('Error fetching snippet for editing', 'error');
            console.error('Error fetching snippet for editing:', error);
        }
    };
    const handleUpdateSnippet = async (formData) => {
        try {
            const response = await fetch(`${backendURL}/snippets/${editingSnippetId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                setShowForm(false);
                setEditingSnippetId(null);
                setUpdateSnippetData(null);
                const updatedSnippet = await response.json();
                setSnippets(prevSnippets =>
                    prevSnippets.map(snippet =>
                        snippet._id === updatedSnippet._id ? updatedSnippet : snippet
                    )
                );
                updateAlertBox('Snippet updated successfull', 'success');
            } else {
                updateAlertBox('Error updating snippet', 'error');

            }
        } catch (error) {
            updateAlertBox('Error updating snippet', 'error');
            console.log(error)
        }
    };
    const handleFormSubmit = async (formData) => {
        if (editingSnippetId) {
            await handleUpdateSnippet(formData);
        } else {
            await handleCreateSnippet(formData);
        }
    };

    const handleAssignReviewers = async (snippetId, reviewerId) => {
        try {
            const response = await fetch(`${backendURL}/snippets/${snippetId}/assign-reviewers`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ reviewers: [reviewerId] }),
            });
            if (response.ok) {
                const updatedSnippet = await response.json();
                setSnippets(prevSnippets =>
                    prevSnippets.map(snippet =>
                        snippet._id === updatedSnippet._id ? updatedSnippet : snippet
                    )
                );
                updateAlertBox('Reviewer assigned', 'success');

            }
        } catch (error) {
            updateAlertBox('Error assigning reviewers', 'error');
            console.error('Error assigning reviewers: ', error);
        }
    };
    const handleMarkReviewed = async (snippetId) => {
        try {
            const response = await fetch(`${backendURL}/snippets/${snippetId}/mark-reviewed`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const updatedSnippet = await response.json();
                setSnippets(prevSnippets =>
                    prevSnippets.map(snippet =>
                        snippet._id === updatedSnippet._id ? updatedSnippet : snippet
                    )
                );
                updateAlertBox('Snippet marked as reviewed', 'success');
            }
        } catch (error) {
            updateAlertBox('Error marking as reviewed', 'error');
            console.error("Error marking as reviewed", error);
        }
    };
    // < !--ℑ♑︎  亖⌽⎭🂱⎶☀️☀️⌶⍱   -->
    return (
        <div className="min-h-screen bg-gray-100 p-4 ">
            <div className="mb-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">
                    CodeMarker
                </h1>
                <div className="space-x-2">
                    {user?.role === 'developer' && (
                        <button
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => setShowForm(!showForm)}
                        >
                            {showForm ? "Hide Form" : "Add Snippet"}
                        </button>
                    )}
                    <button
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>
            {showForm && (
                <SnippetForm
                    onSubmit={handleFormSubmit}
                    initialData={updateSnippetData}
                />
            )}
            <SnippetList
                snippets={snippets}
                onDelete={user?.role === 'developer' ? handleDeleteSnippet : null}
                onEdit={user?.role === 'developer' ? handleEditSnippet : null}
                onAssignReviewers={user?.role === 'developer' ? handleAssignReviewers : null}
                onMarkReviewed={user?.role === 'reviewer' ? handleMarkReviewed : null}
            />
        </div>
    );
}
export default Dashboard;