import { useState } from "react";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import FileGrid from "@/components/file-grid";
import FileUpload from "@/components/file-upload";
import FilePreviewModal from "@/components/file-preview-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Home() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const handleFilePreview = (file: any) => {
    setSelectedFile(file);
    setPreviewModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral">
      <Header />
      
      <div className="flex h-screen pt-16">
        <Sidebar onUploadClick={() => setUploadModalOpen(true)} />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
              <span>My Files</span>
              <span>/</span>
              <span className="text-gray-900">All Files</span>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-gray-900">My Files</h2>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center bg-white border border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`px-3 py-2 ${viewMode === "grid" ? "text-primary" : "text-gray-500"}`}
                    onClick={() => setViewMode("grid")}
                  >
                    <div className="grid grid-cols-2 gap-1 w-4 h-4">
                      <div className="bg-currentColor rounded-sm"></div>
                      <div className="bg-currentColor rounded-sm"></div>
                      <div className="bg-currentColor rounded-sm"></div>
                      <div className="bg-currentColor rounded-sm"></div>
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`px-3 py-2 ${viewMode === "list" ? "text-primary" : "text-gray-500"}`}
                    onClick={() => setViewMode("list")}
                  >
                    <div className="space-y-1 w-4 h-4">
                      <div className="bg-currentColor h-0.5 rounded"></div>
                      <div className="bg-currentColor h-0.5 rounded"></div>
                      <div className="bg-currentColor h-0.5 rounded"></div>
                    </div>
                  </Button>
                </div>

                <Button
                  className="lg:hidden bg-primary text-white"
                  onClick={() => setUploadModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <FileGrid 
              viewMode={viewMode} 
              onFilePreview={handleFilePreview}
            />
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <button className="flex flex-col items-center py-2 text-primary">
            <div className="grid grid-cols-2 gap-1 w-5 h-5 mb-1">
              <div className="bg-currentColor rounded-sm"></div>
              <div className="bg-currentColor rounded-sm"></div>
              <div className="bg-currentColor rounded-sm"></div>
              <div className="bg-currentColor rounded-sm"></div>
            </div>
            <span className="text-xs">Files</span>
          </button>
          <button 
            className="flex flex-col items-center py-2 text-gray-500"
            onClick={() => setUploadModalOpen(true)}
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mb-1">
              <Plus className="text-white w-4 h-4" />
            </div>
            <span className="text-xs text-primary">Upload</span>
          </button>
          <button className="flex flex-col items-center py-2 text-gray-500">
            <div className="w-5 h-5 mb-1 rounded-full bg-gray-400"></div>
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>

      <FileUpload 
        open={uploadModalOpen} 
        onClose={() => setUploadModalOpen(false)} 
      />
      
      <FilePreviewModal
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        file={selectedFile}
      />
    </div>
  );
}
