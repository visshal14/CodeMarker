import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { backendURL } from '../utils/backendUrl';

function SnippetList({ snippets, onDelete, onEdit, onAssignReviewers, onMarkReviewed }) {
    const [showDropdown, setShowDropdown] = useState(null);
    const [availableReviewers, setAvailableReviewers] = useState([]);
    const [newComments, setNewComments] = useState({});
    const { user, token, updateAlertBox } = useAuth();

    useEffect(() => {
        const fetchReviewers = async () => {
            try {
                const response = await fetch(`${backendURL}/auth/users?role=reviewer`);
                if (response.ok) {
                    const users = await response.json();
                    setAvailableReviewers(users);
                }
            } catch (error) {
                updateAlertBox('Error fetching reviewers', 'error');
                console.error('Error fetching reviewers: ', error);
            }
        }
        fetchReviewers();
    }, []);

    const handleAssignClick = (snippetId) => {
        setShowDropdown(snippetId);
    };

    const handleReviewerSelect = (snippetId, reviewerId) => {
        onAssignReviewers(snippetId, reviewerId);
        setShowDropdown(null);
    }
    const handleCommentChange = (snippetId, value) => {
        setNewComments(prevComments => ({
            ...prevComments,
            [snippetId]: value,
        }));
    };

    const handleCommentSubmit = async (snippetId) => {
        const newComment = newComments[snippetId];
        if (newComment.trim()) {
            const commentData = {
                text: newComment,
                line: 0,
                author: user.username,
                snippetId: snippetId,
            };
            try {
                const response = await fetch(`${backendURL}/comments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(commentData),
                });
                if (response.ok) {
                    setNewComments(prevComments => ({
                        ...prevComments,
                        [snippetId]: '',
                    }));
                    updateAlertBox('Comment added successfully', "success");
                } else {
                    updateAlertBox('Error adding comment', 'error');

                }
            } catch (error) {
                updateAlertBox('Error adding comment', 'error');
                console.error('Error adding comment:', error);
            }
        }
    };


    return (

        <div className="container mx-auto overflow-x-auto px-4 sm:px-6  py-8">
            <div className="rounded-lg shadow-md border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 bg-white">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-medium text-gray-600 uppercase ">
                                Title
                            </th>
                            <th className="px-6 py-4 text-xs font-medium text-gray-600 uppercase ">
                                Language
                            </th>
                            <th className="px-6 py-4 text-xs font-medium text-gray-600 uppercase ">
                                Author
                            </th>
                            <th className="px-6 py-4 text-xs font-medium text-gray-600 uppercase ">
                                Reviewers
                            </th>
                            <th className="px-6 py-4 text-xs font-medium text-gray-600 uppercase ">
                                Status
                            </th>
                            <th className="px-6 py-4 text-xs font-medium text-gray-600 uppercase ">
                                Comments
                            </th>
                            <th className="px-6 py-4 text-xs font-medium text-gray-600 uppercase ">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {snippets.map(snippet => (
                            <tr key={snippet._id} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {snippet.title}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {snippet.language}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {snippet.author?.username}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="relative">
                                        <div className="flex items-center space-x-2">
                                            <span>{snippet.reviewers?.map(reviewer => reviewer?.username).join(', ') || 'No reviewers'}</span>
                                            {onAssignReviewers && (
                                                <button
                                                    className="text-blue-600 hover:text-blue-800 font-medium text-sm focus:outline-none"
                                                    onClick={() => handleAssignClick(snippet._id)}
                                                >
                                                    + Assign
                                                </button>
                                            )}
                                        </div>
                                        {showDropdown === snippet._id && (
                                            <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                <ul className="py-1" role="menu">
                                                    {availableReviewers?.map(reviewer => (
                                                        <li
                                                            key={reviewer._id}
                                                            onClick={() => handleReviewerSelect(snippet._id, reviewer._id)}
                                                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                                            role="menuitem"
                                                        >
                                                            {reviewer?.username}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${snippet.status === 'Pending Review'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : snippet.status === 'Reviewed'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {snippet.status}
                                    </span>
                                </td>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {snippet?.commentCount || 0}
                                </th>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <Link
                                        to={`/snippet/${snippet._id}`}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none "
                                    >
                                        View
                                    </Link>
                                    {onEdit && (
                                        <button
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none"
                                            onClick={() => onEdit(snippet._id)}
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                                            onClick={() => onDelete(snippet._id)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                    {onMarkReviewed &&
                                        snippet.reviewers?.map(reviewer => reviewer?.username).includes(user?.username) &&
                                        snippet.status === "Pending Review" && (
                                            <button
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none "
                                                onClick={() => onMarkReviewed(snippet._id)}
                                            >
                                                Mark as Reviewed
                                            </button>
                                        )}


                                </td>
                                <td>
                                    {user?.role === "reviewer" && <div className=" flex items-center h-full">
                                        <input
                                            type="text"
                                            placeholder="Add a comment..."
                                            className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={newComments[snippet._id] || ''}
                                            onChange={(e) => handleCommentChange(snippet._id, e.target.value)}
                                        />
                                        <button
                                            className="ml-2 px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onClick={() => handleCommentSubmit(snippet._id)}
                                        >
                                            Submit
                                        </button>
                                    </div>

                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
export default SnippetList;