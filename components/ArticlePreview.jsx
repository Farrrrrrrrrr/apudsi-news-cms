"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ArticlePreview({ article, mode = 'preview' }) {
  const [showEditControls, setShowEditControls] = useState(false);
  const [viewMode, setViewMode] = useState(mode); // 'preview' or 'mobile' or 'tablet'
  const previewRef = useRef(null);
  const router = useRouter();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ESC key closes preview
      if (e.key === 'Escape' && mode === 'fullscreen') {
        handleClose();
      }
      
      // Alt+E to edit (accessible shortcut)
      if (e.altKey && e.key === 'e' && mode === 'fullscreen') {
        handleEdit();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode]);

  // Handle edit button click
  const handleEdit = () => {
    router.push(`/admin/articles/${article.id}/edit`);
  };
  
  // Handle close button click
  const handleClose = () => {
    router.back();
  };

  // Different device viewport sizes
  const getPreviewClass = () => {
    switch(viewMode) {
      case 'mobile':
        return 'max-w-sm mx-auto border border-gray-300 rounded-lg overflow-hidden shadow-lg';
      case 'tablet':
        return 'max-w-2xl mx-auto border border-gray-300 rounded-lg overflow-hidden shadow-lg';
      default:
        return 'max-w-4xl mx-auto';
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      {/* Preview controls */}
      <div className="max-w-4xl mx-auto mb-4 flex flex-wrap items-center justify-between bg-white p-2 rounded-lg shadow">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <span className="font-medium text-gray-700">Preview Mode:</span>
          <div className="flex border border-gray-300 rounded-md overflow-hidden" role="radiogroup" aria-label="Preview device size">
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 text-sm ${viewMode === 'preview' ? 'bg-[#191970] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              aria-pressed={viewMode === 'preview'}
              aria-label="Default preview"
            >
              Default
            </button>
            <button
              type="button"
              onClick={() => setViewMode('tablet')}
              className={`px-3 py-1 text-sm ${viewMode === 'tablet' ? 'bg-[#191970] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              aria-pressed={viewMode === 'tablet'}
              aria-label="Tablet preview"
            >
              Tablet
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mobile')}
              className={`px-3 py-1 text-sm ${viewMode === 'mobile' ? 'bg-[#191970] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              aria-pressed={viewMode === 'mobile'}
              aria-label="Mobile preview"
            >
              Mobile
            </button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleEdit}
            className="px-3 py-1 bg-[#191970] text-white rounded-md text-sm hover:bg-[#191970]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191970]"
            aria-label="Edit this article"
          >
            Edit
          </button>
          {mode === 'fullscreen' && (
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              aria-label="Close preview"
            >
              Close
            </button>
          )}
        </div>
      </div>
      
      {/* Article preview */}
      <div 
        ref={previewRef}
        className={`${getPreviewClass()} bg-white p-4 sm:p-8`}
        onMouseEnter={() => setShowEditControls(true)}
        onMouseLeave={() => setShowEditControls(false)}
        tabIndex="0"
        aria-label="Article preview"
      >
        {/* Article header */}
        <div className="mb-8">
          <h1 className={`font-bold text-[#191970] ${viewMode === 'mobile' ? 'text-2xl' : 'text-3xl sm:text-4xl'}`}>
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center mt-4 text-sm text-gray-600 space-x-4">
            <span>By {article.author_name}</span>
            <span>•</span>
            <span>{new Date(article.created_at).toLocaleDateString()}</span>
            <span>•</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              article.workflow_status === 'published' ? 'bg-green-100 text-green-800' :
              article.workflow_status === 'approved' ? 'bg-blue-100 text-blue-800' :
              article.workflow_status === 'in_review' ? 'bg-yellow-100 text-yellow-800' :
              article.workflow_status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {article.workflow_status.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        {/* Featured image */}
        {article.image_path && (
          <div className="mb-8">
            <div className="aspect-w-16 aspect-h-9 relative rounded-lg overflow-hidden">
              <img
                src={article.image_path}
                alt={article.title}
                className="object-cover w-full h-full"
                loading="lazy"
              />
            </div>
            {article.image_caption && (
              <p className="mt-2 text-sm text-gray-500 italic">
                {article.image_caption}
              </p>
            )}
          </div>
        )}
        
        {/* Article content */}
        <div 
          className="prose lg:prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        ></div>
        
        {/* Edit overlay */}
        {showEditControls && mode === 'preview' && (
          <div className="fixed bottom-4 right-4 z-10">
            <button
              onClick={handleEdit}
              className="bg-[#191970] text-white rounded-full p-3 shadow-lg hover:bg-[#191970]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191970]"
              aria-label="Edit article"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
