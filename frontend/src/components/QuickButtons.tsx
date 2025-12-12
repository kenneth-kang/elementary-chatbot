'use client';

import { motion } from 'framer-motion';
import { Calculator, MessageCircle, Book, Microscope } from 'lucide-react';

interface QuickButtonsProps {
    onQuickSelect: (message: string) => void;
    disabled?: boolean;
}

const quickButtons = [
    {
        icon: Calculator,
        label: '수학 도움',
        message: '수학 문제 도와줘',
        gradient: 'from-blue-400 to-cyan-400',
    },
    {
        icon: MessageCircle,
        label: '고민 상담',
        message: '친구랑 싸웠어',
        gradient: 'from-pink-400 to-rose-400',
    },
    {
        icon: Book,
        label: '재미있는 이야기',
        message: '재미있는 이야기 해줘',
        gradient: 'from-purple-400 to-indigo-400',
    },
    {
        icon: Microscope,
        label: '과학 궁금해',
        message: '과학 궁금해',
        gradient: 'from-green-400 to-emerald-400',
    },
];

export default function QuickButtons({ onQuickSelect, disabled }: QuickButtonsProps) {
    return (
        <div className='bg-white border-t border-gray-200 px-4 py-3'>
            <div className='flex flex-wrap gap-2 justify-center'>
                {quickButtons.map((button, index) => {
                    const Icon = button.icon;
                    return (
                        <motion.button
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onQuickSelect(button.message)}
                            disabled={disabled}
                            className={`
                bg-gradient-to-r ${button.gradient}
                text-white px-4 py-2 rounded-full
                flex items-center gap-2 text-sm font-medium
                shadow-md hover:shadow-lg transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
                        >
                            <Icon className='w-4 h-4' />
                            <span className='hidden sm:inline'>{button.label}</span>
                            <span className='sm:hidden'>{button.label.split(' ')[0]}</span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
