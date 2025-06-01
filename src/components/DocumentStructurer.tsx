import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../auth/AuthContext';
import type { Lesson, Module, StructuredDoc, StructuredDocResponse, ErrorResponse, DocListItem, DocListResponse } from '../types/api';

interface ManualInput {
    moduleTitle: string;
    lessonTitle: string;
    content: string;
    example: string;
}

export default function DocumentStructurer() {
    const [rawText, setRawText] = useState('');
    const [structuredDoc, setStructuredDoc] = useState<StructuredDoc | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingLesson, setEditingLesson] = useState<{moduleIndex: number; lessonIndex: number} | null>(null);
    const [editingCourseTitle, setEditingCourseTitle] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [editedCourseTitle, setEditedCourseTitle] = useState('');
    const [saving, setSaving] = useState(false);
    const [documents, setDocuments] = useState<DocListItem[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [currentDocId, setCurrentDocId] = useState<string | null>(null);
    const [manualInput, setManualInput] = useState<ManualInput>({
        moduleTitle: '',
        lessonTitle: '',
        content: '',
        example: ''
    });
    const { user } = useAuth();

    // Fetch user's documents on component mount
    useEffect(() => {
        fetchUserDocs();
    }, []);

    const fetchUserDocs = async () => {
        setLoadingDocs(true);
        try {
            const response = await api.get<DocListResponse>('/ai/user-docs');
            if (response.data.data) {
                setDocuments(response.data.data);
            }
        } catch (err: any) {
            const errorResponse = err.response?.data as ErrorResponse;
            setError(errorResponse?.message || 'Failed to fetch documents');
        } finally {
            setLoadingDocs(false);
        }
    };

    const handleAISubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rawText.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const response = await api.post<StructuredDocResponse>('/ai/structure-doc', { rawText });
            if (response.data.data) {
                setStructuredDoc(response.data.data);
            } else {
                setError('No data received from server');
            }
        } catch (err: any) {
            const errorResponse = err.response?.data as ErrorResponse;
            setError(errorResponse?.message || 'Failed to structure document');
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualInput.moduleTitle || !manualInput.lessonTitle || !manualInput.content) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const newLesson = {
                title: manualInput.lessonTitle,
                content: manualInput.content,
                example: manualInput.example
            };

            if (!structuredDoc) {
                // Create new document
                setStructuredDoc({
                    courseTitle: 'New Course',
                    modules: [{
                        moduleTitle: manualInput.moduleTitle,
                        lessons: [newLesson]
                    }]
                });
            } else {
                // Add to existing document
                const updatedDoc = JSON.parse(JSON.stringify(structuredDoc));
                const existingModuleIndex = updatedDoc.modules.findIndex(
                    (m: Module) => m.moduleTitle === manualInput.moduleTitle
                );

                if (existingModuleIndex >= 0) {
                    updatedDoc.modules[existingModuleIndex].lessons.push(newLesson);
                } else {
                    updatedDoc.modules.push({
                        moduleTitle: manualInput.moduleTitle,
                        lessons: [newLesson]
                    });
                }
                setStructuredDoc(updatedDoc);
            }

            // Reset form
            setManualInput({
                moduleTitle: '',
                lessonTitle: '',
                content: '',
                example: ''
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add manual content');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (moduleIndex: number, lessonIndex: number, content: string) => {
        setEditingLesson({ moduleIndex, lessonIndex });
        setEditedContent(content);
    };

    const handleSaveEdit = async (moduleIndex: number, lessonIndex: number) => {
        if (!structuredDoc) return;

        setSaving(true);
        try {
            const updatedDoc = JSON.parse(JSON.stringify(structuredDoc));
            updatedDoc.modules[moduleIndex].lessons[lessonIndex].content = editedContent;
            setStructuredDoc(updatedDoc);
            setEditingLesson(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save edit');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAll = async () => {
        if (!structuredDoc) return;

        setSaving(true);
        try {
            let response;
            if (currentDocId) {
                // Update existing document
                response = await api.put<StructuredDocResponse>(`/ai/doc/${currentDocId}`, { structuredDoc });
            } else {
                // Create new document
                response = await api.post<StructuredDocResponse>('/ai/save-doc', { structuredDoc });
            }
            
            if (response.data.data) {
                await fetchUserDocs();
                if (!currentDocId) {
                    // If this was a new document, set the current doc ID
                    setCurrentDocId(response.data.data._id);
                }
                setError(null);
            }
        } catch (err: any) {
            const errorResponse = err.response?.data as ErrorResponse;
            setError(errorResponse?.message || 'Failed to save document');
        } finally {
            setSaving(false);
        }
    };

    const handleEditCourseTitle = () => {
        if (structuredDoc) {
            setEditedCourseTitle(structuredDoc.courseTitle);
            setEditingCourseTitle(true);
        }
    };

    const handleSaveCourseTitle = async () => {
        if (!structuredDoc) return;

        setSaving(true);
        try {
            const updatedDoc = JSON.parse(JSON.stringify(structuredDoc));
            updatedDoc.courseTitle = editedCourseTitle;
            setStructuredDoc(updatedDoc);
            setEditingCourseTitle(false);
        } catch (err: any) {
            const errorResponse = err.response?.data as ErrorResponse;
            setError(errorResponse?.message || 'Failed to save course title');
        } finally {
            setSaving(false);
        }
    };

    const loadDocument = async (docId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<StructuredDocResponse>(`/ai/doc/${docId}`);
            if (response.data.data) {
                setStructuredDoc(response.data.data);
                setCurrentDocId(docId);
                // Reset form states
                setRawText('');
                setManualInput({
                    moduleTitle: '',
                    lessonTitle: '',
                    content: '',
                    example: ''
                });
            }
        } catch (err: any) {
            const errorResponse = err.response?.data as ErrorResponse;
            setError(errorResponse?.message || 'Failed to load document');
        } finally {
            setLoading(false);
        }
    };

    const handleNewDocument = () => {
        setStructuredDoc(null);
        setCurrentDocId(null);
        setRawText('');
        setManualInput({
            moduleTitle: '',
            lessonTitle: '',
            content: '',
            example: ''
        });
        setError(null);
    };

    if (!user || user.role !== 'admin') {
        return (
            <div className="p-4 text-center text-red-600">
                You need admin privileges to access this feature.
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8 text-center">Document Structure Generator</h1>

            {/* Document List */}
            <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Your Documents</h2>
                    <button
                        onClick={handleNewDocument}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        Create New Document
                    </button>
                </div>
                {loadingDocs ? (
                    <div className="text-center py-4">Loading documents...</div>
                ) : documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {documents.map((doc) => (
                            <div 
                                key={doc._id} 
                                className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                                    currentDocId === doc._id ? 'ring-2 ring-blue-500' : ''
                                }`}
                                onClick={() => loadDocument(doc._id)}
                            >
                                <h3 className="font-semibold text-lg mb-2">{doc.courseTitle}</h3>
                                <p className="text-sm text-gray-600">
                                    Created: {new Date(doc.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Last updated: {new Date(doc.updatedAt).toLocaleDateString()}
                                </p>
                                {currentDocId === doc._id && (
                                    <div className="mt-2 text-sm text-blue-600">
                                        Currently editing
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-gray-600">
                        No documents yet. Create your first document below!
                    </div>
                )}
            </div>

            {/* Rest of the existing JSX */}
            {currentDocId && (
                <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg">
                    Editing document: {structuredDoc?.courseTitle}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* AI Section */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-semibold mb-6 text-blue-600">AI-Powered Structure</h2>
                    <form onSubmit={handleAISubmit} className="mb-6">
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
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Generate Structure'}
                        </button>
                    </form>
                </div>

                {/* Manual Section */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-semibold mb-6 text-green-600">Manual Content Entry</h2>
                    <form onSubmit={handleManualSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Module Title</label>
                            <input
                                type="text"
                                value={manualInput.moduleTitle}
                                onChange={(e) => setManualInput({...manualInput, moduleTitle: e.target.value})}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Lesson Title</label>
                            <input
                                type="text"
                                value={manualInput.lessonTitle}
                                onChange={(e) => setManualInput({...manualInput, lessonTitle: e.target.value})}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Content</label>
                            <textarea
                                value={manualInput.content}
                                onChange={(e) => setManualInput({...manualInput, content: e.target.value})}
                                className="w-full p-2 border rounded h-32 focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Example (Optional)</label>
                            <textarea
                                value={manualInput.example}
                                onChange={(e) => setManualInput({...manualInput, example: e.target.value})}
                                className="w-full p-2 border rounded h-32 focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Content'}
                        </button>
                    </form>
                </div>
            </div>

            {error && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {/* Structured Content Display */}
            {structuredDoc && (
                <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        {editingCourseTitle ? (
                            <div className="flex-1 flex items-center gap-4">
                                <input
                                    type="text"
                                    value={editedCourseTitle}
                                    onChange={(e) => setEditedCourseTitle(e.target.value)}
                                    className="text-3xl font-bold text-gray-800 p-2 border rounded focus:ring-2 focus:ring-blue-500 flex-1"
                                    placeholder="Enter course title"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveCourseTitle}
                                        disabled={saving}
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => setEditingCourseTitle(false)}
                                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center gap-4">
                                <h2 className="text-3xl font-bold text-gray-800">
                                    {structuredDoc.courseTitle}
                                </h2>
                                <button
                                    onClick={handleEditCourseTitle}
                                    className="p-2 text-blue-600 hover:text-blue-800"
                                    title="Edit course title"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        <button
                            onClick={handleSaveAll}
                            disabled={saving}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save All Changes'}
                        </button>
                    </div>
                    
                    <div className="space-y-8">
                        {structuredDoc.modules.map((module, moduleIndex) => (
                            <div key={moduleIndex} className="border-l-4 border-blue-500 pl-4">
                                <h3 className="text-2xl font-semibold mb-4 text-gray-700">
                                    {module.moduleTitle}
                                </h3>
                                
                                <div className="space-y-6">
                                    {module.lessons.map((lesson, lessonIndex) => (
                                        <div key={lessonIndex} className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-xl font-medium text-gray-800">
                                                    {lesson.title}
                                                </h4>
                                                {editingLesson?.moduleIndex === moduleIndex && 
                                                 editingLesson?.lessonIndex === lessonIndex ? (
                                                    <div className="space-x-2">
                                                        <button
                                                            onClick={() => handleSaveEdit(moduleIndex, lessonIndex)}
                                                            disabled={saving}
                                                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                                        >
                                                            {saving ? 'Saving...' : 'Save'}
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingLesson(null)}
                                                            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleEdit(moduleIndex, lessonIndex, lesson.content)}
                                                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            </div>
                                            {editingLesson?.moduleIndex === moduleIndex && 
                                             editingLesson?.lessonIndex === lessonIndex ? (
                                                <textarea
                                                    value={editedContent}
                                                    onChange={(e) => setEditedContent(e.target.value)}
                                                    className="w-full p-2 border rounded h-32 mb-4 focus:ring-2 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <p className="text-gray-600 mb-4 whitespace-pre-wrap">
                                                    {lesson.content}
                                                </p>
                                            )}
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