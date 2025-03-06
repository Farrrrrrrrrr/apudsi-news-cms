"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ApiKeysList({ apiKeys = [] }) {
  const [isCreating, setIsCreating] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [newApiKey, setNewApiKey] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateApiKey = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newApiKeyName,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create API key');
      }
      
      const data = await response.json();
      setNewApiKey(data.apiKey);
      setNewApiKeyName('');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeApiKey = async (id) => {
    if (!confirm('Are you sure you want to revoke