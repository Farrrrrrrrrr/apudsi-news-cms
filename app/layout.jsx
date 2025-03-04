import './globals.css';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth/next';
import { Providers } from './providers';
// Import directly from relative path instead of using alias
import { authOptions } from '../lib/auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'APUDSI News CMS',
  description: 'Content Management System for APUDSI News',
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
