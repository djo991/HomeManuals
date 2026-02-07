import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import QRCode from 'react-qr-code';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { Button } from '../components/ui/Button';

export default function PrintView() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        setProperty(data);
      } catch {
        setError('Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <SafeIcon icon={FiIcons.FiLoader} className="animate-spin text-3xl text-sage" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
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

  const url = `${window.location.origin}/g/${property.slug}`;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="no-print absolute top-4 left-4 z-10 flex gap-2">
        <Link to={`/dashboard/property/${id}`}><Button variant="secondary" size="sm">Back</Button></Link>
        <Button onClick={() => window.print()} variant="sage" size="sm">Print</Button>
      </div>

      <div className="bg-white p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border-8 border-sage/10 aspect-[1/1.4] flex flex-col items-center justify-between">
        <div className="space-y-2 mt-8">
           <h3 className="text-sm font-sans tracking-widest uppercase text-gray-400">Welcome To</h3>
           <h1 className="text-4xl font-serif font-bold text-charcoal">{property.name}</h1>
        </div>

        <div className="p-4 bg-white rounded-xl shadow-none">
          <QRCode value={url} size={256} />
        </div>

        <div className="space-y-4 mb-8">
          <p className="text-xl font-serif text-gray-600">Scan for the digital house manual & Wi-Fi details.</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400 font-mono bg-gray-50 py-2 px-4 rounded-full inline-block">
             <SafeIcon icon={FiIcons.FiWifi} />
             <span>Scan to Access</span>
          </div>
        </div>
      </div>
    </div>
  );
}