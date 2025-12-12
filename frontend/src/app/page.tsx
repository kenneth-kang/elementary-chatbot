'use client';

import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { messagesAtom, isLoadingAtom, errorAtom } from '@/store/chatStore';
import { useChatController } from '@/hooks/useChatController';
import Header from '@/components/Header';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import QuickButtons from '@/components/QuickButtons';
import TypingIndicator from '@/components/TypingIndicator';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export default function Home() {
    const [messages] = useAtom(messagesAtom);
    const [isLoading] = useAtom(isLoadingAtom);
    const [error] = useAtom(errorAtom);
    const chatAreaRef = useRef<HTMLDivElement>(null);

    // RxJS 기반 채팅 컨트롤러
    const { sendMessage } = useChatController();

    // 자동 스크롤
    useEffect(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    return (
        <div className='flex flex-col h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50'>
            <Header />

            <QuickButtons onQuickSelect={sendMessage} disabled={isLoading} />

            {/* 채팅 영역 */}
            <div ref={chatAreaRef} className='flex-1 overflow-y-auto px-4 py-6 space-y-4'>
                <div className='max-w-4xl mx-auto'>
                    <AnimatePresence>
                        {messages.map((message) => (
                            <ChatMessage key={message.id} message={message} />
                        ))}
                    </AnimatePresence>

                    {isLoading && <TypingIndicator />}

                    {/* 에러 메시지 */}
                    {error && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className='bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-start gap-3'
                        >
                            <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' />
                            <p className='text-red-700 text-sm'>{error}</p>
                        </motion.div>
                    )}

                    {/* 개발 모드에서만 표시 */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className='mt-4 p-4 bg-gray-100 rounded-lg text-xs text-gray-600'>
                            <p className='font-bold mb-2'>🔄 RxJS 통신 활성화 | 대화 이력: {messages.length - 1}개</p>
                            <p className='text-gray-500'>(Observable 기반 반응형 데이터 스트림)</p>
                        </div>
                    )}
                </div>
            </div>

            <ChatInput onSendMessage={sendMessage} disabled={isLoading} />

            {/* 배경 데코레이션 */}
            <div className='fixed top-20 left-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob' />
            <div className='fixed top-40 right-10 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000' />
            <div className='fixed bottom-20 left-20 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000' />
        </div>
    );
}
