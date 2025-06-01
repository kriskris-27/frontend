import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';

interface Lesson {
    title: string;
    content: string;
    example: string;
}

interface Module {
    moduleTitle: string;
    lessons: Lesson[];
}

interface StructuredDoc {
    courseTitle: string;
    modules: Module[];
}

export default function DocumentStructurer() {
    const [rawText, setRawText] = useState('');
    const [structuredDoc, setStructuredDoc] = useState<StructuredDoc | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rawText.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/ai/structure-doc', { rawText });
            setStructuredDoc(response.data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to structure document');
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.role !== 'admin') {
        return (
            <div className="p-4 text-center text-red-600">
                You need admin privileges to access this feature.
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Document Structure Generator</h1>
            
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="mb-4">
                    <label htmlFor="rawText" className="block text-sm font-medium mb-2">
                        Enter Documentation Text
                    </label>
                    <textarea
                        id="rawText"
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        className="w-full h-48 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Paste your documentation here..."
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Generate Structure'}
                </button>
            </form>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {structuredDoc && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800">
                        {structuredDoc.courseTitle}
                    </h2>
                    
                    <div className="space-y-8">
                        {structuredDoc.modules.map((module, moduleIndex) => (
                            <div key={moduleIndex} className="border-l-4 border-blue-500 pl-4">
                                <h3 className="text-2xl font-semibold mb-4 text-gray-700">
                                    {module.moduleTitle}
                                </h3>
                                
                                <div className="space-y-6">
                                    {module.lessons.map((lesson, lessonIndex) => (
                                        <div key={lessonIndex} className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="text-xl font-medium mb-2 text-gray-800">
                                                {lesson.title}
                                            </h4>
                                            <p className="text-gray-600 mb-4 whitespace-pre-wrap">
                                                {lesson.content}
                                            </p>
                                            {lesson.example && (
                                                <div className="mt-4 bg-gray-100 p-4 rounded">
                                                    <h5 className="font-medium text-gray-700 mb-2">Example:</h5>
                                                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                                                        {lesson.example}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
} 