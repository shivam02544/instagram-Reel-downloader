'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Instagram, AlertCircle, Loader2, Link as LinkIcon } from 'lucide-react';
import axios from 'axios';
import MediaDisplay from '@/components/MediaDisplay';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const handleFetch = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      // Basic client-side validation
      if (!url || url.length < 5) {
        throw new Error('Please enter a valid URL');
      }

      const response = await axios.post('/api/reel', { url });
      
      if (response.data.success) {
        setData(response.data);
      } else {
        throw new Error(response.data.error || 'Failed to fetch reel');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-brand-900/20 to-transparent -z-10 pointer-events-none" />
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-3xl -z-10 animate-pulse" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 max-w-3xl"
      >
        <div className="inline-flex items-center justify-center p-3 bg-brand-500/10 rounded-2xl mb-6 ring-1 ring-brand-500/20 shadow-lg shadow-brand-500/10 animate-float">
          <Instagram className="w-10 h-10 text-brand-400" />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-200 via-brand-400 to-brand-200 animate-gradient-x tracking-tight pb-2">
          InstaDownloader
        </h1>
        <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Download Instagram Reels & Videos in HD. <br/>
          <span className="text-brand-400/80">Save directly to Google Drive without limits.</span>
        </p>
      </motion.div>

      {/* Input Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-2xl relative z-10"
      >
        <form onSubmit={handleFetch} className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <LinkIcon className="h-6 w-6 text-gray-500" />
          </div>
          <input
            suppressHydrationWarning
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste Instagram Reel or Post Link..."
            className="w-full pl-14 pr-36 py-5 text-lg glass-input rounded-2xl text-white placeholder-gray-500 outline-none focus:ring-0 shadow-2xl"
          />
          <div className="absolute inset-y-2 right-2 flex items-center">
            <button
              type="submit"
              disabled={loading || !url}
              className="h-full px-8 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-brand-600/30 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Get Video</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Result Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-4xl mt-12 mb-20"
      >
        {data && (
           <MediaDisplay medias={data.medias} shortcode={data.shortcode} />
        )}
      </motion.div>

      {/* Features Grid */}
      {!data && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4"
        >
          {[
            { title: 'HD Quality', desc: 'Download in best available quality (1080p)', icon: '✨' },
            { title: 'Google Drive', desc: 'Save large files directly to your cloud', icon: '☁️' },
            { title: 'No Watermark', desc: 'Clean videos without overlays', icon: '🎥' }
          ].map((feature, i) => (
            <div key={i} className="glass p-6 rounded-2xl border-gray-800 bg-gray-900/40 hover:bg-gray-800/60 transition-colors group cursor-default">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-200 mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      )}

    </main>
  );
}
