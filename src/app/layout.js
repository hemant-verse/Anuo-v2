import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import OfflineGuard from "@/components/OfflineGuard";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/features/auth/hooks';

export const metadata = {
  title: "Auno | College Marketplace",
  description: "College marketplace for students to buy and sell items",
};

export const viewport = {
  themeColor: "#0f766e",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="192x192" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0f766e" />
      </head>
      <body className="min-h-full flex flex-col">
        <OfflineGuard />
        <Toaster position="bottom-center" />
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
