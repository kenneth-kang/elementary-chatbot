// 채팅 메시지 타입
export interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
}

// API 응답 타입
export interface ChatResponse {
    response: string;
    timestamp: string;
    rag_used?: boolean;
    sources?: Array<{
        subject?: string;
        grade?: string;
        topic?: string;
        filename?: string;
        page?: number;
    }>;
}

// 채팅 상태 타입
export interface ChatState {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
}

// 문서 통계 타입
export interface DocumentStats {
    total_documents: number;
    subjects: Record<string, number>;
}

// 업로드 응답 타입
export interface UploadResponse {
    message: string;
    filename: string;
    documents_added: number;
    metadata: {
        subject?: string;
        grade?: string;
        topic?: string;
        filename: string;
        upload_date: string;
    };
}
