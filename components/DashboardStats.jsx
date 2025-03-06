import Link from 'next/link';

export default function DashboardStats({ stats, userCount, isSuperuser }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-[#191970] rounded-md p-2">
              <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4 w-0 flex-1">
              <dl>
                <dt className="text-xs font-medium text-gray-500 truncate">Total Articles</dt>
                <dd>
                  <div className="text-base font-medium text-gray-900">{stats.total}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-2">
          <Link href="/admin/articles" className="text-xs font-medium text-[#191970] hover:text-[#191970]/80">
            View all
          </Link>
        </div>
      </div>
      
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-2">
              <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4 w-0 flex-1">
              <dl>
                <dt className="text-xs font-medium text-gray-500 truncate">Published</dt>
                <dd>
                  <div className="text-base font-medium text-gray-900">{stats.published}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-2">
          <Link href="/admin/articles?status=published" className="text-xs font-medium text-[#191970] hover:text-[#191970]/80">
            View published
          </Link>
        </div>
      </div>
      
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-500 rounded-md p-2">
              <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="ml-4 w-0 flex-1">
              <dl>
                <dt className="text-xs font-medium text-gray-500 truncate">Drafts</dt>
                <dd>
                  <div className="text-base font-medium text-gray-900">{stats.drafts}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-2">
          <Link href="/admin/articles?status=draft" className="text-xs font-medium text-[#191970] hover:text-[#191970]/80">
            View drafts
          </Link>
        </div>
      </div>
      
      {isSuperuser ? (
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-[#880808] rounded-md p-2">
                <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">Users</dt>
                  <dd>
                    <div className="text-base font-medium text-gray-900">{userCount}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-2">
            <Link href="/admin/users" className="text-xs font-medium text-[#191970] hover:text-[#191970]/80">
              Manage users
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-2">
                <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">In Review</dt>
                  <dd>
                    <div className="text-base font-medium text-gray-900">{stats.in_review || 0}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-2">
            <Link href="/admin/articles?workflow_status=in_review" className="text-xs font-medium text-[#191970] hover:text-[#191970]/80">
              View in review
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
