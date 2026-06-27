import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FlexURL Create',
  description: 'Create a short link in seconds. Privacy-first, no account required.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen flex items-center justify-center" style={{ padding: '2rem 1.25rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
