import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const LineEditor = ({ code, onChange, highlightLines = [] }) => {

    const editorRef = useRef(null);
    const [highlightedLines, setHighlightedLines] = useState(highlightLines);
    const decorationsRef = useRef([]);

    const handleEditorChange = (value, event) => {
        const changes = event.changes[0];
        const startLineNumber = changes.range.startLineNumber;
        const newLineCode = value.split('\n')[startLineNumber - 1];

        onChange(value, startLineNumber, newLineCode);
    };

    // const handleEditorDidMount = (editor, monaco) => {
    //     editorRef.current = editor;
    //     monaco.editor.defineTheme('custom-dark', {
    //         base: 'vs-dark',
    //         inherit: true,
    //         rules: [],
    //         colors: {
    //             'editor.background': '#000000',
    //         }
    //     });
    //     monaco.editor.setTheme('custom-dark');

    //     // Highlight lines when the editor is mounted or updated
    //     highlightLinesInEditor(editor, monaco);
    // };


    useEffect(() => {
        setHighlightedLines(highlightLines);
    }, [highlightLines]);




    useEffect(() => {
        if (editorRef.current && window.monaco) {
            highlightLinesInEditor(editorRef.current, window.monaco);
        }
    }, [highlightedLines]);

    const highlightLinesInEditor = (editor, monaco) => {
        if (!monaco) return;
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);


        const newDecorations = highlightedLines.map((lineNumber) => ({
            range: new monaco.Range(Number(lineNumber), 1, Number(lineNumber), 1),
            options: {
                isWholeLine: true,
                className: 'highlighted-line',
                glyphMarginClassName: 'highlighted-line-glyph',
            }
        }));

        decorationsRef.current = editor.deltaDecorations([], newDecorations);
    };
    return (
        <div className="relative">
            <Editor
                height="400px"
                language="javascript"
                value={code}
                theme="vs-dark"
                onChange={handleEditorChange}
                options={{
                    selectOnLineNumbers: true,
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    minimap: { enabled: false },
                }}
            // onMount={handleEditorDidMount}
            />
        </div>
    );
};

export default LineEditor;
