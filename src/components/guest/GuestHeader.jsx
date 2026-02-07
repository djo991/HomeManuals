import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

export default function GuestHeader({ property }) {
  return (
    <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {property?.cover_image ? (
          <img 
            src={property.cover_image} 
            alt={property.name} 
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-slate-200 flex items-center justify-center">
            <SafeIcon icon={FiIcons.FiImage} className="text-4xl text-slate-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Glassmorphism Header Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-start justify-end">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="backdrop-blur-md bg-white/10 border border-white/20 p-6 rounded-2xl shadow-xl max-w-lg w-full"
        >
          <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-2 font-serif">
            {property?.name || 'Welcome'}
          </h1>
          <div className="flex items-center text-white/90 text-sm md:text-base">
            <SafeIcon icon={FiIcons.FiMapPin} className="mr-2" />
            <span>{property?.address || 'Private Address'}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}