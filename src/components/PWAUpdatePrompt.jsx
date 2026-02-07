import { useEffect, useState } from 'react';
import { Button } from './ui/Button';
import SafeIcon from '../common/SafeIcon';
import { FiRefreshCw } from 'react-icons/fi';

export default function PWAUpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    // Check if service worker is supported
    if ('serviceWorker' in navigator) {
      // Listen for the controlling service worker changing
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      // Check for updates
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowPrompt(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xl">
        <div className="flex items-start gap-3">
          <div className="bg-sage/10 p-2 rounded-lg flex-shrink-0">
            <SafeIcon icon={FiRefreshCw} className="text-sage text-xl" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-charcoal mb-1">Update Available</h3>
            <p className="text-sm text-gray-500 mb-3">
              A new version of Guest Manual is available.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleUpdate} variant="sage" size="sm">
                Update Now
              </Button>
              <Button onClick={() => setShowPrompt(false)} variant="ghost" size="sm">
                Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
