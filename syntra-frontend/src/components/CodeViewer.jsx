import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript.min.js';
import { MessageSquare } from 'lucide-react';

const CodeViewer = ({ code, highlightedLines, handleSendComment }) => {
    useEffect(() => {
        Prism.highlightAll();
    }, [code]);

    const renderCodeLines = () => {
        if (!code) return null;
        const lines = code.split('\n');
        return lines.map((line, index) => {
            const isHighlighted = highlightedLines.includes(index + 1);

            return (
                <div
                    key={index}
                    className={`group flex items-center hover:bg-gray-50 transition-colors duration-150 ${isHighlighted ? 'bg-amber-50' : ''}`}
                >
                    <div className="flex-none w-12 px-4 py-2 text-gray-400 text-sm select-none border-r border-gray-200">
                        {index + 1}
                    </div>
                    <div className="flex-grow px-4  font-mono text-sm">
                        <pre className="language-javascript">
                            <code>
                                {line}
                            </code>
                        </pre>
                    </div>
                    <button onClick={() => handleSendComment(index + 1)} className="opacity-0 group-hover:opacity-100 flex-none px-2 py-1 mr-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-all duration-150">
                        <MessageSquare className="w-4 h-4" />
                    </button>
                </div>
            );
        });
    };

    return (
        <div className="code-viewer">
            {renderCodeLines()}
        </div>
    );
};

export default CodeViewer;
