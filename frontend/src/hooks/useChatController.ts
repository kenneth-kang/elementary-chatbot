import { useEffect, useRef } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Subscription } from 'rxjs';
import { switchMap, tap, catchError, finalize, take } from 'rxjs/operators';
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

export function useChatController() {
    const [messages] = useAtom(messagesAtom);
    const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
    const [error, setError] = useAtom(errorAtom);
    const [ragEnabled] = useAtom(ragEnabledAtom);
    const setDocumentStats = useSetAtom(documentStatsAtom);
    const addMessage = useSetAtom(addMessageAtom);

    const subscriptionsRef = useRef<Subscription[]>([]);

    useEffect(() => {
        console.log('🔧 useChatController 초기화');

        // 채팅 요청 스트림 구독
        const chatSubscription = chatRequestSubject
            .pipe(
                tap(({ message }) => {
                    console.log('📨 채팅 요청 수신:', message);
                    setIsLoading(true);
                    setError(null);

                    // 사용자 메시지 추가
                    addMessage({ content: message, role: 'user' });
                }),
                switchMap(({ message: userMessage, useRag }) => {
                    console.log('🔄 switchMap 시작');

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

                    console.log('📜 대화 이력:', conversationHistory.length, '개');

                    // API 호출 Observable 생성
                    return ApiService.sendMessage(userMessage, conversationHistory, useRag).pipe(
                        tap((response) => {
                            console.log('✅ tap 실행 - API 응답:', response);
                            console.log('✅ 응답 내용:', response.response.substring(0, 100));

                            // 응답 메시지 추가
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
                            console.error('❌ catchError 실행:', err);
                            const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했어요.';

                            setError(errorMessage);
                            addMessage({
                                content: errorMessage,
                                role: 'assistant',
                            });

                            // 오류를 처리하고 빈 Observable 반환
                            return of(null);
                        }),
                        finalize(() => {
                            console.log('🏁 finalize 실행 - 로딩 해제');
                            setIsLoading(false);
                        })
                    );
                })
            )
            .subscribe({
                next: (value) => {
                    console.log('✅ subscribe next:', value);
                },
                error: (err) => {
                    console.error('❌ subscribe error:', err);
                },
                complete: () => {
                    console.log('🏁 subscribe complete');
                },
            });

        console.log('📌 chatSubscription 생성됨');
        subscriptionsRef.current.push(chatSubscription);

        // 파일 업로드 스트림 구독
        const uploadSubscription = uploadRequestSubject
            .pipe(
                switchMap(({ file, metadata }) => {
                    return ApiService.uploadFile(file, metadata).pipe(
                        tap((response) => {
                            console.log('✅ 파일 업로드 성공:', response);
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

        // Cleanup
        return () => {
            console.log('🧹 useChatController cleanup');
            subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
            subscriptionsRef.current = [];
        };
    }, [
        // messages는 제거! (무한 루프 방지)
        addMessage,
        setIsLoading,
        setError,
        setDocumentStats,
        ragEnabled,
    ]);

    const sendMessage = (message: string) => {
        console.log('🚀 sendMessage 호출:', message);
        console.log('   isLoading:', isLoading);
        console.log('   message.trim():', message.trim());

        if (isLoading || !message.trim()) {
            console.warn('⚠️ 전송 불가:', { isLoading, isEmpty: !message.trim() });
            return;
        }

        console.log('📤 chatRequestSubject.next 호출');
        chatRequestSubject.next({
            message: message.trim(),
            useRag: ragEnabled,
        });
        console.log('📤 chatRequestSubject.next 완료');
    };

    const uploadFile = (file: File, metadata: { subject?: string; grade?: string; topic?: string }) => {
        uploadRequestSubject.next({ file, metadata });
    };

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
