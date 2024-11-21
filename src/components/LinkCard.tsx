import React, { useState, useEffect } from "react";
import { ExternalLink, Paperclip, Plus, Pencil } from "lucide-react";
import { NotionLink, NotionFile } from "../types";
import { FileUploadModal } from "./FileUploadModal";
import { EditLinkModal } from "./EditLinkModal";
import { LinkCardDetailsModal } from "./LinkCardDetaileModel";
import { supabase } from "../lib/supabase";

export function LinkCard({
  link,
  onUpdate,
}: {
  link: NotionLink;
  onUpdate: () => void;
}) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [fileCount, setFileCount] = useState(0);
  const [files, setFiles] = useState<NotionFile[]>([]);

  const screenshotUrl = `https://api.screenshotmachine.com?key=a8463f&url=${encodeURIComponent(
    link.url
  )}&dimension=1024x768&device=desktop&format=png&delay=5000`;

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

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from("notion_files")
        .select("*")
        .eq("link_id", link.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

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
        <div className="h-32 bg-gray-200 relative overflow-hidden">
          <img
            src={screenshotUrl}
            alt={link.title}
            className="w-full h-full object-cover"
          />
        </div>
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
                    handleCardClick();
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditModalOpen(true);
          }}
          className="absolute top-2 left-2 bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-blue-600 transition-colors"
          title="Edit link"
        >
          <Pencil size={16} />
        </button>
      </div>

      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        linkId={link.id}
        onFileUploaded={onUpdate}
      />

      <EditLinkModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        link={link}
        onUpdate={onUpdate}
      />

      <LinkCardDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        link={link}
        files={files}
        screenshotUrl={screenshotUrl}
      />
    </>
  );
}
