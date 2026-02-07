import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

export default function ImageUpload({ value, onChange, label }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size must be less than 2MB');
        return;
      }

      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        toast.error('Only JPG, PNG, GIF, and WebP images are allowed');
        return;
      }

      // Validate file extension
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
        toast.error('Invalid file extension');
        return;
      }

      // Use a timestamp to prevent duplicate filenames
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `property-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('property-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('property-assets')
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-charcoal ml-1">{label}</label>}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 relative group">
          {value ? (
            <>
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={() => onChange('')}
                  className="p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                >
                  <SafeIcon icon={FiIcons.FiX} className="text-sm" />
                </button>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <SafeIcon icon={FiIcons.FiImage} className="text-xl" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.gif,.webp"
              onChange={handleUpload}
              disabled={uploading}
            />
            <div className={`inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm ${uploading ? 'opacity-50' : ''}`}>
              <SafeIcon 
                icon={uploading ? FiIcons.FiLoader : FiIcons.FiUpload} 
                className={`mr-2 ${uploading ? 'animate-spin' : ''}`} 
              />
              {uploading ? 'Uploading...' : (value ? 'Change Image' : 'Upload Image')}
            </div>
          </label>
          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">
            JPG, PNG, GIF or WebP (Max 2MB)
          </p>
        </div>
      </div>
    </div>
  );
}