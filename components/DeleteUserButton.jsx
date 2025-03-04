"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteUserButton({ id, email }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const openModal = () => {
    setIsOpen(true);
    setError('');
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError('');
      
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      router.refresh();
      closeModal();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.message || 'Failed to delete user');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="text-red-600 hover:text-red-900"
      >
        Delete
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          {/* Modal */}
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete User
            </h3>
            <p className="text-gray-700 mb-2">
              Are you sure you want to delete the user <span className="font-semibold">{email}</span>?
            </p>
            <p className="text-gray-700 mb-6">
              This action cannot be undone.
            </p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#191970]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
