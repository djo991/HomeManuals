import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { generateSlug } from '../lib/utils';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newPropName, setNewPropName] = useState('');
  const navigate = useNavigate();

  const fetchProperties = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) setProperties(data || []);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const trimmedName = newPropName.trim();

    if (!trimmedName) {
      toast.error('Please enter a property name');
      return;
    }

    if (trimmedName.length < 2) {
      toast.error('Property name must be at least 2 characters');
      return;
    }

    if (trimmedName.length > 100) {
      toast.error('Property name must be less than 100 characters');
      return;
    }

    try {
      const slug = generateSlug(trimmedName) + '-' + crypto.randomUUID().substring(0, 8);
      const { data, error } = await supabase.from('properties').insert([{
        name: trimmedName,
        owner_id: user.id,
        slug: slug,
        address: '',
        cover_image: ''
      }]).select().single();

      if (error) throw error;
      setProperties([data, ...properties]);
      setIsCreating(false);
      navigate(`/dashboard/property/${data.id}`);
    } catch (err) {
      toast.error('Failed to create property: ' + err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-charcoal">My Properties</h1>
          <p className="text-gray-500">Manage your digital guest manuals</p>
        </div>
        <Button variant="secondary" onClick={signOut} size="sm">Sign Out</Button>
      </header>

      {loading ? (
         <div className="text-center py-20"><SafeIcon icon={FiIcons.FiLoader} className="animate-spin text-2xl mx-auto text-sage" /></div>
      ) : properties.length === 0 && !isCreating ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
          <div className="bg-sage/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <SafeIcon icon={FiIcons.FiHome} className="text-4xl text-sage" />
          </div>
          <h2 className="text-2xl font-bold text-charcoal mb-2">No properties yet</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Create your first property to start building a beautiful digital guide for your guests.</p>
          <Button onClick={() => setIsCreating(true)} size="lg" variant="sage">
            <SafeIcon icon={FiIcons.FiPlus} className="mr-2" /> Create First Property
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create New Card */}
          {isCreating ? (
            <div className="bg-white p-6 rounded-2xl shadow-md border border-sage/30 flex flex-col justify-center">
              <h3 className="font-bold text-lg mb-4">Name your property</h3>
              <form onSubmit={handleCreate}>
                <Input 
                  placeholder="e.g., Seaside Villa" 
                  value={newPropName} 
                  onChange={e => setNewPropName(e.target.value)}
                  autoFocus
                  className="mb-4"
                />
                <div className="flex gap-2">
                  <Button type="submit" variant="sage" className="w-full">Create</Button>
                  <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                </div>
              </form>
            </div>
          ) : (
            <button 
              onClick={() => setIsCreating(true)}
              className="group flex flex-col items-center justify-center min-h-[200px] bg-white border-2 border-dashed border-gray-200 rounded-2xl hover:border-sage hover:bg-sage/5 transition-all"
            >
              <div className="bg-gray-100 group-hover:bg-white p-4 rounded-full mb-3 transition-colors shadow-sm">
                <SafeIcon icon={FiIcons.FiPlus} className="text-2xl text-gray-400 group-hover:text-sage" />
              </div>
              <span className="font-medium text-gray-500 group-hover:text-sage">Add New Property</span>
            </button>
          )}

          {/* Property Cards */}
          {properties.map(prop => (
            <Link 
              key={prop.id} 
              to={`/dashboard/property/${prop.id}`}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 group"
            >
              <div className="h-40 bg-gray-200 relative">
                {prop.cover_image ? (
                  <img src={prop.cover_image} alt={prop.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <SafeIcon icon={FiIcons.FiImage} className="text-3xl" />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full px-3 py-1 text-xs font-bold text-charcoal shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Edit Guide
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-charcoal font-serif mb-1">{prop.name}</h3>
                <p className="text-sm text-gray-500 flex items-center mb-4">
                  <SafeIcon icon={FiIcons.FiMapPin} className="mr-1" />
                  {prop.address || 'No address set'}
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400 font-mono">/{prop.slug}</span>
                  <SafeIcon icon={FiIcons.FiArrowRight} className="text-sage transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}