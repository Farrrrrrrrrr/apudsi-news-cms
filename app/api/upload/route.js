import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Process the file
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: 'File type not allowed' }, { status: 400 });
    }

    // Create unique filename
    const filename = `${uuidv4()}-${file.name.replace(/\s/g, '_')}`;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    
    try {
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Save file to disk
      const filePath = join(uploadsDir, filename);
      await writeFile(filePath, buffer);
      
      // Return the file path that can be stored in the database
      return Response.json({ 
        success: true,
        filePath: `/uploads/${filename}`
      });
    } catch (error) {
      console.error('Error saving file:', error);
      return Response.json({ error: 'Error saving file' }, { status: 500 });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
