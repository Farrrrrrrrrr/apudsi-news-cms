import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import ArticleForm from '@/components/ArticleForm';

export const metadata = {
  title: 'Create Article - APUDSI News CMS',
  description: 'Create a new news article',
};

export default async function CreateArticlePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  return (
    <AdminLayout user={session.user}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#191970]">Create New Article</h1>
        <p className="text-sm text-gray-600 mt-1">
          Fill out the form below to create a new article
        </p>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <ArticleForm />
      </div>
    </AdminLayout>
  );
}
