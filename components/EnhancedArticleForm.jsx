"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Dynamic import for rich text editor
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function EnhancedArticleForm({ article = null, userRole }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: article?.title || '',
    content: article?.content || '',
    image_path: article?.image_path || '',
    status: article?.status || 'draft',
    category_id: article?.category_id || '',
    tags: article?.tags || '',
    meta_description: article?.meta_description || '',
    featured: article?.featured || false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [touchedFields, setTouchedFields] = useState({});
  
  const isEditing = !!article;

  // Calculate word count from content
  useEffect(() => {
    if (formData.content) {
      // Strip HTML tags and count words
      const text = formData.content.replace(/<[^>]*>?/gm, '');
      const words = text.trim().split(/\s+/).filter(Boolean);
      setWordCount(words.length);
    } else {
      setWordCount(0);
    }
  }, [formData.content]);

  // Set image preview if article has image_path
  useEffect(() => {
    if (formData.image_path) {
      setPreview(formData.image_path);
    }
  }, [formData.image_path]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Mark field as touched
    setTouchedFields({
      ...touchedFields,
      [name]: true
    });
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const handleQuillChange = (content) => {
    setFormData({
      ...formData,
      content
    });
    
    // Mark content as touched
    setTouchedFields({
      ...touchedFields,
      content: true
    });
    
    // Clear error when content is changed
    if (errors.content) {
      setErrors({
        ...errors,
        content: undefined
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors({
        ...errors,
        image: 'Only JPG, PNG, GIF and WEBP images are allowed'
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({
        ...errors,
        image: 'Image size should be less than 5MB'
      });
      return;
    }
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Clear error when image is changed
    if (errors.image) {
      setErrors({
        ...errors,
        image: undefined
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    // Content validation
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (wordCount < 50) {
      newErrors.content = 'Content must have at least 50 words';
    }
    
    // Meta description validation
    if (formData.meta_description && formData.meta_description.length > 160) {
      newErrors.meta_description = 'Meta description must be less than 160 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation
    const allFields = { 
      title: true, 
      content: true, 
      meta_description: true 
    };
    setTouchedFields(allFields);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // First upload image if present
      let imagePath = formData.image_path;
      
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }
        
        const uploadResult = await uploadResponse.json();
        imagePath = uploadResult.filePath;
      }
      
      // Then create/update article
      const apiUrl = isEditing
        ? `/api/articles/${article.id}`
        : '/api/articles';

      const method = isEditing ? 'PUT' : 'POST';
      
      const response