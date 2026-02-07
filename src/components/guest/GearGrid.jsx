import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import { FiCpu, FiChevronRight, FiX } from 'react-icons/fi';
import Markdown from 'react-markdown';

export default function GearGrid({ sections }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  const closeModal = useCallback(() => setSelectedItem(null), []);

  useEffect(() => {
    if (!selectedItem) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
    };

    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, closeModal]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section, idx) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setSelectedItem(section)}
            className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="aspect-[4/3] relative bg-gray-100 overflow-hidden">
              {section.image_url ? (
                <img
                  src={section.image_url}
                  alt={section.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <SafeIcon icon={FiCpu} className="text-4xl" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
            <div className="p-4 flex justify-between items-center">
              <h3 className="font-medium text-charcoal">{section.title}</h3>
              <SafeIcon icon={FiChevronRight} className="text-gray-400" />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={selectedItem.title}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
            >
              <button
                ref={closeButtonRef}
                onClick={closeModal}
                aria-label="Close"
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full shadow-sm hover:bg-white"
              >
                <SafeIcon icon={FiX} className="text-xl" />
              </button>

              {selectedItem.image_url && (
                <div className="h-64 w-full bg-gray-100">
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-8">
                <h2 className="text-2xl font-serif font-bold text-charcoal mb-4">{selectedItem.title}</h2>
                <div className="prose prose-slate prose-p:font-serif">
                  <Markdown>{selectedItem.content}</Markdown>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
