import '../index.css';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'Grand Dandiya Raas | SARN Group',
  description: 'Join us for the Grand Dandiya Raas presented by SARN Group on 18 October 2026. Experience live DJ, traditional Garba, and more.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Toaster 
          position="top-center" 
          toastOptions={{
            className: 'font-sans text-sm font-medium',
            style: {
              background: '#2D1F1C',
              color: '#fff',
              border: '1px solid rgba(220, 38, 38, 0.2)',
            },
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
