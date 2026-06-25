import { Instrument_Serif, Inter } from 'next/font/google';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
});

const inter = Inter({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata = {
  title: {
    template: '%s — Meridian CV',
    default: 'Meridian CV — AI-Powered Resume Builder',
  },
  description: 'Build a polished resume in minutes. Get section-by-section feedback and pinpoint ATS gaps.',
};

import Providers from './providers';
import MobileWarningPopup from '@/components/shared/MobileWarningPopup';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body>
        <Providers>
          {children}
          <MobileWarningPopup />
        </Providers>
      </body>
    </html>
  );
}