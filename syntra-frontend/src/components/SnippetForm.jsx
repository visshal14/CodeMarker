import React, { useEffect, useState } from 'react';
import { Code2, FileText, Languages, Type } from 'lucide-react';
import Editor from '@monaco-editor/react';

function SnippetForm({ onSubmit, initialData }) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [language, setLanguage] = useState(initialData?.language || 'javascript');
    const [code, setCode] = useState(initialData?.code || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ title, description, language, code });
    };

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description);
            setLanguage(initialData.language);
            setCode(initialData.code);
        }
    }, [initialData])

    const handleCodeChange = (newCode) => {
        setCode(newCode);

    };

    return (

        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-6 py-8 sm:p-10">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Code2 className="w-6 h-6 text-indigo-600" />
                            {initialData ? "Update Snippet" : "Add New Snippet"}
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Share your code snippets with the community
                        </p>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-1">
                                    <Type className="w-4 h-4" />
                                    Title
                                </label>
                                <input
                                    type="text"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 
                                    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter a descriptive title"
                                    required
                                />
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-1">
                                    <FileText className="w-4 h-4" />
                                    Description
                                </label>
                                <textarea
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 
                                    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add a brief description of your code snippet"
                                />
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-1">
                                    <Languages className="w-4 h-4" />
                                    Language
                                </label>
                                <select
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md shadow-sm 
                                    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="html">HTML</option>
                                    <option value="css">CSS</option>
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-1">
                                    <Code2 className="w-4 h-4" />
                                    Code
                                </label>

                                <Editor
                                    height="400px"
                                    language="javascript"
                                    value={code}
                                    theme="vs-dark"
                                    onChange={handleCodeChange}
                                    options={{
                                        selectOnLineNumbers: true,
                                        automaticLayout: true,
                                        scrollBeyondLastLine: false,
                                        minimap: { enabled: false },
                                    }}
                                />

                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium 
                                    text-white bg-indigo-600  transition-colors duration-200"
                                >
                                    {initialData ? "Update" : "Add"} Snippet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SnippetForm;