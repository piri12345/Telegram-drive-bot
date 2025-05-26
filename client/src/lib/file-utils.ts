import { 
  Image, 
  Video, 
  Music, 
  FileText, 
  Archive, 
  File as FileIcon,
  FileType,
  Sheet,
  FileImage,
  FileVideo,
  FileAudio
} from "lucide-react";

export function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.startsWith('video/')) return Video;
  if (mimeType.startsWith('audio/')) return Music;
  if (mimeType === 'application/pdf') return FileType;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return Sheet;
  if (mimeType.includes('document') || mimeType.includes('word')) return FileText;
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return Archive;
  return FileIcon;
}

export function getFileTypeColor(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'from-blue-500 to-blue-600';
  if (mimeType.startsWith('video/')) return 'from-red-500 to-red-600';
  if (mimeType.startsWith('audio/')) return 'from-green-500 to-green-600';
  if (mimeType === 'application/pdf') return 'from-red-500 to-red-600';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'from-green-500 to-green-600';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'from-blue-500 to-blue-600';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'from-yellow-500 to-yellow-600';
  return 'from-gray-500 to-gray-600';
}

export function getFileCategory(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
}
