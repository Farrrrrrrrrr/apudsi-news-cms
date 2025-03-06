import Link from 'next/link';

export default function DashboardStats({ stats, userCount, isSuperuser }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-[#191970]/10 rounded-md p-3">
            <svg className="h-6 w-6 text-[#191970]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Total Articles</dt>
              <dd className="text-lg font-semibold text-gray-900">{stats.total || 0}</dd>
            </dl>
          </div>
        </div>
        <div className="mt-3">
          <Link href="/admin/articles" className="text-sm text-[#191970] hover:text-[#191970]/80">
            View all →
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Published</dt>
              <dd className="text-lg font-semibold text-gray-900">{stats.published || 0}</dd>
            </dl>
          </div>
        </div>
        <div className="mt-3">
          <Link href="/admin/articles?status=published" className="text-sm text-[#191970] hover:text-[#191970]/80">
            View published →
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">In Review</dt>
              <dd className="text-lg font-semibold text-gray-900">{stats.in_review || 0}</dd>
            </dl>
          </div>
        </div>
        <div className="mt-3">
          <Link href="/admin/articles?workflow_status=in_review" className="text-sm text-[#191970] hover:text-[#191970]/80">
            View pending reviews →
          </Link>
        </div>
      </div>
      
      {isSuperuser ? (
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Users</dt>
                <dd className="text-lg font-semibold text-gray-900">{userCount || 0}</dd>
              </dl>
            </div>
          </div>
          <div className="mt-3">
            <Link href="/admin/users" className="text-sm text-[#191970] hover:text-[#191970]/80">
              Manage users →
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gray-100 rounded-md p-3">
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Drafts</dt>
                <dd className="text-lg font-semibold text-gray-900">{stats.drafts || 0}</dd>
              </dl>
            </div>
          </div>
          <div className="mt-3">
            <Link href="/admin/articles?status=draft" className="text-sm text-[#191970] hover:text-[#191970]/80">
              View drafts →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
