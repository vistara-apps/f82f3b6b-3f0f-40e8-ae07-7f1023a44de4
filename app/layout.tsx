import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Right Guard - Know Your Rights. Instantly.',
  description: 'A mobile app providing instant, state-specific legal rights information and documentation tools for interactions with law enforcement.',
  keywords: ['legal rights', 'law enforcement', 'civil rights', 'documentation', 'Base', 'MiniApp'],
  authors: [{ name: 'Right Guard Team' }],
  openGraph: {
    title: 'Right Guard - Know Your Rights. Instantly.',
    description: 'Instant access to your legal rights and documentation tools.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
