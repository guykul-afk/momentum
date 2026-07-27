import type { Metadata, Viewport } from 'next';
import { Rubik } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/store';

const rubik = Rubik({
  subsets: ['hebrew', 'latin'],
  variable: '--font-rubik',
});

export const metadata: Metadata = {
  title: 'Momentum Tasks - ניהול משימות ומומנטום יומי',
  description: 'מערכת מתקדמת לניהול משימות, הרגלים וסנכרון מומנטום יומי',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Momentum',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#06b6d4',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body
        className={`${rubik.variable} font-sans bg-slate-50 text-slate-900 antialiased min-h-screen selection:bg-cyan-100 selection:text-cyan-900`}
      >
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
