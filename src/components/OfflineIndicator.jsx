import { useState, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50">
      <div className="bg-amber-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
        <SafeIcon icon={FiIcons.FiWifiOff} className="text-xl flex-shrink-0" />
        <div>
          <p className="font-medium">You're offline</p>
          <p className="text-sm opacity-90">Some features may be limited</p>
        </div>
      </div>
    </div>
  );
}
