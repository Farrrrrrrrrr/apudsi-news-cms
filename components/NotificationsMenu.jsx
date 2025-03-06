"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function NotificationsMenu({ userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications?limit=5');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.pagination.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      
      if (!response.ok) throw new Error('Failed to mark notifications as read');
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => ({ ...notif, is_read: 1 }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Mark a single notification as read
  const markAsRead = async (id) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });
      
      if (!response.ok) throw new Error('Failed to mark notification as read');
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => 
          notif.id === id ? { ...notif, is_read: 1 } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch notifications on mount and when userId changes
  useEffect(() => {
    if (userId) {
      fetchNotifications();
      
      // Set up polling for new notifications
      const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [userId]);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'article_review':
        return (
          <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'article_published':
        return (
          <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'comment':
        return (
          <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        );
      case 'system':
        return (
          <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 bg-white rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[#191970]"
      >
        <span className="sr-only">View notifications</span>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center justify-center transform -translate-y-1/4 translate-x-1/4">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-2" role="menu" aria-orientation="vertical" aria-labelledby="notifications-menu">
            <div className="px-3 py-2 flex justify-between items-center border-b border-gray-200">
              <h3 className="text-xs font-semibold text-gray-700">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-[#191970] hover:text-[#191970]/80"
                >
                  Mark all as read
                </button>
              )}
            </div>
            
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-[#191970]/20 border-t-[#191970] rounded-full mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 ${notification.is_read ? '' : 'bg-blue-50'}`}
                  >
                    <Link 
                      href={notification.link || '#'}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                      className="flex items-start"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 w-0 flex-1">
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>No notifications</p>
              </div>
            )}
            
            <div className="border-t border-gray-200 py-2 px-3 text-center">
              <Link
                href="/admin/notifications"
                className="text-xs text-[#191970] hover:text-[#191970]/80"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
