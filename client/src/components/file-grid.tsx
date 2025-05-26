import { useQuery } from "@tanstack/react-query";
import { getFileIcon, getFileTypeColor } from "@/lib/file-utils";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

interface FileGridProps {
  viewMode: "grid" | "list";
  onFilePreview: (file: any) => void;
}

export default function FileGrid({ viewMode, onFilePreview }: FileGridProps) {
  const { data: files = [], isLoading } = useQuery({
    queryKey: ['/api/files'],
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 animate-pulse">
            <div className="aspect-square p-4 flex flex-col items-center justify-center">
              <div className="w-full h-24 bg-gray-200 rounded-lg mb-2"></div>
              <div className="w-full h-4 bg-gray-200 rounded mb-1"></div>
              <div className="w-16 h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
        <p className="text-gray-500">Upload your first file to get started</p>
      </div>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {files.map((file: any) => {
          const FileIcon = getFileIcon(file.mimeType);
          const iconColor = getFileTypeColor(file.mimeType);
          
          return (
            <div 
              key={file.id}
              className="group relative bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => onFilePreview(file)}
            >
              <div className="aspect-square p-4 flex flex-col items-center justify-center">
                {file.mimeType.startsWith('image/') ? (
                  <img 
                    src={`/uploads/${file.name}`}
                    alt={file.originalName}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : (
                  <div className={`w-full h-24 bg-gradient-to-br ${iconColor} rounded-lg mb-2 flex items-center justify-center`}>
                    <FileIcon className="text-white text-2xl" />
                  </div>
                )}
                <p className="text-sm font-medium text-gray-900 truncate w-full text-center">
                  {file.originalName}
                </p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>
              
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-6 h-6 p-0 bg-white rounded-full shadow-md hover:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement file menu
                  }}
                >
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </div>

              <div className="absolute top-2 left-2">
                <div className={`w-5 h-5 ${iconColor.replace('to-', '')} rounded flex items-center justify-center`}>
                  <FileIcon className="text-white text-xs" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // List view
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 text-sm font-medium text-gray-500">
        <div className="col-span-6">Name</div>
        <div className="col-span-2">Size</div>
        <div className="col-span-3">Modified</div>
        <div className="col-span-1"></div>
      </div>
      
      {files.map((file: any) => {
        const FileIcon = getFileIcon(file.mimeType);
        const iconColor = getFileTypeColor(file.mimeType);
        
        return (
          <div 
            key={file.id}
            className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onFilePreview(file)}
          >
            <div className="col-span-6 flex items-center space-x-3">
              <div className={`w-8 h-8 ${iconColor.replace('to-', '')} rounded flex items-center justify-center`}>
                <FileIcon className="text-white text-sm" />
              </div>
              <span className="truncate">{file.originalName}</span>
            </div>
            <div className="col-span-2 flex items-center text-sm text-gray-500">
              {formatFileSize(file.size)}
            </div>
            <div className="col-span-3 flex items-center text-sm text-gray-500">
              {formatDate(file.createdAt)}
            </div>
            <div className="col-span-1 flex items-center justify-end">
              <Button 
                variant="ghost" 
                size="sm"
                className="w-8 h-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement file menu
                }}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
