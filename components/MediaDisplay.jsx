'use client'; // Client component

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import QualitySelector from './QualitySelector';
import axios from 'axios';

export default function MediaDisplay({ medias, shortcode }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const currentMedia = medias[currentIndex];

  // Reset state when medias change
  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
    if(videoRef.current) videoRef.current.load();
  }, [medias]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    }
  };

  const getProxyUrl = (url) => `/api/proxy?url=${encodeURIComponent(url)}`;

  const handleDownload = async (quality) => {
    if (!quality) return;
    try {
        // Use proxy to avoid CORS issues and enable blob download
        const response = await fetch(getProxyUrl(quality.url));
        if (!response.ok) throw new Error('Download failed via proxy');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const qualityLabel = quality.label.split(' ')[0] || 'video';
        a.download = `insta_${shortcode}_item${currentIndex}_${qualityLabel}.mp4`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (e) {
        console.error("Download failed, falling back to direct link", e);
        window.open(quality.url, '_blank');
    }
  };

  const handleSaveToDrive = async (quality) => {
    if (!quality) return;
    setIsUploading(true);
    try {
      const fileName = `insta_${shortcode}_item${currentIndex}_${quality.label.replace(/\s/g,'-')}.mp4`;
      const mimeType = 'video/mp4'; 

      // 1. Get Upload URL
      const { data } = await axios.post('/api/drive/createUploadUrl', { fileName, mimeType });
      const { uploadUrl } = data;

      // 2. Fetch the file blob via Proxy
      const fileRes = await fetch(getProxyUrl(quality.url));
      if (!fileRes.ok) throw new Error('Failed to fetch file via proxy');
      
      const blob = await fileRes.blob();
      const file = new File([blob], fileName, { type: mimeType });

      // 3. Upload to Drive (Through Server Proxy)
      // Since Google Drive Direct PUT from browser is blocked by CORS (opaque response can't be read easily or fails),
      // we will use a proxy route to pipe the data.
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadUrl', uploadUrl);
      formData.append('mimeType', mimeType);

      const proxyUploadRes = await axios.post('/api/drive/upload', formData, {
         headers: {
             'Content-Type': 'multipart/form-data'
         },
         onUploadProgress: (progressEvent) => {
            // Optional progress
         }
      });
      
      if(!proxyUploadRes.data.success) throw new Error(proxyUploadRes.data.error || 'Proxy Upload failed');

      alert(`Successfully saved to Google Drive!`);
    } catch (error) {
      console.error('Drive Upload Error:', error);
      alert('Failed to save to Google Drive. Check credentials or console.');
    } finally {
      setIsUploading(false);
    }
  };

  const nextSlide = () => {
    if (currentIndex < medias.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsPlaying(false);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        setIsPlaying(false);
    }
  };

  if(!currentMedia) return null;

  return (
    <div className="w-full max-w-md mx-auto mt-8 bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
      <div className="relative aspect-9/16 bg-black group">
        
        {/* Carousel Navigation */}
        {medias.length > 1 && (
            <>
                {currentIndex > 0 && (
                     <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm transition-all">
                        <ChevronLeft className="w-6 h-6" />
                     </button>
                )}
                {currentIndex < medias.length - 1 && (
                     <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm transition-all">
                        <ChevronRight className="w-6 h-6" />
                     </button>
                )}
                 <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md z-10 backdrop-blur-md">
                    {currentIndex + 1} / {medias.length}
                </div>
            </>
        )}

        {/* Video Player */}
        <video 
            ref={videoRef}
            src={currentMedia.qualities[0]?.url || ''} // Use first quality as preview
            poster={currentMedia.previewImage}
            className="w-full h-full object-cover"
            playsInline
            loop
            onClick={togglePlay}
            onEnded={() => setIsPlaying(false)}
        />
        
        {/* Controls Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {!isPlaying && (
                <div className="bg-black/40 p-4 rounded-full backdrop-blur-sm">
                    <Play className="w-8 h-8 text-white fill-white" />
                </div>
            )}
        </div>

        {/* Mute Toggle */}
        <button 
            onClick={toggleMute}
            className="absolute bottom-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 backdrop-blur-md transition-all z-10"
        >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

      </div>

      <div className="p-6 bg-gray-900">
        <QualitySelector 
            qualities={currentMedia.qualities} 
            onDownload={handleDownload}
            onSaveToDrive={handleSaveToDrive}
            isUploading={isUploading}
        />
      </div>
    </div>
  );
}
