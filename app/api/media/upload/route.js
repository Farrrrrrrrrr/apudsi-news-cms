import { getServerSession } from 'next-auth/next';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { query } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import sharp from 'sharp';

// Configure upload directory
const uploadDir = join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
const ensureUploadDir = async () => {
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create upload directory:', error);
  }
};

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    const files = formData.getAll('files');
    
    if (!files || files.length === 0) {
      return Response.json({ error: 'No files provided' }, { status: 400 });
    }
    
    // Ensure upload directory exists
    await ensureUploadDir();
    
    const uploadedFiles = [];
    
    // Process each file
    for (const file of files) {
      // Generate a unique filename to prevent overwriting
      const uniqueId = uuidv4();
      const originalName = file.name;
      const fileExtension = originalName.split('.').pop();
      const uniqueFilename = `${uniqueId}.${fileExtension}`;
      const relativePath = `/uploads/${uniqueFilename}`;
      const fullPath = join(process.cwd(), 'public', relativePath);
      
      // Get file buffer
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Get file info
      const filesize = buffer.length;
      const filetype = file.type;
      
      // For images, get dimensions and optimize
      let width = null;
      let height = null;
      
      if (filetype.startsWith('image/')) {
        try {
          // Optimize image and get metadata
          const image = sharp(buffer);
          const metadata = await image.metadata();
          width = metadata.width;
          height = metadata.height;
          
          // Save optimized image
          if (filetype === 'image/jpeg' || filetype === 'image/jpg') {
            await image.jpeg({ quality: 85 }).toFile(fullPath);
          } else if (filetype === 'image/png') {
            await image.png({ compressionLevel: 8 }).toFile(fullPath);
          } else if (filetype === 'image/webp') {
            await image.webp({ quality: 85 }).toFile(fullPath);
          } else if (filetype === 'image/gif') {
            // Save GIF as is (sharp doesn't optimize GIFs well)
            await writeFile(fullPath, buffer);
          } else {
            // Unknown image type, save as is
            await writeFile(fullPath, buffer);
          }
        } catch (error) {
          console.error('Error processing image:', error);
          // If image processing fails, save original file
          await writeFile(fullPath, buffer);
        }
      } else {
        // For non-image files, save as is
        await writeFile(fullPath, buffer);
      }
      
      // Save file record in database
      const result = await query(
        `INSERT INTO media (
          user_id, filename, filepath, filetype, filesize, width, height
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          session.user.id,
          originalName,
          relativePath,
          filetype,
          filesize,
          width,
          height
        ]
      );
      
      uploadedFiles.push({
        id: result.insertId,
        filename: originalName,
        filepath: relativePath,
        filetype: filetype,
        filesize: filesize,
        width: width,
        height: height
      });
    }
    
    return Response.json({ 
      success: true, 
      files: uploadedFiles 
    }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: 'Failed to upload files' }, { status: 500 });
  }
}
