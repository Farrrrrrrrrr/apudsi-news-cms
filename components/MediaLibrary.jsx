"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function MediaLibrary({ onSelect, onClose }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const fileInputRef = useRef(null);
  
  // Fetch images when component mounts
  useEffect(() => {
    fetchImages();
  }, [page]);
  
  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/media?page=${page}&search=${searchQuery}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      
      const data = await response.json();
      setImages(prev => page === 1 ? data.images : [...prev, ...data.images]);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  const handleSearch = () => {
    setPage(1);
    fetchImages();
  };
  
  const uploadImage = async (file) => {
    try {
      setUploadingImage(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });