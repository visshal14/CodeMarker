import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { MessageSquare, Clock, Code2, Eye, Edit3 } from 'lucide-react';
import { saveAs } from 'file-saver';
import LineEditor from '../components/LineEditor';
// import CodeViewer from '../components/CodeViewer';
import { backendURL } from '../utils/backendUrl';

function SnippetView() {
    const { id } = useParams();
    const { token, fetchWithToken, user, updateAlertBox } = useAuth();
    const [snippet, setSnippet] = useState(null);
    const [comments, setComments] = useState([]);
    const [code, setCode] = useState('');
    const [newComment, setNewComment] = useState('');
    const [highlightedLines, setHighlightedLines] = useState({});
    const navigate = useNavigate();
    const [changeHistory, setChangeHistory] = useState([]);
    const socket = useRef(null);
    const [isReviewed, setIsReviewed] = useState(false);



    useEffect(() => {
        const fetchSnippet = async () => {
            try {
                const data = await fetchWithToken(`${backendURL}/snippets/${id}`);
                setSnippet(data);
                setComments(data.commentCount);
                setCode(data.code);
                setIsReviewed(data.status === 'Reviewed');
            } catch (error) {
                updateAlertBox('Error fetching snippet', 'error');
                console.error("Error fetching snippet: ", error);
                navigate('/');
            }
        };

        const fetchChangeHistory = async () => {
            try {
                const data = await fetchWithToken(`${backendURL}/change-history/${id}`);
                setChangeHistory(data)
            } catch (error) {
                updateAlertBox('Error fetching change history', 'error');
                console.error("Error fetching change history: ", error);
            }
        };
        fetchSnippet();
        fetchChangeHistory();
    }, [id, fetchWithToken, navigate]);




    const exportSnippet = () => {
        const snippetContent = `
        Title: ${snippet.title}
        Description: ${snippet.description}
        Language: ${snippet.language}
        
        Code:
        ${snippet.code}
        
        Comments:
        ${comments.map(comment => `${comment.user}: ${comment.text} (Line: ${comment.line})`).join('\n')}
    `;
        const blob = new Blob([snippetContent], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, `${snippet.title}.txt`);
        updateAlertBox('File downloaded', 'success');
    };

    useEffect(() => {
        if (snippet) {
            socket.current = io(`${backendURL}`, {
                auth: {
                    token: token,
                }
            });

            socket.current.emit('join-room', snippet._id);
            socket.current.on('new-comment', (commentData) => {
                setComments(prevComments => [...prevComments, commentData]);
                setHighlightedLines(prevHighlightedLines => ({
                    ...prevHighlightedLines,
                    [commentData.line]: true,
                }));
            });

            socket.current.on('code-change', (codeChangeData) => {
                setCode(prevCode => {
                    const lines = prevCode.split('\n');
                    lines[codeChangeData.lineNumber - 1] = codeChangeData.lineCode;
                    return lines.join('\n');
                });
            });
            socket.current.on('new-notification', (notification) => {
                updateAlertBox(notification.message, 'success')
            });
            socket.current.on('change-history-update', (changeData) => {
                setChangeHistory(prevChangeHistory => [changeData, ...prevChangeHistory]);
            });
            return () => {
                socket.current.disconnect();
            }
        }
    }, [snippet, token]);

    const handleSendComment = async (line) => {
        if (newComment.trim()) {
            const commentData = {
                text: newComment,
                line: line,
                author: user.username,
                snippetId: snippet._id,
                snippetTitle: snippet.title
            }
            socket.current.emit('send-comment', commentData);
            try {
                await fetch(`${backendURL}/comments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(commentData)
                });
                setNewComment('');
                updateAlertBox('Comment added successfully', 'success');
            } catch (error) {
                updateAlertBox('Error sending comment', 'error');
                console.error('Error sending comment:', error)
            }
        }
    };

    const handleCodeChange = (newCode, lineNumber, lineCode) => {
        setCode(newCode);
        socket.current.emit('code-change', { lineNumber, lineCode, snippetId: snippet._id, author: user.username });
    };



    const renderCodeLines = () => {
        if (!code) return null;
        const lines = code.split('\n');
        return lines.map((line, index) => (
            <div
                key={index}
                className={`group flex items-center hover:bg-gray-50 transition-colors duration-150 ${highlightedLines[index + 1] ? 'bg-amber-50' : ''
                    }`}
            >
                <div className="flex-none w-12 px-4 py-2 text-gray-400 text-sm select-none  border-gray-200">
                    {index + 1}
                </div>
                <div className="flex-grow px-4 py-2 font-mono text-sm border-l">
                    {line}
                </div>
                <button onClick={() => handleSendComment(index + 1)} className="opacity-0 group-hover:opacity-100 flex-none px-2 py-1 mr-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-all duration-150">
                    <MessageSquare className="w-4 h-4" />
                </button>
            </div>
        ));
    };


    const updateSnippet = async () => {
        try {
            const formData = {
                code,
                title: snippet.title,
                description: snippet.description,
                language: snippet.language,
            }
            await fetch(`${backendURL}/snippets/${snippet._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            updateAlertBox('Snippet updated successfully', 'success');
        } catch (error) {
            updateAlertBox('Failed to update snippet', 'error');
            console.error('Error updating snippet:', error);
        }
    }


    if (!snippet) {
        return <div>Loading...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 text-black">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <nav className=" top-0 left-0 w-full  text-black z-10 text-xl font-bold p-4">
                    <a href="/" >
                        CodeMarker
                    </a>
                </nav>
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">{snippet.title}</h1>
                        <span className="px-3 py-1 text-sm font-medium text-amber-700 bg-amber-50 rounded-full">
                            {snippet.status}
                        </span>
                    </div>
                    <p className="mt-2 text-gray-600">{snippet.description}</p>
                    <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                            <Code2 className="w-4 h-4 mr-2" />
                            {snippet.language}
                        </div>
                        <div className="flex items-center">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            {comments.length} Comments
                        </div>
                    </div>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


                    <div className="lg:col-span-2">

                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-3xl font-bold text-gray-900"></h1>
                            <div>
                                <span className="px-3 py-1 text-sm font-medium text-amber-700 bg-amber-50 rounded-full">
                                    {snippet.status}
                                </span>
                                {user.role === "developer" && <button
                                    onClick={exportSnippet}
                                    className="ml-4 px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded"
                                >
                                    Export
                                </button>}
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                                <h2 className="font-semibold text-gray-800">Code</h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {renderCodeLines()}
                                {/* <CodeViewer code={code} highlightedLines={Object.keys(highlightedLines)} handleSendComment={handleSendComment} /> */}
                            </div>
                            {user.role === 'developer' && (<>

                                <LineEditor code={code} onChange={handleCodeChange} highlightLines={Object.keys(highlightedLines)} />

                                <button
                                    onClick={updateSnippet}
                                    className=" px-4 py-2 m-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Update Snippet
                                </button>
                            </>
                            )}
                        </div>
                    </div>


                    <div className="space-y-6">

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 ">
                            <div className="px-4 py-3 border-b border-gray-200">
                                <h2 className="font-semibold text-gray-800">Comments</h2>
                            </div>
                            <div className="p-4 overflow-y-auto max-h-[500px]">
                                <div className="space-y-4">
                                    {comments.length > 0 && comments?.map((comment, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="font-medium text-gray-900">{comment.author}</span>
                                                <span className="text-sm text-gray-500">Line {comment.line}</span>
                                            </div>
                                            <p className="text-gray-700 text-sm">{comment.text}</p>
                                        </div>
                                    ))}
                                </div>
                                {user.role === 'reviewer' && <div className="mt-4 flex items-center space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Add a comment..."
                                        className="flex-grow px-3 py-2 border border-gray-300 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />

                                </div>}
                            </div>
                        </div>


                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 ">
                            <div className="px-4 py-3 border-b border-gray-200">
                                <h2 className="font-semibold text-gray-800">Change History</h2>
                            </div>
                            <div className="divide-y divide-gray-200 overflow-y-auto max-h-[500px]">
                                {changeHistory?.map((change, index) => (
                                    <div key={index} className="p-4 flex items-start space-x-3">
                                        <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-gray-900">{change.user}</span>
                                                <span className="text-sm text-gray-500">{change.type}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{change.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default SnippetView;