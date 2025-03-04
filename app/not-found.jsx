import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-extrabold text-[#191970]">404</h1>
        <p className="mt-3 text-xl text-gray-700">Page not found</p>
        <p className="mt-2 text-gray-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#191970] hover:bg-[#191970]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191970]"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
