'use client';

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, BookOpen } from 'lucide-react';
import { documentStatsAtom } from '@/store/chatStore';

export default function DocumentStats() {
    const [stats] = useAtom(documentStatsAtom);
    const [isOpen, setIsOpen] = useState(false);

    if (!stats || stats.total_documents === 0) {
        return null;
    }

    return (
        <>
            {/* 통계 버튼 */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className='bg-gradient-to-r from-blue-400 to-cyan-400 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition-all'
            >
                <BookOpen className='w-4 h-4' />
                <span className='hidden sm:inline'>자료 {stats.total_documents}개</span>
                <span className='sm:hidden'>{stats.total_documents}</span>
            </motion.button>

            {/* 통계 모달 */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* 배경 오버레이 */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className='fixed inset-0 bg-black/50 z-40'
                        />

                        {/* 모달 내용 */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 50 }}
                            className='fixed inset-0 flex items-center justify-center z-50 p-4'
                        >
                            <div className='bg-white rounded-2xl shadow-2xl max-w-md w-full p-6'>
                                {/* 헤더 */}
                                <div className='flex items-center justify-between mb-6'>
                                    <h2 className='text-2xl font-bold text-gray-800 flex items-center gap-2'>
                                        <FileText className='w-6 h-6 text-blue-500' />
                                        학습 자료 통계
                                    </h2>
                                    <button onClick={() => setIsOpen(false)} className='text-gray-400 hover:text-gray-600 transition-colors'>
                                        <X className='w-6 h-6' />
                                    </button>
                                </div>

                                {/* 전체 문서 수 */}
                                <div className='bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-6'>
                                    <p className='text-sm text-gray-600 mb-1'>전체 문서</p>
                                    <p className='text-3xl font-bold text-blue-600'>{stats.total_documents}개</p>
                                </div>

                                {/* 과목별 통계 */}
                                <div>
                                    <h3 className='text-lg font-semibold text-gray-700 mb-3'>과목별 자료</h3>
                                    <div className='space-y-2'>
                                        {Object.entries(stats.subjects).map(([subject, count]) => (
                                            <motion.div
                                                key={subject}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className='flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                                            >
                                                <span className='font-medium text-gray-700'>{subject}</span>
                                                <span className='text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full'>
                                                    {count}개
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* 안내 메시지 */}
                                <div className='mt-6 p-4 bg-purple-50 rounded-lg'>
                                    <p className='text-sm text-purple-700'>💡 업로드한 자료를 바탕으로 AI가 더 정확하게 답변해줘요!</p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
