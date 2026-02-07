import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import SafeIcon from '../common/SafeIcon';
import { FiAlertTriangle, FiUserPlus, FiKey, FiXCircle, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { isSupabaseConfigured } from '../lib/supabase';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const toggleMode = () => {
    resetForm();
    setIsSignUp(!isSignUp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!isSupabaseConfigured) {
      setError('Configuration Missing: Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
      setLoading(false);
      return;
    }

    // Validation for signup
    if (isSignUp) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
    }

    try {
      if (isSignUp) {
        const data = await signUp(email, password);
        // Check if email confirmation is required
        if (data?.user?.identities?.length === 0) {
          setError('An account with this email already exists.');
        } else if (data?.user && !data?.session) {
          setSuccess('Account created! Please check your email to confirm your account.');
          setPassword('');
          setConfirmPassword('');
        }
        // If auto-confirmed, useEffect will handle redirect when user state updates
      } else {
        await signIn(email, password);
        // useEffect will handle redirect when user state updates
      }
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        setError('Connection Error: Could not reach Supabase. Check your Supabase URL and internet connection.');
      } else if (err.status === 400 || err.message?.includes('Invalid login')) {
        setError('Invalid credentials. Please try again.');
      } else if (err.message?.includes('already registered')) {
        setError('An account with this email already exists. Please sign in.');
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
            <SafeIcon icon={FiAlertTriangle} className="text-xl flex-shrink-0" />
            <p>
              <strong>Setup Required:</strong> Add your Supabase credentials to the Project Settings / Environment Variables to enable authentication.
            </p>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="bg-charcoal text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <SafeIcon icon={isSignUp ? FiUserPlus : FiKey} className="text-2xl" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-charcoal">
            {isSignUp ? 'Create Account' : 'Owner Access'}
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            {isSignUp ? 'Sign up to manage your properties' : 'Manage your property guides'}
          </p>
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
          {isSignUp && (
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={loading}
            />
          )}

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-100 flex gap-2 items-start">
              <SafeIcon icon={FiXCircle} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="text-green-700 text-sm bg-green-50 p-4 rounded-xl border border-green-100 flex gap-2 items-start">
              <SafeIcon icon={FiCheckCircle} className="mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <SafeIcon icon={FiLoader} className="animate-spin" />
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </span>
            ) : (isSignUp ? 'Create Account' : 'Enter Dashboard')}
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="secondary"
            className="w-full h-12"
            onClick={signInWithGoogle}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              onClick={toggleMode}
              className="ml-2 text-sage font-medium hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}