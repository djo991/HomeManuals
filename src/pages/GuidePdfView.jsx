import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../lib/utils';
import { Button } from '../components/ui/Button';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import Markdown from 'react-markdown';

export default function GuidePdfView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!user?.id || !id) return;
    try {
      setLoading(true);
      const { data: prop, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (propError) throw propError;

      // Ownership validation
      if (prop.owner_id !== user.id) {
        setError('You do not have permission to view this');
        return;
      }

      const { data: sects, error: sectError } = await supabase
        .from('manual_sections')
        .select('*')
        .eq('property_id', id);

      if (sectError) throw sectError;

      setProperty(prop);
      setSections(sects || []);
    } catch {
      setError('Failed to load property');
    } finally {
      setLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <SafeIcon icon={FiIcons.FiLoader} className="animate-spin text-3xl text-sage" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center">
          <SafeIcon icon={FiIcons.FiAlertCircle} className="text-4xl text-red-500 mb-4 mx-auto" />
          <p className="text-gray-600 mb-4">{error || 'Property not found'}</p>
          <Link to="/dashboard">
            <Button variant="sage">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Group sections by category
  const sectionsByCategory = CATEGORIES.map(cat => ({
    ...cat,
    sections: sections.filter(s => s.category === cat.id)
  })).filter(cat => cat.sections.length > 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Control bar - hidden when printing */}
      <div className="no-print sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link to={`/dashboard/property/${id}`}>
              <Button variant="secondary" size="sm">
                <SafeIcon icon={FiIcons.FiArrowLeft} className="mr-2" />
                Back to Editor
              </Button>
            </Link>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="sage" size="sm">
              <SafeIcon icon={FiIcons.FiDownload} className="mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div className="max-w-4xl mx-auto p-8">
        {/* Cover Page */}
        <div className="text-center py-16 border-b-2 border-gray-200 mb-12">
          {property.cover_image && (
            <div className="w-full h-48 mb-8 rounded-xl overflow-hidden">
              <img
                src={property.cover_image}
                alt={property.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <h1 className="text-4xl font-serif font-bold text-charcoal mb-4">
            {property.name}
          </h1>
          <p className="text-xl text-gray-500 mb-2">Guest Manual</p>
          {property.address && (
            <p className="text-gray-400 flex items-center justify-center gap-2">
              <SafeIcon icon={FiIcons.FiMapPin} />
              {property.address}
            </p>
          )}
        </div>

        {/* Table of Contents */}
        <div className="mb-12 print-avoid-break">
          <h2 className="text-2xl font-serif font-bold text-charcoal mb-6 flex items-center gap-3">
            <SafeIcon icon={FiIcons.FiList} className="text-sage" />
            Table of Contents
          </h2>
          <div className="space-y-2">
            {sectionsByCategory.map((cat, idx) => (
              <div key={cat.id} className="flex items-center gap-3 py-2 border-b border-gray-100">
                <span className="text-sage font-bold">{idx + 1}.</span>
                <SafeIcon icon={FiIcons[cat.icon]} className="text-gray-400" />
                <span className="font-medium text-charcoal">{cat.label}</span>
                <span className="flex-1 border-b border-dotted border-gray-300 mx-2" />
                <span className="text-gray-400 text-sm">{cat.sections.length} items</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        {sectionsByCategory.map((cat, catIdx) => (
          <div key={cat.id} className={catIdx > 0 ? 'print-page-break' : ''}>
            <div className="mb-8 print-avoid-break">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-sage">
                <div className="bg-sage/10 p-3 rounded-xl">
                  <SafeIcon icon={FiIcons[cat.icon]} className="text-2xl text-sage" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-charcoal">
                    {cat.label}
                  </h2>
                  <p className="text-gray-400 text-sm">{cat.sections.length} items</p>
                </div>
              </div>

              <div className="space-y-6">
                {cat.sections.map((section, idx) => (
                  <div
                    key={section.id}
                    className="print-avoid-break bg-gray-50 rounded-xl p-6 border border-gray-100"
                  >
                    <div className="flex gap-4">
                      {section.image_url && (
                        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                          <img
                            src={section.image_url}
                            alt={section.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-charcoal mb-2 flex items-center gap-2">
                          <span className="text-sage">{catIdx + 1}.{idx + 1}</span>
                          {section.title}
                        </h3>
                        <div className="prose prose-sm max-w-none text-gray-600">
                          <Markdown>{section.content}</Markdown>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t-2 border-gray-200 text-center text-gray-400 text-sm print-avoid-break">
          <p className="mb-2">Thank you for staying with us!</p>
          <p>Generated from {property.name} Guest Manual</p>
        </div>
      </div>
    </div>
  );
}
