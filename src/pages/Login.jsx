import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { isSupabaseConfigured } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isSupabaseConfigured) {
      setError('Configuration Missing: Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
      setLoading(false);
      return;
    }

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        setError('Connection Error: Could not reach Supabase. Check your Supabase URL and internet connection.');
      } else if (err.status === 400) {
        setError('Invalid credentials. Please try again.');
      } else {
        setError(err.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-offwhite p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-800 text-sm">
            <SafeIcon icon={FiIcons.FiAlertTriangle} className="text-xl flex-shrink-0" />
            <p>
              <strong>Setup Required:</strong> Add your Supabase credentials to the Project Settings / Environment Variables to enable authentication.
            </p>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="bg-charcoal text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <SafeIcon icon={FiIcons.FiKey} className="text-2xl" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-charcoal">Owner Access</h1>
          <p className="text-gray-500 mt-2 text-sm">Manage your property guides</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="owner@example.com"
            disabled={loading}
          />
          <Input 
            label="Password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="••••••••"
            disabled={loading}
          />
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-100 flex gap-2 items-start">
              <SafeIcon icon={FiIcons.FiXCircle} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-12" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <SafeIcon icon={FiIcons.FiLoader} className="animate-spin" />
                Signing In...
              </span>
            ) : 'Enter Dashboard'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Secure access for property managers and owners only.
          </p>
        </div>
      </div>
    </div>
  );
}