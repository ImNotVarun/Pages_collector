export interface NotionLink {
  id: number;
  title: string;
  url: string;
  gradient: string;
  files?: NotionFile[];
  created_at: string;
}

export interface NotionFile {
  id: number;
  link_id: number;
  name: string;
  url: string;
  type: 'pdf' | 'image';
  created_at: string;
}