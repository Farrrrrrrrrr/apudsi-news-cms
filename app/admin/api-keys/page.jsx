import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import ApiKeysList from '@/components/ApiKeysList';
import { query } from '@/lib/db';

export const metadata = {
  title: 'API Keys - APUDSI News CMS',
  description: 'Manage API keys for APUDSI News CMS',
};

export default async function ApiKeysPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  // Only superadmin can access this page
  if (session.user.role !== 'superadmin') {
    redirect('/admin');
  }
  
  // Get API keys
  const result = await query(`
    SELECT ak.*, u.name as created_by_name
    FROM api_keys ak
    JOIN users u ON ak.created_by = u.id
    ORDER BY ak.created_at DESC
  `);

  return (
    <AdminLayout user={session.user}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#191970]">API Keys</h1>
          <p className="text-gray-600">Manage API keys for external access to your content</p>
        </div>
      </div>
      
      <ApiKeysList apiKeys={result.rows} />
    </AdminLayout>
  );
}
