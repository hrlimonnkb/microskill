// app/layout.js

import { Inter } from 'next/font/google';
import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';
import { Providers } from '@/components/Providers'; // <--- ১. এই লাইনটি নতুন যোগ করুন

const inter = Inter({ subsets: ['latin'] });

// --- মেটাডেটা (যেমন ছিল তেমনই থাকবে) ---
export const metadata = {
  title: {
    default: 'Microskills',
    template: '%s | Microskills',
  },
  description: 'Microskills থেকে সেরা কোর্সগুলো করে আপনার দক্ষতা বৃদ্ধি করুন এবং লক্ষ্যে পৌঁছান।',
  keywords: ['microskills', 'bangla course', 'online learning', 'skill development', 'IT course'],
  authors: [{ name: 'Microskills Team', url: 'https://yourwebsite.com' }],
  openGraph: {
    title: 'Microskills - আপনার দক্ষতার প্রবেশদ্বার',
    description: 'সেরা কোর্সগুলো করে আপনার দক্ষতা বৃদ্ধি করুন।',
    url: 'https://yourwebsite.com',
    siteName: 'Microskills',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};
// --- মেটাডেটা শেষ ---

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body className={inter.className}>
        {/* ২. Providers দিয়ে সবকিছু মুড়িয়ে দিন */}
        <Providers>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}