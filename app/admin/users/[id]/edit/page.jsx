import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import AdminLayout from '@/components/AdminLayout';
import UserForm from '@/components/UserForm';

export async function generateMetadata({ params }) {
  const { id } = params;
  const result = await query('SELECT name, email FROM users WHERE id = ?', [id]);
  const user = result.rows[0];
  
  return {
    title: `Edit ${user?.name || user?.email || 'User'} - APUDSI News CMS`,
    description: 'Edit user details',
  };
}

export default async function EditUserPage({ params }) {
  const session = await getServerSession(authOptions);
  
  // Only superusers can edit users
  if (!session || session.user.role !== 'superuser') {
    redirect('/admin');
  }

  const { id } = params;
  
  // Get user details
  const result = await query(
    'SELECT id, name, email, role FROM users WHERE id = ?',
    [id]
  );

  // Check if user exists
  if (result.rows.length === 0) {
    redirect('/admin/users');
  }

  const user = result.rows[0];

  return (
    <AdminLayout user={session.user}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#191970]">Edit User</h1>
        <p className="text-sm text-gray-600 mt-1">
          Update user information
        </p>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <UserForm user={user} />
      </div>
    </AdminLayout>
  );
}
