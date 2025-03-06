"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ArticlePublish({ article, userId }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const router = useRouter();

  const handlePublishNow = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/articles/${article.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          immediate: true
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to publish article');
      }
      
      // Success - redirect to the articles page
      router.push('/admin/articles');
      router.refresh();
    } catch (err) {