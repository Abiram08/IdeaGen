import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AsciiDots } from '@/components/ui/AsciiDots';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'IdeaGen - Your Smart Idea Generator',
  description: 'Generate project ideas from trending content across Reddit, Hacker News, Dev.to, and Devpost. Powered by AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#08080c] text-white min-h-screen antialiased`}>
        {/* ASCII dot pattern background */}
        <AsciiDots />
        
        {/* Noise overlay */}
        <div className="noise" />
        
        {/* Main content */}
        <Providers>
          <div className="relative min-h-screen z-10">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
