import React, { useRef, useEffect } from "react";
import { X, FileText, Download, ImageIcon, ExternalLink } from 'lucide-react';
import { NotionLink, NotionFile } from "../types";

interface LinkCardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: NotionLink;
  files: NotionFile[];
  screenshotUrl: string;
}

export function LinkCardDetailsModal({
  isOpen,
  onClose,
  link,
  files,
  screenshotUrl,
}: LinkCardDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl p-6 w-full max-w-2xl relative shadow-xl overflow-y-auto max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-900">{link.title}</h2>

        <div className="mb-6 flex justify-center">
          <img
            src={screenshotUrl}
            alt={link.title}
            className="w-2/3 h-auto rounded-lg shadow-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link
          </label>
          <div className="flex items-center space-x-2">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate flex-grow"
            >
              {link.url}
            </a>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700"
            >
              <ExternalLink size={18} />
            </a>
          </div>
        </div>

        {files.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attached Files ({files.length})
            </label>
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between border-b pb-2 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    {file.type === "pdf" ? (
                      <FileText size={24} className="text-red-500" />
                    ) : (
                      <ImageIcon size={24} className="text-blue-500" />
                    )}
                    <span className="text-sm font-medium truncate max-w-[200px]">
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
        )}
      </div>
    </div>
  );
}

