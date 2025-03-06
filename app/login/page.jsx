import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../lib/auth';
import LoginForm from '@/components/LoginForm';
import Link from 'next/link';

export const metadata = {
  title: 'Login - APUDSI News CMS',
  description: 'Sign in to access the content management system',
};

export default async function LoginPage() {
  // If already authenticated, redirect to admin
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/admin');
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-[#191970] py-4">
        <div className="container mx-auto px-4">
          <Link href="/" className="text-white text-xl font-bold">APUDSI News</Link>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#191970]">CMS Login</h1>
            <p className="text-gray-600 mt-2">Sign in to manage content</p>
          </div>
          
          <LoginForm />
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Don't have an account? Contact your administrator.</p>
            <Link href="/" className="text-[#191970] hover:underline mt-2 inline-block">
              Return to public site
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-4 text-center text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} APUDSI News. All rights reserved.</p>
      </footer>
    </div>
  );
}
