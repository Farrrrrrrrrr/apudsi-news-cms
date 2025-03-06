"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Dynamic import for rich text editor to avoid server-side issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function ArticleForm({ article = null }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  
  // Form state
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [imagePath, setImagePath] = useState(article?.image_path || '');
  const [status, setStatus] = useState(article?.status || 'draft');
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  
  const isEditing = !!article;

  // Set preview image if article has an image_path
  useEffect(() => {
    if (article?.image_path) {
      setPreview(article.image_path);
    }
  }, [article]);
  
  // Mark a field as touched when it loses focus
  const handleBlur = (field) => {
    setTouchedFields({
      ...touchedFields,
      [field]: true
    });
  };
  
  // Validate a single field
  const validateField = (field, value) => {
    switch (field) {
      case 'title':
        return !value || value.trim() === '' 
          ? 'Title is required' 
          : value.length < 5
          ? 'Title must be at least 5 characters'
          : value.length > 100
          ? 'Title must be less than 100 characters'
          : null;
      case 'content':
        // For content, we should strip HTML to check real content length
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = value;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        
        return !value || value.trim() === '<p><br></p>' || textContent.trim() === ''
          ? 'Content is required'
          : textContent.length < 50
          ? 'Content is too short (minimum 50 characters)'
          : null;
      default:
        return null;
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {
      title: validateField('title', title),
      content: validateField('content', content)
    };
    
    // Remove null errors
    Object.keys(newErrors).forEach(key => {
      if (newErrors[key] === null) {
        delete newErrors[key];
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setErrors({
        ...errors,
        image: 'File must be an image (JPEG, PNG, GIF, WEBP)'
      });
      return;
    }
    
    // Validate file size (max 2MB)
    if (selectedFile.size > 2 * 1024 * 1024) {
      setErrors({
        ...errors,
        image: 'Image size must be less than 2MB'
      });
      return;
    }
    
    // Clear previous errors
    const newErrors = {...errors};
    delete newErrors.image;
    setErrors(newErrors);
    
    // Store file for upload
    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  // Upload image to server
  const uploadImage = async () => {
    if (!file) return null;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload image');
      }
      
      const data = await response.json();
      return data.filePath; // Return the path to the uploaded image
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    if (!validateForm()) {
      // Mark all fields as touched to show errors
      setTouchedFields({
        title: true,
        content: true
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Upload image if selected
      let uploadedImagePath = imagePath;
      if (file) {
        uploadedImagePath = await uploadImage();
      }
      
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
          image_path: uploadedImagePath,
          status,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Something went wrong');
      }
      
      router.push('/admin/articles');
      router.refresh();
    } catch (err) {
      setErrors({
        form: err.message
      });
      setLoading(false);
    }
  };

  // Reusable input field component
  const InputField = ({ id, label, type = 'text', value, onChange, error, required = false, ...props }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={() => handleBlur(id)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#191970] focus:border-[#191970] ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}
        required={required}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label="Article form">
      {errors.form && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md" role="alert">
          {errors.form}
        </div>
      )}

      <InputField
        id="title"
        label="Article Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={touchedFields.title ? errors.title : undefined}
        required
        maxLength={100}
        placeholder="Enter the article title"
      />

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          Featured Image
        </label>
        <div className="mt-1 flex items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {preview ? 'Change Image' : 'Upload Image'}
          </button>
          <input
            ref={fileInputRef}
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="sr-only"
            aria-describedby="image-error"
          />
        </div>
        {errors.image && (
          <p id="image-error" className="mt-1 text-sm text-red-600">
            {errors.image}
          </p>
        )}
        {preview && (
          <div className="mt-2">
            <div className="relative h-48 w-full overflow-hidden rounded-md">
              <Image 
                src={preview} 
                alt="Preview" 
                fill={true}
                style={{ objectFit: 'cover' }}
                className="rounded-md"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                setFile(null);
                setImagePath('');
              }}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Remove Image
            </button>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Article Content <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          {typeof window !== 'undefined' && (
            <ReactQuill
              id="content"
              value={content}
              onChange={(value) => {
                setContent(value);
                if (touchedFields.content) {
                  setErrors({
                    ...errors,
                    content: validateField('content', value)
                  });
                }
              }}
              onBlur={() => handleBlur('content')}
              theme="snow"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{'list': 'ordered'}, {'list': 'bullet'}],
                  ['link', 'image'],
                  ['clean']
                ],
              }}
              className="h-64 mb-12" // Extra space for the editor toolbar
              aria-invalid={!!errors.content}
              aria-describedby={errors.content ? "content-error" : undefined}
            />
          )}
        </div>
        {touchedFields.content && errors.content && (
          <p id="content-error" className="mt-1 text-sm text-red-600">
            {errors.content}
          </p>
        )}
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
          aria-label="Article status"
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
          aria-live="polite"
        >
          {loading ? 'Saving...' : isEditing ? 'Update Article' : 'Create Article'}
        </button>
      </div>
    </form>
  );
}
