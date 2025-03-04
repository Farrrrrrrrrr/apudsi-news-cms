"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function AdminLayout({ children, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Articles', href: '/admin/articles', icon: '📝' },
    { name: 'Create Article', href: '/admin/articles/create', icon: '✏️' },
  ];

  // Add users management if superuser
  if (user?.role === 'superuser') {
    navigation.push({ name: 'Users', href: '/admin/users', icon: '👥' });
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-40 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
           onClick={() => setSidebarOpen(false)} />
      
      <div className={`fixed inset-y-0 left-0 w-64 bg-[#191970] transition-transform transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-auto md:h-screen z-50`}>
        <div className="flex items-center justify-center h-16 border-b border-[#191970]/30">
          <h2 className="text-white font-bold text-xl">APUDSI News CMS</h2>
        </div>
        
        <div className="mt-6 px-4">
          <div className="p-3 bg-[#191970]/30 rounded-md text-white">
            <p className="text-sm font-medium">Logged in as:</p>
            <p className="font-bold">{user?.name || user?.email}</p>
            <p className="text-xs uppercase mt-1 text-[#880808] font-semibold">{user?.role}</p>
          </div>
        </div>
        
        <nav className="mt-6 px-2 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${pathname === item.href ? 'bg-[#880808] text-white' : 'text-white hover:bg-[#191970]/50'}`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}

          {/* Add API Documentation Link */}
          <a
            href="/api/public/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-white hover:bg-[#191970]/50"
          >
            <span className="mr-3">📚</span>
            API Documentation
          </a>
        </nav>
        
        <div className="px-4 mt-auto mb-6">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-white hover:bg-[#191970]/50 rounded-md"
          >
            <span className="mr-3">🚪</span>
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
