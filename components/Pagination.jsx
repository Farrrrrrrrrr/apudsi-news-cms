"use client";

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function Pagination({ currentPage, totalPages, totalItems }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Create a new URLSearchParams instance and update it
  const createQueryString = (name, value) => {
    const params = new URLSearchParams(searchParams);
    params.set(name, value);
    return params.toString();
  };
  
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    router.push(`${pathname}?${createQueryString('page', page)}`);
  };
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2; // How many pages to show on each side of the current page
    
    // Always show first page
    pages.push(1);
    
    // Calculate range around current page
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);
    
    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      pages.push('...');
    }
    
    // Add pages from range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (rangeEnd < totalPages - 1) {
      pages.push('...');
    }
    
    // Add last page if there's more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  // If there's only one page or no items, don't show pagination
  if (totalPages <= 1) {
    return null;
  }
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-700">
        <span className="font-medium">{totalItems}</span> items total
      </div>
      
      <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        {/* Previous page button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
            currentPage === 1
              ? 'bg-gray-100 border-gray-300 text-gray-300 cursor-not-allowed'
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
          }`}
        >
          <span className="sr-only">Previous</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Page numbers */}
        {pageNumbers.map((page, index) => (
          page === '...' ? (
            <span
              key={`ellipsis-${index}`}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
            >
              ...
            </span>
          ) : (
            <button
              key={`page-${page}`}
              onClick={() => handlePageChange(page)}
              aria-current={currentPage === page ? 'page' : undefined}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                currentPage === page
                  ? 'z-10 bg-[#191970]/10 border-[#191970]/20 text-[#191970]'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          )
        ))}
        
        {/* Next page button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
            currentPage === totalPages
              ? 'bg-gray-100 border-gray-300 text-gray-300 cursor-not-allowed'
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
          }`}
        >
          <span className="sr-only">Next</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </nav>
    </div>
  );
}
