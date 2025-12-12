'use client';

import { motion } from 'framer-motion';
import { Message } from '@/types/chat';

interface ChatMessageProps {
    message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-start gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}
        >
            {/* 아바타 */}
            <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 shadow-lg ${
                    isUser ? 'bg-gradient-to-br from-pink-400 to-purple-400' : 'bg-gradient-to-br from-purple-400 to-blue-400'
                }`}
            >
                {isUser ? '😊' : '🤖'}
            </motion.div>

            {/* 메시지 내용 */}
            <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-md ${
                    isUser ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-tr-sm' : 'bg-white text-gray-800 rounded-tl-sm'
                }`}
            >
                <p className='whitespace-pre-wrap break-words leading-relaxed'>{message.content}</p>
                <p className={`text-xs mt-2 ${isUser ? 'text-purple-100' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </p>
            </motion.div>
        </motion.div>
    );
}
