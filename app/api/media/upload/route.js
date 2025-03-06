import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { query } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// Create uploads directory if it doesn't exist
async function ensureUploadsDir() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    return uploadsDir;
  } catch (error) {
    console.error('Failed to create uploads directory', error);
    throw error;
  }
}

// Process and optimize image
async function processImage(buffer, filename, mimeType) {
  try {
    // Get image dimensions
    const metadata = await sharp(buffer).metadata();
    
    // Optimize image based on type
    let processedBuffer;
    let optimizedMimeType = mimeType;
    
    switch (mimeType) {
      case 'image/jpeg':
        processedBuffer = await sharp(buffer)
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();
        break;
      case 'image/png':
        processedBuffer = await sharp(buffer)
          .png({ compressionLevel: 8, progressive: true })
          .toBuffer();
        break;
      case 'image/webp':
        processedBuffer = await sharp(buffer)
          .webp({ quality: 85 })
          .toBuffer();
        break;
      default:
        // For unsupported types, convert to webp
        processedBuffer = await sharp(buffer)
          .webp({ quality: 85 })
          .toBuffer();
        optimizedMimeType = 'image/webp';
        filename = filename.split('.').slice(0, -1).join('.') + '.webp';
    }
    
    return {
      buffer: processedBuffer,
      filename,
      mimeType: optimizedMimeType,
      width: metadata.width,
      height: metadata.height
    };
  } catch (error) {
    console.error('Image processing error:', error);
    throw error;
  }
}

export async function POST(request) {
  // Verify authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }
    
    // Generate a unique filename
    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueFilename = `${uuidv4()}-${file.name.replace(/\s+/g, '-').toLowerCase()}`;
    
    // Process and optimize the image
    const { 
      buffer: processedBuffer, 
      filename: optimizedFilename,
      mimeType,
      width,
      height
    } = await processImage(buffer, uniqueFilename, file.type);
    
    // Ensure uploads directory exists
    const uploadsDir = await ensureUploadsDir();
    
    // Save the file
    const filePath = path.join(uploadsDir, optimizedFilename);
    await writeFile(filePath, processedBuffer);
    
    // Save to the media library database
    const publicPath = `/uploads/${optimizedFilename}`;
    const result = await query(
      `INSERT INTO media_library (
        user_id, 
        filename, 
        original_filename, 
        file_size, 
        mime_type, 
        path, 
        width, 
        height
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        session.user.id,
        optimizedFilename,
        file.name,
        processedBuffer.length,
        mimeType,
        publicPath,
        width,
        height
      ]
    );
    
    const mediaId = result.rows.insertId;
    
    return NextResponse.json({ 
      success: true, 
      filePath: publicPath,
      mediaId,
      width,
      height,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
