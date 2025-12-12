'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadRequestSubject, healthCheckSubject } from '@/store/chatStore';
import { ApiService } from '@/services/api.service';
import { Subscription } from 'rxjs';

export default function DocumentUpload() {
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    // 메타데이터
    const [subject, setSubject] = useState('');
    const [grade, setGrade] = useState('');
    const [topic, setTopic] = useState('');

    useEffect(() => {
        let subscription: Subscription;

        if (isOpen) {
            // 업로드 스트림 구독
            subscription = uploadRequestSubject.subscribe(() => {
                setUploading(true);
                setUploadStatus('idle');
            });
        }

        return () => {
            subscription?.unsubscribe();
        };
    }, [isOpen]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setUploadStatus('idle');
        }
    };

    const handleUpload = () => {
        if (!file) return;

        setUploading(true);
        setUploadStatus('idle');

        // RxJS를 통한 업로드
        ApiService.uploadFile(file, { subject, grade, topic }).subscribe({
            next: (response) => {
                setUploadStatus('success');
                setMessage(`${response.documents_added}개의 문서가 추가되었어요!`);
                setFile(null);
                setSubject('');
                setGrade('');
                setTopic('');

                // 문서 통계 새로고침
                healthCheckSubject.next(true);

                setTimeout(() => {
                    setIsOpen(false);
                    setUploadStatus('idle');
                }, 2000);
            },
            error: (error) => {
                setUploadStatus('error');
                setMessage('업로드 중 오류가 발생했어요 😢');
                console.error('Upload error:', error);
            },
            complete: () => {
                setUploading(false);
            },
        });
    };

    return (
        <>
            {/* 업로드 버튼 */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className='bg-gradient-to-r from-green-400 to-emerald-400 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-md hover:shadow-lg transition-all'
            >
                <Upload className='w-4 h-4' />
                <span className='hidden sm:inline'>학습자료 추가</span>
            </motion.button>

            {/* 모달 */}
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
                                        <FileText className='w-6 h-6 text-purple-500' />
                                        학습자료 추가
                                    </h2>
                                    <button onClick={() => setIsOpen(false)} className='text-gray-400 hover:text-gray-600 transition-colors'>
                                        <X className='w-6 h-6' />
                                    </button>
                                </div>

                                {/* 파일 선택 */}
                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>파일 선택 (PDF, DOCX, TXT)</label>
                                    <input
                                        type='file'
                                        accept='.pdf,.docx,.txt'
                                        onChange={handleFileSelect}
                                        className='w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100'
                                    />
                                    {file && <p className='mt-2 text-sm text-gray-600'>선택된 파일: {file.name}</p>}
                                </div>

                                {/* 메타데이터 */}
                                <div className='space-y-3 mb-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>과목</label>
                                        <select
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                                        >
                                            <option value=''>선택하세요</option>
                                            <option value='수학'>수학</option>
                                            <option value='국어'>국어</option>
                                            <option value='과학'>과학</option>
                                            <option value='영어'>영어</option>
                                            <option value='사회'>사회</option>
                                            <option value='기타'>기타</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>학년</label>
                                        <select
                                            value={grade}
                                            onChange={(e) => setGrade(e.target.value)}
                                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                                        >
                                            <option value=''>선택하세요</option>
                                            <option value='1학년'>1학년</option>
                                            <option value='2학년'>2학년</option>
                                            <option value='3학년'>3학년</option>
                                            <option value='4학년'>4학년</option>
                                            <option value='5학년'>5학년</option>
                                            <option value='6학년'>6학년</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>주제</label>
                                        <input
                                            type='text'
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            placeholder='예: 분수, 곱셈, 광합성 등'
                                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                                        />
                                    </div>
                                </div>

                                {/* 상태 메시지 */}
                                {uploadStatus !== 'idle' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                                            uploadStatus === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                        }`}
                                    >
                                        {uploadStatus === 'success' ? <CheckCircle className='w-5 h-5' /> : <AlertCircle className='w-5 h-5' />}
                                        <span className='text-sm'>{message}</span>
                                    </motion.div>
                                )}

                                {/* 업로드 버튼 */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleUpload}
                                    disabled={!file || uploading}
                                    className='w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                                >
                                    {uploading ? '업로드 중...' : '업로드'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
