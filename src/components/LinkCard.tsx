import React, { useState, useEffect } from 'react';
import { ExternalLink, FileText, Plus, Paperclip } from 'lucide-react';
import { NotionLink, NotionFile } from '../types';
import { FileUploadModal } from './FileUploadModal';
import { FilesModal } from './FilesModal';
import { supabase } from '../lib/supabase';

interface LinkCardProps {
  link: NotionLink;
  onUpdate: () => void;
}

export function LinkCard({ link, onUpdate }: LinkCardProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFilesModalOpen, setIsFilesModalOpen] = useState(false);
  const [files, setFiles] = useState<NotionFile[]>([]);
  const [fileCount, setFileCount] = useState(0);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('notion_files')
        .select('*')
        .eq('link_id', link.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
      setFileCount(data?.length || 0);
      if (data && data.length > 0) {
        setIsFilesModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  useEffect(() => {
    const getFileCount = async () => {
      const { count } = await supabase
        .from('notion_files')
        .select('*', { count: 'exact', head: true })
        .eq('link_id', link.id);
      setFileCount(count || 0);
    };
    getFileCount();
  }, [link.id]);

  return (
    <>
      <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        <div className={`h-32 bg-gradient-to-br ${link.gradient} group-hover:opacity-90 transition-opacity`} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {link.title}
            </h3>
            <div className="flex items-center space-x-3">
              {fileCount > 0 && (
                <button
                  onClick={fetchFiles}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex items-center"
                  title="View attachments"
                >
                  <Paperclip size={18} />
                  <span className="ml-1 text-sm">{fileCount}</span>
                </button>
              )}
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Add attachment"
              >
                <Plus size={18} />
              </button>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Open link"
              >
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
          <p className="text-sm text-gray-500 truncate">{link.url}</p>
        </div>
      </div>

      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        linkId={link.id}
        onFileUploaded={() => {
          onUpdate();
          fetchFiles();
        }}
      />

      <FilesModal
        isOpen={isFilesModalOpen}
        onClose={() => setIsFilesModalOpen(false)}
        files={files}
      />
    </>
  );
}