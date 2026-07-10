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
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
