import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CATEGORIES, cn } from '../lib/utils';
import GuestHeader from '../components/guest/GuestHeader';
import SectionCard from '../components/guest/SectionCard';
import GearGrid from '../components/guest/GearGrid';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { motion } from 'framer-motion';
import { GuestViewSkeleton } from '../components/ui/Skeleton';

export default function GuestView() {
  const { slug } = useParams();
  const [property, setProperty] = useState(null);
  const [sections, setSections] = useState([]);
  const [activeTab, setActiveTab] = useState('Essentials');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch property
        const { data: propData, error: propError } = await supabase
          .from('properties')
          .select('*')
          .eq('slug', slug)
          .single();

        if (propError) throw propError;
        setProperty(propData);

        // Fetch sections
        const { data: sectData, error: sectError } = await supabase
          .from('manual_sections')
          .select('*')
          .eq('property_id', propData.id);

        if (sectError) throw sectError;
        setSections(sectData);

      } catch {
        setError('Could not load property guide.');
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchData();
  }, [slug]);

  if (loading) return <GuestViewSkeleton />;

  if (error || !property) return (
    <div className="min-h-screen flex items-center justify-center bg-offwhite p-4">
      <div className="text-center max-w-md">
        <SafeIcon icon={FiIcons.FiAlertCircle} className="text-4xl text-terracotta mb-4 mx-auto" />
        <h2 className="text-xl font-bold mb-2">Guide Not Found</h2>
        <p className="text-gray-500">We couldn't find a guide for this property. Please check the URL.</p>
      </div>
    </div>
  );

  const filteredSections = sections.filter(s => s.category === activeTab);

  return (
    <div className="pb-20">
      <GuestHeader property={property} />

      {/* Sticky Navigation */}
      <div className="sticky top-0 z-30 bg-offwhite/95 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 py-3 overflow-x-auto no-scrollbar">
        <div className="flex justify-start md:justify-center gap-2 min-w-max mx-auto max-w-4xl">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap",
                activeTab === cat.id 
                  ? "bg-charcoal text-white shadow-md transform scale-105" 
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              )}
            >
              <SafeIcon icon={FiIcons[cat.icon]} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.3 }}
        >
          {filteredSections.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
              <SafeIcon icon={FiIcons.FiBookOpen} className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 font-serif">No instructions added to this section yet.</p>
            </div>
          ) : (
            <>
              {activeTab === 'Gear' ? (
                <GearGrid sections={filteredSections} />
              ) : (
                <div className="space-y-6">
                  {filteredSections.map((section, idx) => (
                    <SectionCard key={section.id} section={section} index={idx} />
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
      
      <footer className="text-center py-8 text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} {property.name} Guest Guide</p>
      </footer>
    </div>
  );
}