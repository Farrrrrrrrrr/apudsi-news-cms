import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import MediaLibrary from '@/components/media/MediaLibrary';
import { query } from '@/lib/db';

export const metadata = {
  title: 'Media Library - APUDSI News CMS',
  description: 'Manage media files for APUDSI News CMS',
};

export default async function MediaPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  const page = parseInt(searchParams?.page || '1', 10);
  const limit = 20;
  const offset = (page - 1) * limit;
  
  // Get total count for pagination
  const countResult = await query('SELECT COUNT(*) as total FROM media');
  const totalMedia = parseInt(countResult.rows[0].total, 10);
  const totalPages = Math.ceil(totalMedia / limit);

  // Get media files
  const mediaResult = await query(
    `SELECT id, filename, filepath, filetype, filesize, width, height, created_at, user_id
     FROM media
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  return (
    <AdminLayout user={session.user}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#191970]">Media Library</h1>
          <p className="text-gray-600">Manage your images and other media files</p>
        </div>
      </div>
      
      <MediaLibrary 
        media={mediaResult.rows} 
        currentPage={page} 
        totalPages={totalPages}
      />
    </AdminLayout>
  );
}
