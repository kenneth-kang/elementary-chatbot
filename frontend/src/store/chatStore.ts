import { atom } from 'jotai';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { Message, DocumentStats } from '@/types/chat';

// 초기 환영 메시지
const initialMessage: Message = {
    id: 'welcome',
    content: '안녕! 나는 너의 학습 친구야! 😊\n궁금한 것이 있거나 도움이 필요하면 언제든지 물어봐!\n함께 재미있게 배워보자!',
    role: 'assistant',
    timestamp: new Date(),
};

// Jotai Atoms
export const messagesAtom = atom<Message[]>([initialMessage]);
export const isLoadingAtom = atom<boolean>(false);
export const errorAtom = atom<string | null>(null);
export const ragEnabledAtom = atom<boolean>(true);
export const documentStatsAtom = atom<DocumentStats | null>(null);

// 메시지 추가 액션
export const addMessageAtom = atom(null, (get, set, message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
        ...message,
        id: `msg-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
    };
    set(messagesAtom, [...get(messagesAtom), newMessage]);
});

// 메시지 업데이트 액션 (스트리밍용)
export const updateLastMessageAtom = atom(null, (get, set, content: string) => {
    const messages = get(messagesAtom);
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const updatedMessage = {
        ...lastMessage,
        content: content,
    };

    set(messagesAtom, [...messages.slice(0, -1), updatedMessage]);
});

// 메시지 전체 삭제
export const clearMessagesAtom = atom(null, (get, set) => {
    set(messagesAtom, [initialMessage]);
    set(errorAtom, null);
});

// RxJS Subjects (이벤트 스트림)
export const chatRequestSubject = new Subject<{
    message: string;
    useRag: boolean;
}>();

export const uploadRequestSubject = new Subject<{
    file: File;
    metadata: {
        subject?: string;
        grade?: string;
        topic?: string;
    };
}>();

export const healthCheckSubject = new BehaviorSubject<boolean>(false);

// RxJS Observables (구독 가능한 스트림)
export const chatRequest$ = chatRequestSubject.asObservable();
export const uploadRequest$ = uploadRequestSubject.asObservable();
export const healthCheck$ = healthCheckSubject.asObservable();
