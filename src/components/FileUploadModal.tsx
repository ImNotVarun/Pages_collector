import React, { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkId: number;
  onFileUploaded: () => void;
}

export function FileUploadModal({ isOpen, onClose, linkId, onFileUploaded }: FileUploadModalProps) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${linkId}/${fileName}`;

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('notion-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('notion-files')
          .getPublicUrl(filePath);

        // Save file reference in the database
        const { error: dbError } = await supabase
          .from('notion_files')
          .insert({
            link_id: linkId,
            name: file.name,
            url: publicUrl,
            type: file.type.includes('pdf') ? 'pdf' : 'image'
          });

        if (dbError) throw dbError;
      }

      toast.success('Files uploaded successfully!');
      onFileUploaded();
      onClose();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Upload Files</h2>

        <form onSubmit={handleFileUpload} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
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
                  <li key={index} className="text-sm text-gray-600">
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !files || files.length === 0}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
          >
            {uploading ? (
              <>
                <Loader2 size={20} className="animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              'Upload Files'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}