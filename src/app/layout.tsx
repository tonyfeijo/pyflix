import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import AutoJellyfinSync from '@/components/AutoJellyfinSync';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pyflix-three.vercel.app'),
  title: 'PyFlix - Tu servicio de streaming',
  description: 'Disfruta de las mejores series y películas en PyFlix. Streaming ilimitado, sin anuncios.',
  keywords: ['streaming', 'películas', 'series', 'netflix', 'entretenimiento'],
  authors: [{ name: 'PyFlix' }],
  creator: 'PyFlix',
  publisher: 'PyFlix',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://pyflix.example.com',
    siteName: 'PyFlix',
    title: 'PyFlix - Tu servicio de streaming',
    description: 'Disfruta de las mejores series y películas en PyFlix.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PyFlix',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PyFlix',
    description: 'Tu servicio de streaming favorito',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
      </head>
      <body className="bg-netflix-black text-netflix-white min-h-screen">
        <AutoJellyfinSync />
        {children}
      </body>
    </html>
  );
}