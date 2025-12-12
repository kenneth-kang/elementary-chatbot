import { useEffect, useRef } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Subscription } from 'rxjs';
import { switchMap, tap, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import {
    messagesAtom,
    isLoadingAtom,
    errorAtom,
    addMessageAtom,
    ragEnabledAtom,
    documentStatsAtom,
    chatRequestSubject,
    uploadRequestSubject,
    healthCheckSubject,
} from '@/store/chatStore';
import { ApiService } from '@/services/api.service';

/**
 * RxJS 기반 채팅 컨트롤러 Hook
 */
export function useChatController() {
    const [messages] = useAtom(messagesAtom);
    const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
    const [error, setError] = useAtom(errorAtom);
    const [ragEnabled] = useAtom(ragEnabledAtom);
    const setDocumentStats = useSetAtom(documentStatsAtom);
    const addMessage = useSetAtom(addMessageAtom);

    const subscriptionsRef = useRef<Subscription[]>([]);

    useEffect(() => {
        // 채팅 요청 스트림 구독
        const chatSubscription = chatRequestSubject
            .pipe(
                tap(() => {
                    setIsLoading(true);
                    setError(null);
                }),
                switchMap(({ message: userMessage, useRag }) => {
                    // 사용자 메시지 추가
                    addMessage({ content: userMessage, role: 'user' });

                    // 대화 이력 준비
                    const conversationHistory = messages
                        .filter((msg) => msg.id !== 'welcome')
                        .concat([
                            {
                                id: `temp-${Date.now()}`,
                                role: 'user' as const,
                                content: userMessage,
                                timestamp: new Date(),
                            },
                        ]);

                    // API 호출
                    return ApiService.sendMessage(userMessage, conversationHistory, useRag).pipe(
                        tap((response) => {
                            // 응답 메시지 추가
                            console.log('sendMessage result : ', response);
                            addMessage({
                                content: response.response,
                                role: 'assistant',
                            });

                            // RAG 사용 여부 로깅
                            if (response.rag_used && response.sources) {
                                console.log('📚 RAG 사용됨, 참고 자료:', response.sources);
                            }
                        }),
                        catchError((err) => {
                            const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했어요.';

                            setError(errorMessage);
                            addMessage({
                                content: errorMessage,
                                role: 'assistant',
                            });

                            return of(null);
                        }),
                        finalize(() => {
                            setIsLoading(false);
                        })
                    );
                })
            )
            .subscribe();

        subscriptionsRef.current.push(chatSubscription);

        // 파일 업로드 스트림 구독
        const uploadSubscription = uploadRequestSubject
            .pipe(
                switchMap(({ file, metadata }) => {
                    return ApiService.uploadFile(file, metadata).pipe(
                        tap((response) => {
                            console.log('✅ 파일 업로드 성공:', response);
                            // 문서 통계 새로고침
                            healthCheckSubject.next(true);
                        }),
                        catchError((err) => {
                            console.error('❌ 파일 업로드 실패:', err);
                            setError('파일 업로드 중 오류가 발생했어요');
                            return of(null);
                        })
                    );
                })
            )
            .subscribe();

        subscriptionsRef.current.push(uploadSubscription);

        // 헬스체크 스트림 구독
        const healthSubscription = healthCheckSubject
            .pipe(
                switchMap(() => ApiService.checkHealth()),
                tap((healthData) => {
                    if (healthData.rag_stats) {
                        setDocumentStats(healthData.rag_stats);
                    }
                }),
                catchError((err) => {
                    console.error('❌ 서버 연결 실패:', err);
                    setError('⚠️ 서버와 연결할 수 없어요. 백엔드 서버가 실행 중인지 확인해주세요!');
                    return of(null);
                })
            )
            .subscribe();

        subscriptionsRef.current.push(healthSubscription);

        // 초기 헬스체크
        healthCheckSubject.next(true);

        // Cleanup: 모든 구독 해제
        return () => {
            subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
            subscriptionsRef.current = [];
        };
    }, [messages, addMessage, setIsLoading, setError, setDocumentStats]);

    // 메시지 전송 함수
    const sendMessage = (message: string) => {
        if (isLoading || !message.trim()) return;
        console.log('sendMessage : ', message);
        chatRequestSubject.next({
            message: message.trim(),
            useRag: ragEnabled,
        });
    };

    // 파일 업로드 함수
    const uploadFile = (file: File, metadata: { subject?: string; grade?: string; topic?: string }) => {
        uploadRequestSubject.next({ file, metadata });
    };

    // 헬스체크 강제 실행
    const refreshStats = () => {
        healthCheckSubject.next(true);
    };

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        uploadFile,
        refreshStats,
    };
}
