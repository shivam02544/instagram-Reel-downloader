import { ChevronDown, Download, HardDrive } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QualitySelector({ qualities, onDownload, onSaveToDrive, isUploading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState(qualities[0] || null);

  if (!qualities || qualities.length === 0) return null;

  return (
    <div className="relative w-full max-w-sm mx-auto mt-4 z-20">
      <div 
        className="bg-gray-800 border border-gray-700 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-gray-750 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-200 font-medium">
          {selectedQuality?.label || 'Select Quality'}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl z-30"
          >
            {qualities.map((q, idx) => (
              <div
                key={idx}
                className="px-4 py-3 hover:bg-gray-700 cursor-pointer text-gray-200 text-sm transition-colors flex justify-between items-center"
                onClick={() => {
                  setSelectedQuality(q);
                  setIsOpen(false);
                }}
              >
                <span>{q.label}</span>
                {selectedQuality === q && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 mt-4">
        <button
          onClick={() => onDownload(selectedQuality)}
          disabled={!selectedQuality}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
        <button
          onClick={() => onSaveToDrive(selectedQuality)}
          disabled={!selectedQuality || isUploading}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
        >
          <HardDrive className="w-4 h-4" />
          {isUploading ? 'Saving...' : 'Drive'}
        </button>
      </div>
    </div>
  );
}
