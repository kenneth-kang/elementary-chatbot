'use client';

import { useState, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, Smile } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    disabled?: boolean;
}

const emojis = ['😊', '🤔', '😄', '🎉', '👍', '❤️', '🌟', '📚'];

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
    const [message, setMessage] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);

    const handleSend = () => {
        const trimmedMessage = message.trim();
        if (trimmedMessage && !disabled) {
            onSendMessage(trimmedMessage);
            setMessage('');
            setShowEmoji(false);
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const addEmoji = (emoji: string) => {
        setMessage((prev) => prev + emoji);
        setShowEmoji(false);
    };

    return (
        <div className='bg-white border-t border-gray-200 px-4 py-4'>
            <div className='max-w-4xl mx-auto'>
                {/* 이모지 선택기 */}
                {showEmoji && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='bg-white rounded-2xl shadow-lg p-3 mb-3 border border-purple-200'
                    >
                        <div className='flex flex-wrap gap-2 justify-center'>
                            {emojis.map((emoji) => (
                                <motion.button
                                    key={emoji}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => addEmoji(emoji)}
                                    className='text-2xl hover:bg-purple-50 rounded-lg p-2 transition-colors'
                                >
                                    {emoji}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* 입력 영역 */}
                <div className='flex items-end gap-2'>
                    {/* 이모지 버튼 */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowEmoji(!showEmoji)}
                        disabled={disabled}
                        className='bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-3 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50'
                        aria-label='이모지 추가'
                    >
                        <Smile className='w-5 h-5' />
                    </motion.button>

                    {/* 텍스트 입력 */}
                    <div className='flex-1 relative'>
                        <TextareaAutosize
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder='메시지를 입력하세요...'
                            disabled={disabled}
                            maxRows={5}
                            className='
                w-full px-4 py-3 pr-12
                border-2 border-purple-200 rounded-2xl
                focus:border-purple-400 focus:outline-none
                resize-none text-base
                disabled:bg-gray-100 disabled:cursor-not-allowed
                transition-colors
              '
                        />
                    </div>

                    {/* 전송 버튼 */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSend}
                        disabled={disabled || !message.trim()}
                        className='
              bg-gradient-to-r from-purple-500 to-pink-500
              text-white p-3 rounded-full
              shadow-md hover:shadow-lg
              transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
            '
                        aria-label='메시지 전송'
                    >
                        <Send className='w-5 h-5' />
                    </motion.button>
                </div>

                {/* 힌트 텍스트 */}
                <p className='text-xs text-gray-400 mt-2 text-center'>Enter로 전송 · Shift + Enter로 줄바꿈</p>
            </div>
        </div>
    );
}
