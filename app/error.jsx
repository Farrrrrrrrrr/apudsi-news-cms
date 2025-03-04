'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  const isDatabaseError = error.message?.includes("doesn't exist") || 
                         error.message?.includes("Connection refused") ||
                         error.message?.includes("ECONNREFUSED");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-[#191970]">
            Something went wrong!
          </h2>
          {isDatabaseError ? (
            <div className="mt-4">
              <p className="text-red-600 mb-4">
                Database connection or setup error. Please run the database setup script.
              </p>
              <div className="bg-gray-800 text-white p-4 rounded-md text-sm text-left overflow-x-auto">
                <code>
                  npm run setup
                </code>
              </div>
              <p className="mt-4 text-gray-600">
                After running the setup, refresh this page.
              </p>
            </div>
          ) : (
            <p className="mt-2 text-gray-600">
              An unexpected error occurred. Please try again.
            </p>
          )}
        </div>
        <div className="flex space-x-4 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#191970] hover:bg-[#191970]/90 focus:outline-none"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
