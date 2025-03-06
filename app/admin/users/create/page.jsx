import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import UserForm from '@/components/UserForm';

export const metadata = {
  title: 'Create User - APUDSI News CMS',
  description: 'Create a new user account',
};

export default async function CreateUserPage() {
  const session = await getServerSession(authOptions);
  
  // Only superuser can create users
  if (!session || session.user.role !== 'superuser') {
    redirect('/admin');
  }

  return (
    <AdminLayout user={session.user}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#191970]">Create New User</h1>
        <p className="text-sm text-gray-600 mt-1">
          Add a new user account to the system
        </p>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <UserForm />
      </div>
    </AdminLayout>
  );
}
