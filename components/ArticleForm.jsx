"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamic import for rich text editor
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function ArticleForm({ article = null }) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [imagePath, setImagePath] = useState(article?.image_path || '');
  const [status, setStatus] = useState(article?.status || 'draft');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const isEditing = !!article;

  useEffect(() => {
    if (article?.image_path) {
      setPreview(article.image_path);
    }
  }, [article]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!title || !content) {
      setError('Title and content are required');
      setLoading(false);
      return;
    }

    try {
      const apiUrl = isEditing
        ? `/api/articles/${article.id}`
        : '/api/articles';

      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          image_path: imagePath,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      router.push('/admin/articles');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    // In a real implementation, this would upload the image to a server
    // For this example, we'll just use a placeholder
    
    const file = e.target.files[0];
    if (file) {
      // Mock image upload - in real app you'd use FormData to upload
      setImagePath(`/uploads/${file.name}`);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Article Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#191970] focus:border-[#191970]"
          required
        />
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          Featured Image
        </label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#191970] file:text-white hover:file:bg-[#191970]/90"
        />
        {preview && (
          <div className="mt-2">
            <img src={preview} alt="Preview" className="h-32 w-auto object-cover rounded-md" />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Article Content
        </label>
        <div className="mt-1">
          <ReactQuill
            value={content}
            onChange={setContent}
            theme="snow"
            className="h-64 mb-12" // Extra space for the editor toolbar
          />
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#191970] focus:border-[#191970]"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.push('/admin/articles')}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191970]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#191970] hover:bg-[#191970]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#880808]"
        >
          {loading ? 'Saving...' : isEditing ? 'Update Article' : 'Create Article'}
        </button>
      </div>
    </form>
  );
}
