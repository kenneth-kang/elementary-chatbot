import { Observable, from, throwError, of } from 'rxjs';
import { ajax, AjaxResponse } from 'rxjs/ajax';
import { map, catchError, retry, timeout, shareReplay } from 'rxjs/operators';
import { Message, ChatResponse, DocumentStats, UploadResponse } from '@/types/chat';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const REQUEST_TIMEOUT = 30000; // 30초

/**
 * RxJS 기반 API 서비스
 */
export class ApiService {
    /**
     * 서버 상태 확인
     */
    static checkHealth(): Observable<{ status: string; rag_stats: DocumentStats }> {
        return ajax.getJSON<{ status: string; rag_stats: DocumentStats }>(`${API_URL}/health`).pipe(
            timeout(5000),
            retry(2),
            catchError((error) => {
                console.error('Health check failed:', error);
                return throwError(() => new Error('서버 연결 실패'));
            })
        );
    }

    /**
     * 채팅 메시지 전송 (대화 이력 포함)
     */
    static sendMessage(message: string, history: Message[], useRag: boolean = true): Observable<ChatResponse> {
        const conversationHistory = history.map((msg) => ({
            role: msg.role,
            content: msg.content,
        }));
        console.log('api sendMessage : ', message);
        return ajax({
            url: `${API_URL}/chat`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                message,
                history: conversationHistory,
                use_rag: useRag,
            },
        }).pipe(
            timeout(REQUEST_TIMEOUT),
            map((ajaxResponse: AjaxResponse<ChatResponse>) => ajaxResponse.response),
            retry(1),
            catchError((error) => {
                console.error('Chat API error:', error);
                return throwError(() => new Error('죄송해요, 지금은 대답하기 어려워요. 😢 잠시 후 다시 시도해줄래요?'));
            })
        );
    }

    /**
     * 스트리밍 채팅 (EventSource 기반)
     */
    static sendMessageStream(message: string, history: Message[], useRag: boolean = true): Observable<{ content?: string; done?: boolean }> {
        return new Observable((observer) => {
            const conversationHistory = history.map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));

            fetch(`${API_URL}/chat/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    history: conversationHistory,
                    use_rag: useRag,
                }),
            })
                .then(async (response) => {
                    if (!response.ok) {
                        throw new Error('서버 응답 오류');
                    }

                    const reader = response.body?.getReader();
                    const decoder = new TextDecoder();

                    if (!reader) {
                        throw new Error('스트림을 읽을 수 없습니다');
                    }

                    while (true) {
                        const { done, value } = await reader.read();

                        if (done) {
                            observer.complete();
                            break;
                        }

                        const chunk = decoder.decode(value);
                        const lines = chunk.split('\n');

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                try {
                                    const data = JSON.parse(line.slice(6));
                                    observer.next(data);
                                } catch (e) {
                                    console.error('Parse error:', e);
                                }
                            }
                        }
                    }
                })
                .catch((error) => {
                    console.error('Stream error:', error);
                    observer.error(new Error('스트리밍 중 오류가 발생했습니다'));
                });

            // Cleanup 함수
            return () => {
                console.log('Stream subscription cleaned up');
            };
        });
    }

    /**
     * 파일 업로드
     */
    static uploadFile(
        file: File,
        metadata: {
            subject?: string;
            grade?: string;
            topic?: string;
        }
    ): Observable<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        if (metadata.subject) formData.append('subject', metadata.subject);
        if (metadata.grade) formData.append('grade', metadata.grade);
        if (metadata.topic) formData.append('topic', metadata.topic);

        return ajax({
            url: `${API_URL}/upload`,
            method: 'POST',
            body: formData,
        }).pipe(
            timeout(60000), // 파일 업로드는 60초 타임아웃
            map((ajaxResponse: AjaxResponse<UploadResponse>) => ajaxResponse.response),
            catchError((error) => {
                console.error('Upload error:', error);
                return throwError(() => new Error('파일 업로드 실패'));
            })
        );
    }

    /**
     * 문서 통계 조회
     */
    static getDocumentStats(): Observable<DocumentStats> {
        return ajax.getJSON<{ rag_stats: DocumentStats }>(`${API_URL}/health`).pipe(
            map((response) => response.rag_stats),
            timeout(5000),
            catchError((error) => {
                console.error('Stats error:', error);
                return of({
                    total_documents: 0,
                    subjects: {},
                });
            }),
            shareReplay(1) // 결과 캐싱
        );
    }

    /**
     * 문서 검색 (테스트용)
     */
    static searchDocuments(query: string, nResults: number = 3): Observable<any> {
        return ajax({
            url: `${API_URL}/documents/search`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: { query, n_results: nResults },
        }).pipe(
            timeout(10000),
            map((ajaxResponse: AjaxResponse<any>) => ajaxResponse.response),
            catchError((error) => {
                console.error('Search error:', error);
                return throwError(() => new Error('문서 검색 실패'));
            })
        );
    }

    /**
     * 모든 문서 삭제
     */
    static clearDocuments(): Observable<{ message: string }> {
        return ajax({
            url: `${API_URL}/documents/clear`,
            method: 'POST',
        }).pipe(
            timeout(5000),
            map((ajaxResponse: AjaxResponse<{ message: string }>) => ajaxResponse.response),
            catchError((error) => {
                console.error('Clear error:', error);
                return throwError(() => new Error('문서 삭제 실패'));
            })
        );
    }

    /**
     * 사용 가능한 모델 목록
     */
    static getModels(): Observable<{ models: string[] }> {
        return ajax.getJSON<{ models: string[] }>(`${API_URL}/models`).pipe(
            timeout(5000),
            catchError((error) => {
                console.error('Models error:', error);
                return of({ models: [] });
            }),
            shareReplay(1)
        );
    }
}
