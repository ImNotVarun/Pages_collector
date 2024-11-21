import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { NotionLink } from '../types';

interface EditLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: NotionLink;
  onUpdate: () => void;
}

const gradients = [
  'from-[#FF6B6B] to-[#4ECDC4]',
  'from-[#A8E6CF] to-[#FFD3B6]',
  'from-[#FFAAA5] to-[#FFD3B6]',
  'from-[#3498db] to-[#2ecc71]',
  'from-[#e74c3c] to-[#f1c40f]',
  'from-[#9b59b6] to-[#3498db]',
  'from-[#1abc9c] to-[#3498db]',
];

export function EditLinkModal({ isOpen, onClose, link, onUpdate }: EditLinkModalProps) {
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const [selectedGradient, setSelectedGradient] = useState(link.gradient);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('notion_links')
        .update({ title, url, gradient: selectedGradient })
        .eq('id', link.id);

      if (error) throw error;

      toast.success('Link updated successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update link');
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
        
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Link</h2>
        
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
              Card Gradient
            </label>
            <div className="flex flex-wrap gap-2">
              {gradients.map((gradient) => (
                <button
                  key={gradient}
                  type="button"
                  onClick={() => setSelectedGradient(gradient)}
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} ${
                    selectedGradient === gradient ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                  }`}
                />
              ))}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
          >
            {loading ? 'Updating...' : 'Update Link'}
          </button>
        </form>
      </div>
    </div>
  );
}

