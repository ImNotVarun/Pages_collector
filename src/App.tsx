import React, { useState, useEffect } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { AddLinkModal } from './components/AddLinkModal';
import { LinkCard } from './components/LinkCard';
import { NotionLink } from './types';

function App() {
  const [links, setLinks] = useState<NotionLink[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('notion_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const filteredLinks = links.filter(link =>
    link.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
            Notion Links
          </h1>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search your links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 size={40} className="animate-spin text-blue-500 mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLinks.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onUpdate={fetchLinks}
              />
            ))}
            {filteredLinks.length === 0 && !loading && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No links found. Add your first link!</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
        >
          <Plus size={24} />
        </button>

        <AddLinkModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onLinkAdded={fetchLinks}
        />
      </div>
    </div>
  );
}

export default App;