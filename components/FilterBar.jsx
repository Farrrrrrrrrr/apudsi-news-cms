"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function FilterBar({ statusOptions, categories, currentStatus, currentCategory, searchQuery }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState(currentStatus || '');
  const [category, setCategory] = useState(currentCategory || '');
  const [search, setSearch] = useState(searchQuery || '');
  
  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (status) params.set('status', status);
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    
    // Reset to page 1 when filters change
    params.set('page', '1');
    
    router.push(`${pathname}?${params.toString()}`);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setStatus('');
    setCategory('');
    setSearch('');
    router.push(pathname);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    applyFilters();
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="status" className="block text-xs font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#191970] focus:border-[#191970] sm:text-sm"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-xs font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#191970] focus:border-[#191970] sm:text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="search" className="block text-xs font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or content"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#191970] focus:border-[#191970] sm:text-sm"
            />
          </div>
          
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="bg-[#191970] py-1.5 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-[#191970]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191970]"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="bg-white py-1.5 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191970]"
            >
              Clear
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
