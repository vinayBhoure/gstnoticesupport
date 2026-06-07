import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GST Notice Support — Expert GST Litigation Help in 24 Hours',
  description:
    'Professional GST litigation services for businesses, CAs, and Advocates. Expert help with GST notices, appeals, and compliance.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        {children}
        <Toaster position="bottom-center" toastOptions={{ duration: 5000 }} />
      </body>
    </html>
  );
}
