import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { GradientBackground } from '@/components/ui';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Matchback Platform',
  description: 'Enterprise matchback automation platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GradientBackground />
        {children}
      </body>
    </html>
  );
}
