import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Folder, Clock, Star, Trash, Image, Video, Music, FileText } from "lucide-react";

interface SidebarProps {
  onUploadClick: () => void;
}

export default function Sidebar({ onUploadClick }: SidebarProps) {
  const { data: files = [] } = useQuery({
    queryKey: ['/api/files'],
  });

  const { data: storageUsage } = useQuery({
    queryKey: ['/api/storage/usage'],
  });

  const getFileTypeCounts = () => {
    const counts = {
      images: 0,
      videos: 0,
      audio: 0,
      documents: 0,
    };

    files.forEach((file: any) => {
      if (file.mimeType.startsWith('image/')) counts.images++;
      else if (file.mimeType.startsWith('video/')) counts.videos++;
      else if (file.mimeType.startsWith('audio/')) counts.audio++;
      else counts.documents++;
    });

    return counts;
  };

  const fileCounts = getFileTypeCounts();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden lg:block">
      <div className="p-6">
        <Button 
          className="w-full bg-primary text-white hover:bg-secondary"
          onClick={onUploadClick}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Upload
        </Button>
      </div>

      <nav className="px-4 space-y-1">
        <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium">
          <Folder className="w-5 h-5" />
          <span>My Files</span>
        </a>
        <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
          <Clock className="w-5 h-5" />
          <span>Recent</span>
        </a>
        <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
          <Star className="w-5 h-5" />
          <span>Starred</span>
        </a>
        <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
          <Trash className="w-5 h-5" />
          <span>Trash</span>
        </a>
      </nav>

      <div className="px-4 mt-8">
        <h3 className="text-sm font-medium text-gray-500 mb-3">File Types</h3>
        <div className="space-y-1">
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <Image className="text-blue-500 w-5 h-5" />
            <span>Images</span>
            <span className="ml-auto text-xs text-gray-500">{fileCounts.images}</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <Video className="text-red-500 w-5 h-5" />
            <span>Videos</span>
            <span className="ml-auto text-xs text-gray-500">{fileCounts.videos}</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <Music className="text-green-500 w-5 h-5" />
            <span>Audio</span>
            <span className="ml-auto text-xs text-gray-500">{fileCounts.audio}</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <FileText className="text-yellow-500 w-5 h-5" />
            <span>Documents</span>
            <span className="ml-auto text-xs text-gray-500">{fileCounts.documents}</span>
          </a>
        </div>
      </div>

      {storageUsage && (
        <div className="px-4 mt-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Storage Usage</h4>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${Math.min(storageUsage.percentage, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {formatBytes(storageUsage.used)} of {formatBytes(storageUsage.limit)} used
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
