"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function MediaLibrary({ onSelect, maxItems = 1 }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);
  
  // Fetch images from media library
  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/media');
      
      if (!response.ok) {
        throw new Error('Failed to load media library');
      }
      
      const data = await response.json();
      setImages(data.media || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Load images on component mount
  useEffect(() => {
    fetchImages();
  }, []);
  
  // Handle file selection
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setError('Some files are not valid images. Please upload only JPEG, PNG, GIF, or WebP.');
      return;
    }
    
    // Validate file sizes (max 5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Some files exceed the 5MB limit.');
      return;
    }
    
    setError(null);
    setUploading(true);
    
    try {
      // Upload each file
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }
      
      // Refresh the media library
      await fetchImages();
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err.message);
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };
  
  // Toggle image selection
  const toggleImageSelection = (imageId) => {
    if (selectedImages.includes(imageId)) {
      setSelectedImages(selectedImages.filter(id => id !== imageId));
    } else {
      // If single selection mode, replace the selection
      if (maxItems === 1) {
        setSelectedImages([imageId]);
      } else if (selectedImages.length < maxItems) {
        // Otherwise add to selection if under the limit
        setSelectedImages([...selectedImages, imageId]);
      }
    }
  };
  
  // Confirm selection
  const confirmSelection = () => {
    const selected = images.filter(img => selectedImages.includes(img.id));
    onSelect(maxItems === 1 ? selected[0] : selected);
  };
  
  // Filter images based on search query
  const filteredImages = images.filter(img => 
    img.original_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (img.alt_text && img.alt_text.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-4" id="media-library-title">Media Library</h2>
      
      {/* Upload section */}
      <div className="mb-6 p-4 border border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="mt-1 text-sm text-gray-600">Upload images to your library</p>
          <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF or WEBP up to 5MB</p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={maxItems > 1}
            className="hidden"
            onChange={handleFileChange}
            aria-labelledby="media-library-title"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#191970] hover:bg-[#191970]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191970]"
            aria-busy={uploading}
          >
            {uploading ? 'Uploading...' : 'Select Files'}
          </button>
        </div>
        
        {error && (
          <div className="mt-2 text-sm text-red-600 text-center" role="alert">
            {error}
          </div>
        )}
      </div>
      
      {/* Search and filter */}
      <div className="mb-4">
        <label htmlFor="image-search" className="sr-only">Search images</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="image-search"
            type="search"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-[#191970] focus:border-[#191970] sm:text-sm"
            placeholder="Search by filename or description"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Image grid */}
      {loading ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#191970]"></div>
        </div>
      ) : filteredImages.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
          {filteredImages.map((image) => (
            <div 
              key={image.id}
              className={`relative rounded-md overflow-hidden cursor-pointer border-2 ${
                selectedImages.includes(image.id) ? 'border-[#191970]' : 'border-transparent'
              }`}
              onClick={() => toggleImageSelection(image.id)}
            >
              <div className="aspect-w-1 aspect-h-1">
                <img
                  src={image.path}
                  alt={image.alt_text || image.original_filename}
                  className="object-cover w-full h-full"
                />
              </div>
              {selectedImages.includes(image.id) && (
                <div className="absolute top-2 right-2 bg-[#191970] rounded-full p-1">
                  <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <p className="text-xs truncate p-1 bg-white">{image.original_filename}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No images found</p>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex justify-end space-x-2 mt-4">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191970]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={confirmSelection}
          disabled={selectedImages.length === 0}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#191970] hover:bg-[#191970]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191970]"
        >
          {maxItems === 1 ? 'Select Image' : `Select ${selectedImages.length} Images`}
        </button>
      </div>
    </div>
  );
}