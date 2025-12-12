'use client';

import { motion } from 'framer-motion';
import { Sparkles, RotateCcw } from 'lucide-react';
import { useSetAtom } from 'jotai';
import { clearMessagesAtom } from '@/store/chatStore';
import DocumentUpload from './DocumentUpload';
import DocumentStats from './DocumentStats';

export default function Header() {
    const clearMessages = useSetAtom(clearMessagesAtom);

    const handleReset = () => {
        if (confirm('대화를 처음부터 다시 시작할까요?')) {
            clearMessages();
        }
    };

    return (
        <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className='bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-white px-6 py-5 shadow-lg'
        >
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className='text-3xl'>
                        🎓
                    </motion.div>
                    <div>
                        <h1 className='text-2xl font-bold flex items-center gap-2'>
                            나의 학습 친구
                            <Sparkles className='w-5 h-5 animate-pulse' />
                        </h1>
                        <p className='text-sm opacity-90'>무엇이든 물어보세요! 함께 배워가요 😊</p>
                    </div>
                </div>

                <div className='flex items-center gap-2'>
                    <DocumentStats />
                    <DocumentUpload />

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleReset}
                        className='bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 transition-colors'
                        aria-label='대화 초기화'
                    >
                        <RotateCcw className='w-4 h-4' />
                        <span className='hidden sm:inline'>새로 시작</span>
                    </motion.button>
                </div>
            </div>
        </motion.header>
    );
}
