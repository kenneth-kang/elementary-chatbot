'use client';

import { motion } from 'framer-motion';

export default function TypingIndicator() {
    return (
        <div className='flex items-start gap-3 mb-4'>
            <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className='w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-xl flex-shrink-0 shadow-lg'
            >
                🤖
            </motion.div>

            <div className='bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-md'>
                <div className='flex gap-1'>
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                y: [0, -8, 0],
                            }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                            className='w-2 h-2 bg-purple-400 rounded-full'
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
