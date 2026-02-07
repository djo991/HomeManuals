import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

export default function Layout() {
  return (
    <div className="min-h-screen bg-offwhite text-charcoal font-sans selection:bg-sage selection:text-white">
      <Outlet />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1F2937',
            color: '#fff',
            fontFamily: 'Inter, sans-serif'
          },
          success: {
            iconTheme: {
              primary: '#B2AC88',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}