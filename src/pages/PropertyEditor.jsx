import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input, TextArea } from '../components/ui/Input';
import ImageUpload from '../components/ui/ImageUpload';
import { CATEGORIES } from '../lib/utils';
import SafeIcon from '../common/SafeIcon';
import { FiLoader, FiAlertCircle, FiArrowLeft, FiEye, FiFileText, FiPrinter, FiExternalLink, FiSettings, FiImage, FiEdit2, FiTrash2, FiInbox, FiX, FiMapPin, FiBookOpen } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';

export default function PropertyEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('Essentials');
  const [editingSection, setEditingSection] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTab, setPreviewTab] = useState('Essentials');

  // Property Fields State
  const [propName, setPropName] = useState('');
  const [propAddress, setPropAddress] = useState('');
  const [propImage, setPropImage] = useState('');

  // Section Fields State
  const [secTitle, setSecTitle] = useState('');
  const [secContent, setSecContent] = useState('');
  const [secImage, setSecImage] = useState('');

  const fetchData = useCallback(async () => {
    if (!user?.id || !id) return;
    try {
      const { data: prop, error: propError } = await supabase.from('properties').select('*').eq('id', id).single();
      if (propError) throw propError;

      // Ownership validation - ensure logged-in user owns this property
      if (prop.owner_id !== user.id) {
        setUnauthorized(true);
        toast.error('You do not have permission to edit this property');
        return;
      }

      const { data: sects, error: sectError } = await supabase.from('manual_sections').select('*').eq('property_id', id);
      if (sectError) throw sectError;

      setProperty(prop);
      setPropName(prop.name);
      setPropAddress(prop.address || '');
      setPropImage(prop.cover_image || '');
      setSections(sects || []);
    } catch (err) {
      toast.error('Error loading data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateProperty = async () => {
    try {
      setIsSaving(true);
      const { error } = await supabase.from('properties')
        .update({ name: propName, address: propAddress, cover_image: propImage })
        .eq('id', id)
        .eq('owner_id', user.id);
      
      if (error) throw error;
      toast.success('Property details updated');
      fetchData();
    } catch (err) {
      toast.error('Failed to update property: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSection = async () => {
    if (!secTitle) {
      toast.error('Please enter a title');
      return;
    }
    
    try {
      setIsSaving(true);
      const payload = {
        property_id: id,
        category: activeTab,
        title: secTitle,
        content: secContent,
        image_url: secImage
      };

      let error;
      if (editingSection) {
        const { error: updateError } = await supabase.from('manual_sections')
          .update(payload)
          .eq('id', editingSection.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('manual_sections')
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;
      
      toast.success(editingSection ? 'Item updated' : 'New item added');
      resetSectionForm();
      fetchData();
    } catch (err) {
      toast.error('Failed to save item: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSection = async (e, secId) => {
    // Prevent any parent click events
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setDeletingId(secId);
    const originalSections = [...sections];

    try {
      // Optimistic update
      setSections(prev => prev.filter(s => s.id !== secId));

      const { error } = await supabase
        .from('manual_sections')
        .delete()
        .eq('id', secId);

      if (error) {
        setSections(originalSections);
        throw error;
      }
      
      toast.success('Item removed');
      setConfirmDeleteId(null);
    } catch (err) {
      toast.error('Delete failed: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const resetSectionForm = () => {
    setSecTitle('');
    setSecContent('');
    setSecImage('');
    setEditingSection(null);
  };

  const startEdit = (section) => {
    setEditingSection(section);
    setSecTitle(section.title);
    setSecContent(section.content);
    setSecImage(section.image_url || '');
    const formElement = document.getElementById('item-form');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-offwhite">
      <div className="text-center">
        <SafeIcon icon={FiLoader} className="animate-spin text-3xl text-sage mb-2 mx-auto" />
        <p className="text-gray-500 font-serif">Loading property data...</p>
      </div>
    </div>
  );

  if (unauthorized) return (
    <div className="min-h-screen flex items-center justify-center bg-offwhite">
      <div className="text-center max-w-md">
        <SafeIcon icon={FiAlertCircle} className="text-4xl text-red-500 mb-4 mx-auto" />
        <h2 className="text-xl font-bold mb-2 text-charcoal">Access Denied</h2>
        <p className="text-gray-500 mb-6">You don't have permission to edit this property.</p>
        <Link to="/dashboard">
          <Button variant="sage">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );

  const filteredSections = sections.filter(s => s.category === activeTab);

  return (
    <div className="min-h-screen bg-offwhite pb-20">
      {/* Navbar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
              <SafeIcon icon={FiArrowLeft} />
            </Link>
            <h1 className="font-serif font-bold text-lg md:text-xl text-charcoal truncate max-w-[150px] md:max-w-md">
              {property.name}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowPreview(true)}>
              <SafeIcon icon={FiEye} className="md:mr-2" />
              <span className="hidden md:inline">Preview</span>
            </Button>
            <Link to={`/dashboard/property/${id}/pdf`}>
              <Button variant="secondary" size="sm" className="hidden md:flex">
                <SafeIcon icon={FiFileText} className="mr-2" /> PDF
              </Button>
            </Link>
            <Link to={`/dashboard/property/${id}/print`}>
              <Button variant="secondary" size="sm" className="hidden md:flex">
                <SafeIcon icon={FiPrinter} className="mr-2" /> QR Code
              </Button>
            </Link>
            <Link to={`/g/${property.slug}`} target="_blank">
              <Button variant="sage" size="sm">
                <SafeIcon icon={FiExternalLink} className="md:mr-2" />
                <span className="hidden md:inline">View Live</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-charcoal mb-4 flex items-center gap-2">
              <SafeIcon icon={FiSettings} className="text-sage" />
              Property Details
            </h2>
            <div className="space-y-4">
              <Input label="Name" value={propName} onChange={e => setPropName(e.target.value)} />
              <Input label="Address" value={propAddress} onChange={e => setPropAddress(e.target.value)} />
              <ImageUpload label="Cover Image" value={propImage} onChange={setPropImage} />
              <Button onClick={handleUpdateProperty} disabled={isSaving} className="w-full" size="sm">
                {isSaving ? 'Saving...' : 'Update Details'}
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-100 font-medium text-gray-500 text-xs tracking-widest uppercase">
              Guide Sections
            </div>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => { setActiveTab(cat.id); resetSectionForm(); }}
                className={`w-full text-left px-6 py-4 flex items-center justify-between transition-all ${activeTab === cat.id ? 'bg-sage/10 text-sage font-bold border-l-4 border-sage' : 'hover:bg-gray-50 text-gray-600'}`}
              >
                <div className="flex items-center gap-3">
                  <SafeIcon icon={cat.icon} />
                  {cat.label}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === cat.id ? 'bg-sage text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {sections.filter(s => s.category === cat.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-serif font-bold text-charcoal">
              {CATEGORIES.find(c => c.id === activeTab).label}
            </h2>
            <Button size="sm" onClick={resetSectionForm} variant={editingSection ? "secondary" : "primary"}>
              {editingSection ? 'Cancel Edit' : 'Add New Item'}
            </Button>
          </div>

          <div className="space-y-4">
            {filteredSections.map(section => (
              <div 
                key={section.id} 
                className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-start transition-all ${deletingId === section.id ? 'opacity-50 scale-95' : 'hover:border-sage/30'}`}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-50">
                  {section.image_url ? (
                    <img src={section.image_url} alt={section.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <SafeIcon icon={FiImage} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-charcoal truncate">{section.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1 font-serif">{section.content}</p>
                </div>
                <div className="flex gap-1">
                  {confirmDeleteId === section.id ? (
                    <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                       <button 
                        type="button"
                        onClick={(e) => handleDeleteSection(e, section.id)}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700"
                      >
                        Confirm
                      </button>
                      <button 
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button 
                        type="button"
                        onClick={() => startEdit(section)} 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                        title="Edit item"
                      >
                        <SafeIcon icon={FiEdit2} />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(section.id); }} 
                        disabled={deletingId === section.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Delete item"
                      >
                        {deletingId === section.id ? (
                          <SafeIcon icon={FiLoader} className="animate-spin" />
                        ) : (
                          <SafeIcon icon={FiTrash2} />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {filteredSections.length === 0 && (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-400">
                <SafeIcon icon={FiInbox} className="text-4xl mx-auto mb-2 opacity-20" />
                <p>No instructions added to this section yet.</p>
              </div>
            )}
          </div>

          {/* Form for adding/editing */}
          <div id="item-form" className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-sage/10 mt-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-sage/20" />
            <h3 className="font-serif font-bold text-xl mb-6 text-charcoal">
              {editingSection ? 'Update Item' : `Add to ${CATEGORIES.find(c => c.id === activeTab).label}`}
            </h3>
            <div className="space-y-5">
              <Input 
                label="Title" 
                placeholder={activeTab === 'Gear' ? "e.g., Nespresso Machine" : "e.g., How to Check-in"} 
                value={secTitle} 
                onChange={e => setSecTitle(e.target.value)} 
              />
              <TextArea 
                label="Instructions" 
                placeholder="Step by step guide for your guests... (Markdown supported)" 
                value={secContent} 
                onChange={e => setSecContent(e.target.value)} 
                rows={5} 
              />
              <ImageUpload label="Item Image" value={secImage} onChange={setSecImage} />
              
              <div className="pt-4 flex flex-col md:flex-row gap-3">
                <Button onClick={handleSaveSection} disabled={isSaving || !secTitle} variant="sage" className="flex-1 h-12">
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <SafeIcon icon={FiLoader} className="animate-spin" /> 
                      Saving...
                    </span>
                  ) : (editingSection ? 'Update Item' : 'Add Item')}
                </Button>
                {editingSection && (
                  <Button onClick={resetSectionForm} type="button" variant="secondary" className="px-6 h-12">
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-offwhite w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Preview Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center flex-shrink-0">
              <div>
                <h3 className="font-serif font-bold text-lg text-charcoal">Guest Preview</h3>
                <p className="text-xs text-gray-500">How guests will see your guide</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <SafeIcon icon={FiX} className="text-xl" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Cover Image */}
              <div className="h-48 bg-gray-200 relative">
                {propImage ? (
                  <img src={propImage} alt={propName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <SafeIcon icon={FiImage} className="text-4xl" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h2 className="text-2xl font-serif font-bold">{propName || 'Property Name'}</h2>
                  {propAddress && (
                    <p className="text-sm opacity-90 flex items-center gap-1 mt-1">
                      <SafeIcon icon={FiMapPin} /> {propAddress}
                    </p>
                  )}
                </div>
              </div>

              {/* Category Tabs */}
              <div className="bg-white border-b border-gray-200 px-4 py-3 overflow-x-auto">
                <div className="flex gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setPreviewTab(cat.id)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap",
                        previewTab === cat.id
                          ? "bg-charcoal text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      <SafeIcon icon={cat.icon} />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sections */}
              <div className="p-4 space-y-4">
                {sections.filter(s => s.category === previewTab).length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <SafeIcon icon={FiBookOpen} className="text-3xl mx-auto mb-2" />
                    <p>No content in this section yet</p>
                  </div>
                ) : (
                  sections.filter(s => s.category === previewTab).map(section => (
                    <div key={section.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex gap-4">
                        {section.image_url && (
                          <img
                            src={section.image_url}
                            alt={section.title}
                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-charcoal mb-2">{section.title}</h4>
                          <div className="text-sm text-gray-600 prose prose-sm max-w-none">
                            <Markdown>{section.content}</Markdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Preview Footer */}
            <div className="bg-white border-t border-gray-200 p-4 flex justify-between items-center flex-shrink-0">
              <p className="text-xs text-gray-400">This is a preview of how guests will see your guide.</p>
              <Link to={`/g/${property.slug}`} target="_blank">
                <Button variant="sage" size="sm">
                  <SafeIcon icon={FiExternalLink} className="mr-2" />
                  Open Full View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}