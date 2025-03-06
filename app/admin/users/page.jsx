import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import { query } from '@/lib/db';
import DeleteUserButton from '@/components/DeleteUserButton';

export const metadata = {
  title: 'Users Management - APUDSI News CMS',
  description: 'Manage users in the APUDSI News CMS',
};

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  
  // Only superuser can access user management
  if (!session || session.user.role !== 'superuser') {
    redirect('/admin');
  }

  // Get users
  const result = await query(`
    SELECT id, name, email, role, created_at
    FROM users
    ORDER BY created_at DESC
  `);

  return (
    <AdminLayout user={session.user}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#191970]">Users</h1>
          <p className="text-gray-600">Manage system users</p>
        </div>
        <Link 
          href="/admin/users/create"
          className="px-4 py-2 bg-[#191970] text-white rounded-md hover:bg-[#191970]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191970]"
        >
          Create New User
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {result.rows.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 bg-[#191970] rounded-full flex items-center justify-center text-white">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name || 'No name'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'superuser' 
                      ? 'bg-purple-100 text-purple-800' 
                      : user.role === 'editor'
                      ? 'bg-blue-100 text-blue-800'
                      : user.role === 'publisher'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/users/${user.id}/edit`} className="text-[#191970] hover:text-[#191970]/80 mr-4">Edit</Link>
                  {user.id !== session.user.id && (
                    <Link href={`/admin/users/${user.id}/delete`} className="text-red-600 hover:text-red-800">Delete</Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
