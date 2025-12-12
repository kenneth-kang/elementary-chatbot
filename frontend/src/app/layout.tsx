import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';

const notoSansKr = Noto_Sans_KR({
    subsets: ['latin'],
    weight: ['400', '500', '700'],
    variable: '--font-noto-sans-kr',
});

export const metadata: Metadata = {
    title: '나의 학습 친구 - 초등학생 AI 챗봇',
    description: '초등학생을 위한 친절한 학습 및 인성 지원 AI 챗봇',
    keywords: ['초등학생', '학습', 'AI', '챗봇', '교육'],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='ko'>
            <body className={`${notoSansKr.variable} antialiased`}>{children}</body>
        </html>
    );
}
