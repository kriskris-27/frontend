export interface ApiResponse<T> {
    message: string;
    data?: T;
    details?: string;
    error?: string;
    timestamp: string;
}

export interface Lesson {
    title: string;
    content: string;
    example?: string;
}

export interface Module {
    moduleTitle: string;
    lessons: Lesson[];
}

export interface StructuredDoc {
    _id?: string;
    courseTitle: string;
    modules: Module[];
    createdAt?: string;
    updatedAt?: string;
}

export interface DocListItem {
    _id: string;
    courseTitle: string;
    createdAt: string;
    updatedAt: string;
}

export interface StructuredDocResponse extends ApiResponse<StructuredDoc> {}
export interface DocListResponse extends ApiResponse<DocListItem[]> {}
export interface ErrorResponse extends ApiResponse<null> {} 