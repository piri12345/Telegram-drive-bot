import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, X, Trash2, Share } from "lucide-react";
import { getFileIcon, getFileTypeColor } from "@/lib/file-utils";
import { apiRequest } from "@/lib/queryClient";

interface FilePreviewModalProps {
  open: boolean;
  onClose: () => void;
  file: any;
}

export default function FilePreviewModal({ open, onClose, file }: FilePreviewModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (fileId: number) => {
      await apiRequest('DELETE', `/api/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/storage/usage'] });
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      });
    },
  });

  if (!file) return null;

  const FileIcon = getFileIcon(file.mimeType);
  const iconColor = getFileTypeColor(file.mimeType);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDownload = () => {
    window.open(`/api/files/${file.id}/download`, '_blank');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      deleteMutation.mutate(file.id);
    }
  };

  const handleShare = () => {
    toast({
      title: "Coming Soon",
      description: "File sharing functionality will be available soon",
    });
  };

  const renderPreview = () => {
    if (file.mimeType.startsWith('image/')) {
      return (
        <img 
          src={`/uploads/${file.name}`}
          alt={file.originalName}
          className="max-w-full max-h-full object-contain rounded-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
      );
    }

    if (file.mimeType.startsWith('video/')) {
      return (
        <video 
          controls 
          className="max-w-full max-h-full rounded-lg"
          preload="metadata"
        >
          <source src={`/uploads/${file.name}`} type={file.mimeType} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (file.mimeType.startsWith('audio/')) {
      return (
        <div className="flex flex-col items-center space-y-4">
          <div className={`w-32 h-32 bg-gradient-to-br ${iconColor} rounded-lg flex items-center justify-center`}>
            <FileIcon className="text-white text-4xl" />
          </div>
          <audio controls className="w-full max-w-md">
            <source src={`/uploads/${file.name}`} type={file.mimeType} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    // Default preview for other file types
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className={`w-32 h-32 bg-gradient-to-br ${iconColor} rounded-lg flex items-center justify-center`}>
          <FileIcon className="text-white text-4xl" />
        </div>
        <p className="text-gray-500">Preview not available for this file type</p>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${iconColor.replace('to-', '')} rounded flex items-center justify-center`}>
                <FileIcon className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{file.originalName}</h3>
                <p className="text-gray-500">
                  {formatFileSize(file.size)} • Uploaded {formatDate(file.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-6 min-h-[300px]">
            {renderPreview()}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
