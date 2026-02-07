import React from 'react';
import Markdown from 'react-markdown';
import { motion } from 'framer-motion';

export default function SectionCard({ section, index }) {
  // Simple check if it's "Gear" to avoid this component if mistakenly used, 
  // though parent should handle logic.
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 order-2 md:order-1">
          <h3 className="text-xl font-serif font-semibold text-charcoal mb-4">
            {section.title}
          </h3>
          <div className="prose prose-slate prose-p:font-serif prose-p:leading-relaxed text-gray-600 max-w-none">
            <Markdown>{section.content}</Markdown>
          </div>
        </div>
        
        {section.image_url && (
          <div className="w-full md:w-1/3 order-1 md:order-2">
            <div className="aspect-video md:aspect-square rounded-xl overflow-hidden bg-gray-100">
              <img 
                src={section.image_url} 
                alt={section.title} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}