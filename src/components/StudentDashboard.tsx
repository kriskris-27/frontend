import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { DocListItem, DocListResponse, ErrorResponse, StructuredDoc, StructuredDocResponse } from '../types/api';

interface CourseViewProps {
    docId: string;
    onBack: () => void;
}

const CourseView = ({ docId, onBack }: CourseViewProps) => {
    const [course, setCourse] = useState<StructuredDoc | null>(null);
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCourse();
    }, [docId]);

    const loadCourse = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<StructuredDocResponse>(`/courses/${docId}`);
            if (response.data.data) {
                setCourse(response.data.data);
                setCurrentModuleIndex(0);
                setCurrentLessonIndex(0);
            }
        } catch (err: any) {
            const errorResponse = err.response?.data as ErrorResponse;
            setError(errorResponse?.message || 'Failed to load course');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (!course) return;

        const currentModule = course.modules[currentModuleIndex];
        if (currentLessonIndex < currentModule.lessons.length - 1) {
            // Move to next lesson in current module
            setCurrentLessonIndex(currentLessonIndex + 1);
        } else if (currentModuleIndex < course.modules.length - 1) {
            // Move to first lesson of next module
            setCurrentModuleIndex(currentModuleIndex + 1);
            setCurrentLessonIndex(0);
        }
    };

    const handlePrevious = () => {
        if (!course) return;

        if (currentLessonIndex > 0) {
            // Move to previous lesson in current module
            setCurrentLessonIndex(currentLessonIndex - 1);
        } else if (currentModuleIndex > 0) {
            // Move to last lesson of previous module
            setCurrentModuleIndex(currentModuleIndex - 1);
            const previousModule = course.modules[currentModuleIndex - 1];
            setCurrentLessonIndex(previousModule.lessons.length - 1);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-xl text-gray-600">Loading course...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
            </div>
        );
    }

    if (!course) {
        return (
            <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg">
                Course not found
            </div>
        );
    }

    const currentModule = course.modules[currentModuleIndex];
    const currentLesson = currentModule.lessons[currentLessonIndex];
    const isFirstLesson = currentModuleIndex === 0 && currentLessonIndex === 0;
    const isLastLesson = 
        currentModuleIndex === course.modules.length - 1 && 
        currentLessonIndex === currentModule.lessons.length - 1;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                    ← Back to Courses
                </button>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{course.courseTitle}</h1>
                <div className="text-sm text-gray-600">
                    Module {currentModuleIndex + 1} of {course.modules.length}: {currentModule.moduleTitle}
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    {currentLesson.title}
                </h2>
                <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap mb-6">
                        {currentLesson.content}
                    </p>
                    {currentLesson.example && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-800 mb-2">Example:</h3>
                            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                                {currentLesson.example}
                            </pre>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
                <button
                    onClick={handlePrevious}
                    disabled={isFirstLesson}
                    className={`px-6 py-2 rounded-lg ${
                        isFirstLesson
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                    Previous
                </button>
                <div className="text-sm text-gray-600">
                    Lesson {currentLessonIndex + 1} of {currentModule.lessons.length}
                </div>
                <button
                    onClick={handleNext}
                    disabled={isLastLesson}
                    className={`px-6 py-2 rounded-lg ${
                        isLastLesson
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default function StudentDashboard() {
    const [courses, setCourses] = useState<DocListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<DocListResponse>('/courses/available');
            if (response.data.data) {
                setCourses(response.data.data);
            }
        } catch (err: any) {
            const errorResponse = err.response?.data as ErrorResponse;
            setError(errorResponse?.message || 'Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    };

    const handleCourseSelect = (courseId: string) => {
        setSelectedCourseId(courseId);
    };

    const handleBackToCourses = () => {
        setSelectedCourseId(null);
    };

    if (selectedCourseId) {
        return <CourseView docId={selectedCourseId} onBack={handleBackToCourses} />;
    }

    return (
        <div className="max-w-7xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8 text-center">Available Courses</h1>

            {loading ? (
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="text-xl text-gray-600">Loading courses...</div>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            ) : courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div
                            key={course._id}
                            onClick={() => handleCourseSelect(course._id)}
                            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                        >
                            <h2 className="text-xl font-semibold text-gray-800 mb-3">
                                {course.courseTitle}
                            </h2>
                            <div className="text-sm text-gray-600">
                                <p>Created: {new Date(course.createdAt).toLocaleDateString()}</p>
                                <p>Last updated: {new Date(course.updatedAt).toLocaleDateString()}</p>
                            </div>
                            <button
                                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Start Learning
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-600">
                    No courses available at the moment.
                </div>
            )}
        </div>
    );
} 