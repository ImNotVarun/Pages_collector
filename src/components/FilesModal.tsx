import React from 'react';
import { X, FileText, Image as ImageIcon, Download } from 'lucide-react';
import { NotionFile } from '../types';

interface FilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: NotionFile[];
}

export function FilesModal({ isOpen, onClose, files }: FilesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Attached Files</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="border rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                {file.type === 'pdf' ? (
                  <FileText size={24} className="text-red-500" />
                ) : (
                  <ImageIcon size={24} className="text-blue-500" />
                )}
                <span className="text-sm font-medium truncate max-w-[150px]">
                  {file.name}
                </span>
              </div>
              <a
                href={file.url}
                download
                className="text-blue-500 hover:text-blue-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download size={20} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}