import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    loading?: boolean;
}

export default function RichTextEditor({ value, onChange, placeholder, className, loading }: RichTextEditorProps) {
    if (loading) {
        return <div className="h-64 animate-pulse bg-muted rounded-md" />;
    }

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'clean'],
            [{ 'align': [] }],
            [{ 'color': [] }, { 'background': [] }],
        ],
        clipboard: {
            matchVisual: false,
        },
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link',
        'align',
        'color', 'background',
    ];

    return (
        <div className={`relative ${className || ''}`}>
            <style>{`
                .ql-container {
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                    min-height: 200px;
                    font-size: 16px; /* Ensure readable font size */
                }
                .ql-toolbar {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    background-color: #f8fafc;
                }
                .ql-editor {
                    min-height: 200px;
                }
            `}</style>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                className="h-full bg-background"
                placeholder={placeholder}
            />
        </div>
    );
}
