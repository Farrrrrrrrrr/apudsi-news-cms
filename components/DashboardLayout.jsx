"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function DashboardLayout({ children, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  
  // Define navigation items based on user role
  const navigationItems = (() => {
    // Common items for all users
    const common = [
      { name: 'Dashboard', href: '/dashboard', icon: '📊' }
    ];
    
    // Role-specific items
    const roleSpecific = {
      superadmin: [
        { name: 'Articles', href: '/admin/articles', icon: '📝' },
        { name: 'Create Article', href: '/admin/articles/create', icon: '✏️' },
        { name: 'Users', href: '/admin/users', icon: '👥' },
        { name: 'Settings', href: '/admin/settings', icon: '⚙️' }
      ],
      writer: [
        { name: 'My Articles', href: '/admin/articles', icon: '📝' },
        { name: 'Create New', href: '/admin/articles/create', icon: '✏️' },
        { name: 'Drafts', href: '/admin/articles?status=draft', icon: '📋' },
        { name: 'In Review', href: '/admin/articles?status=in_review', icon: '👀' }
      ],
      publisher: [
        { name: 'Pending Publication', href: '/admin/articles?status=approved', icon: '📋' },
        { name: 'Published Articles', href: '/admin/articles?status=published', icon: '🚀' },
        { name: 'Analytics', href: '/admin/analytics', icon: '📊' }
      ]
    };
    
    return [...common, ...(roleSpecific[user.role] || [])];
  })();
  
  // Format role for display
  const formattedRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 bg-[#191970] w-64 transform transition-transform duration-300 ease-in-out z-30 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:static md:z-auto`}>
        {/* Logo/branding */}
        <div className="flex items-center justify-center h-16 border-b border-[#191970]/30">
          <h2 className="text-white font-bold text-xl">APUDSI News CMS</h2>
        </div>
        
        {/* User profile */}
        <div className="p-4">
          <div className="bg-[#191970]/30 rounded-md p-3 text-white">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 h-10 w-10 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-xl">{user.name ? user.name[0].toUpperCase() : '👤'}</span>
              </div>
              <div>
                <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                <p className="text-xs mt-1 uppercase text-[#880808]/80 font-semibold">{formattedRole}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="mt-4 px-2 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? 'bg-[#880808] text-white'
                  : 'text-white/80 hover:bg-[#191970]/50 hover:text-white'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
          
          {/* External links */}
          <a
            href="/api/public/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-white/80 hover:bg-[#191970]/50 hover:text-white"
          >
            <span className="mr-3">📚</span>
            API Documentation
          </a>
          
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-white/80 hover:bg-[#191970]/50 hover:text-white"
          >
            <span className="mr-3">🌐</span>
            View Public Site
          </a>
        </nav>
        
        {/* Sign out button */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-white/80 hover:bg-[#191970]/50 hover:text-white rounded-md"
          >
            <span className="mr-3">🚪</span>
            Sign Out
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col min-h-screen md:ml-64">
        {/* Top navbar */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center md:hidden">
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
              
              <div className="flex-1 flex justify-end sm:justify-between">
                <div className="hidden sm:flex sm:items-center">
                  <h1 className="text-lg font-medium text-gray-800">
                    {pathname === '/dashboard' ? 'Dashboard' : 
                     pathname.includes('/articles/create') ? 'Create Article' :
                     pathname.includes('/articles') ? 'Articles' :
                     pathname.includes('/users') ? 'Users' :
                     pathname.includes('/analytics') ? 'Analytics' : 'Dashboard'}
                  </h1>
                </div>
                
                <div className="flex items-center">
                  {/* Notifications */}
                  <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                    <span className="sr-only">View notifications</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </button>
                  
                  {/* Profile dropdown */}
                  <div className="ml-3 relative">
                    <div>
                      <button 
                        className="flex items-center max-w-xs bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191970] text-gray-500"
                        onClick={() => signOut({ callbackUrl: '/login' })}
                      >
                        <span className="sr-only">Sign out</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8 bg-gray-50">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 p-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} APUDSI News CMS. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
