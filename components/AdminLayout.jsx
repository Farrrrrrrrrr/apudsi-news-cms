"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NotificationsMenu from './NotificationsMenu';

export default function AdminLayout({ children, user }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Navigation items with role-based visibility and smaller icons
  const navItems = [
    { 
      name: 'Dashboard', 
      href: '/admin/dashboard', 
      icon: (
        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      roles: ['writer', 'editor', 'publisher', 'superuser']
    },
    { 
      name: 'Articles', 
      href: '/admin/articles', 
      icon: (
        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ), 
      roles: ['writer', 'editor', 'publisher', 'superuser']
    },
    { 
      name: 'Media Library', 
      href: '/admin/media', 
      icon: (
        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ), 
      roles: ['writer', 'editor', 'publisher', 'superuser']
    },
    { 
      name: 'Users', 
      href: '/admin/users', 
      icon: (
        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ), 
      roles: ['superuser']
    },
    { 
      name: 'API Docs', 
      href: '/admin/api-docs', 
      icon: (
        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ), 
      roles: ['superuser']
    },
    { 
      name: 'Settings', 
      href: '/admin/settings', 
      icon: (
        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ), 
      roles: ['superuser']
    },
  ];
  
  // Filter navigation based on user role
  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        
        <div className="relative flex flex-col max-w-xs w-full h-full bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <img className="h-7 w-auto" src="/logo.png" alt="APUDSI News Logo" />
              <span className="ml-2 text-lg font-bold text-[#191970]">APUDSI News</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive 
                      ? 'bg-gray-100 text-[#191970]' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#191970]'
                    }`}
                  >
                    <span className="mr-3 flex-shrink-0">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 group block">
              <div className="flex items-center">
                <div className="inline-block h-9 w-9 rounded-full bg-[#191970] text-white flex items-center justify-center">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user.name || user.email}</p>
                  <Link href="/api/auth/logout" className="text-xs font-medium text-gray-500 hover:text-[#191970]">
                    Logout
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow bg-white pt-5 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <img className="h-6 w-auto" src="/logo.png" alt="APUDSI News Logo" />
            <span className="ml-2 text-base font-bold text-[#191970]">APUDSI News</span>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-1.5 text-sm font-medium rounded-md ${isActive 
                      ? 'bg-gray-100 text-[#191970]' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#191970]'
                    }`}
                  >
                    <span className="mr-3 flex-shrink-0">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-3">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="inline-block h-6 w-6 rounded-full bg-[#191970] text-white flex items-center justify-center text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <div className="ml-2">
                  <p className="text-xs font-medium text-gray-700 truncate max-w-[180px]">{user.name || user.email}</p>
                  <p className="text-xs font-medium text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="md:pl-64 flex flex-col h-screen">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 flex-shrink-0 h-12 bg-white shadow flex items-center">
          <button
            type="button"
            className="px-4 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="sr-only">Open sidebar</span>
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-base font-semibold text-gray-900">
                {/* Page title based on pathname */}
                {pathname === '/admin/dashboard' ? 'Dashboard' : 
                 pathname === '/admin/articles' ? 'Articles' :
                 pathname === '/admin/media' ? 'Media Library' :
                 pathname === '/admin/users' ? 'Users' :
                 pathname === '/admin/api-docs' ? 'API Documentation' :
                 pathname === '/admin/settings' ? 'Settings' :
                 pathname.startsWith('/admin/articles/') ? 'Article Details' :
                 'Admin Portal'}
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* Notifications dropdown */}
              <NotificationsMenu userId={user.id} />
              
              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div>
                  <Link href="/api/auth/logout" className="ml-4 px-2.5 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md">
                    Logout
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-100">
          <div className="py-5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
