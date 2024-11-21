import React, { useState, useEffect } from "react";
import { X, Loader2, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { NotionLink, NotionFile } from "../types";
import toast from "react-hot-toast";

interface EditLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: NotionLink;
  onUpdate: () => void;
}

export function EditLinkModal({
  isOpen,
  onClose,
  link,
  onUpdate,
}: EditLinkModalProps) {
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const [files, setFiles] = useState<NotionFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      const { data, error } = await supabase
        .from("notion_files")
        .select("*")
        .eq("link_id", link.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching files:", error);
      } else {
        setFiles(data || []);
      }
    };

    if (isOpen) {
      fetchFiles();
    }
  }, [isOpen, link.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("notion_links")
        .update({ title, url })
        .eq("id", link.id);

      if (error) throw error;

      toast.success("Link updated successfully!");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating link:", error);
      toast.error("Failed to update link");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
      const { error } = await supabase
        .from("notion_files")
        .delete()
        .eq("id", fileId);

      if (error) throw error;

      setFiles(files.filter((file) => file.id !== fileId));
      toast.success("File deleted successfully!");
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    }
  };

  if (!isOpen) return null;

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
              required
            />
          </div>

          {files.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Attached Files</h3>
              <ul className="space-y-2">
                {files.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteFile(file.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Update Link"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
