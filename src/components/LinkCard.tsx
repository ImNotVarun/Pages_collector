import React, { useState, useEffect, useRef } from "react";
import {
  ExternalLink,
  FileText,
  Plus,
  Paperclip,
  X,
  Download,
  Image as ImageIcon,
  Pencil,
} from "lucide-react";
import { NotionLink, NotionFile } from "../types";
import { FileUploadModal } from "./FileUploadModal";
import { EditLinkModal } from "./EditLinkModal";
import { supabase } from "../lib/supabase";

interface LinkCardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: NotionLink;
  files: NotionFile[];
  onEdit: () => void;
}

function LinkCardDetailsModal({
  isOpen,
  onClose,
  link,
  files,
  onEdit,
}: LinkCardDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl"
      >
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onEdit}
            className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-all duration-200"
            title="Edit link"
          >
            <Pencil size={16} className="text-gray-600" />
          </button>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-1 rounded-full transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <div
          className={`h-32 bg-gradient-to-br ${link.gradient} rounded-t-xl mb-6`}
        />

        <h2 className="text-2xl font-bold mb-4 text-gray-900">{link.title}</h2>

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

export function LinkCard({
  link,
  onUpdate,
}: {
  link: NotionLink;
  onUpdate: () => void;
}) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [files, setFiles] = useState<NotionFile[]>([]);
  const [fileCount, setFileCount] = useState(0);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from("notion_files")
        .select("*")
        .eq("link_id", link.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFiles(data || []);
      setFileCount(data?.length || 0);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    const getFileCount = async () => {
      const { count } = await supabase
        .from("notion_files")
        .select("*", { count: "exact", head: true })
        .eq("link_id", link.id);
      setFileCount(count || 0);
    };
    getFileCount();
  }, [link.id]);

  const handleCardClick = async () => {
    await fetchFiles();
    setIsDetailsModalOpen(true);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer relative"
      >
        <div
          className={`h-32 bg-gradient-to-br ${link.gradient} group-hover:opacity-90 transition-opacity`}
        />
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors mb-4">
            {link.title}
          </h3>
          <p className="text-sm text-gray-500 truncate mb-4">{link.url}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {fileCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchFiles();
                    setIsDetailsModalOpen(true);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex items-center"
                  title="View attachments"
                >
                  <Paperclip size={18} />
                  <span className="ml-1 text-sm">{fileCount}</span>
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsUploadModalOpen(true);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Add attachment"
              >
                <Plus size={18} />
              </button>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Open link"
              >
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
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

      <LinkCardDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        link={link}
        files={files}
        onEdit={() => {
          setIsDetailsModalOpen(false);
          setIsEditModalOpen(true);
        }}
      />

      <EditLinkModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        link={link}
        onUpdate={onUpdate}
      />
    </>
  );
}
