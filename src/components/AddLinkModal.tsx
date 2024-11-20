import React, { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkAdded: () => void;
}

export function AddLinkModal({ isOpen, onClose, onLinkAdded }: AddLinkModalProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const getRandomGradient = () => {
    const gradients = [
      'from-[#FF6B6B] to-[#4ECDC4]',
      'from-[#A8E6CF] to-[#FFD3B6]',
      'from-[#FFAAA5] to-[#FFD3B6]',
      'from-[#3498db] to-[#2ecc71]',
      'from-[#e74c3c] to-[#f1c40f]',
      'from-[#9b59b6] to-[#3498db]',
      'from-[#1abc9c] to-[#3498db]',
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, insert the link
      const { data: linkData, error: linkError } = await supabase
        .from('notion_links')
        .insert([{ title, url, gradient: getRandomGradient() }])
        .select()
        .single();

      if (linkError) throw linkError;

      // Then upload files if any
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExt}`;
          const filePath = `${linkData.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('notion-files')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('notion-files')
            .getPublicUrl(filePath);

          const { error: fileError } = await supabase
            .from('notion_files')
            .insert({
              link_id: linkData.id,
              name: file.name,
              url: publicUrl,
              type: file.type.includes('pdf') ? 'pdf' : 'image'
            });

          if (fileError) throw fileError;
        }
      }

      toast.success('Link and files added successfully!');
      onLinkAdded();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to add link and files');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Link</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter title..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notion URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="https://notion.so/..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attach Files (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={(e) => setFiles(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">
                  Click to upload PDFs or Images
                </span>
              </label>
            </div>
            {files && files.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Selected files:
                </h4>
                <ul className="space-y-1">
                  {Array.from(files).map((file, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin mr-2" />
                Adding...
              </>
            ) : (
              'Add Link'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}