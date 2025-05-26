import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Cloud, Search, Database, MessageCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TelegramSettings from "@/components/telegram-settings";

export default function Header() {
  const { user } = useAuth();
  const [telegramSettingsOpen, setTelegramSettingsOpen] = useState(false);
  
  const { data: storageUsage } = useQuery({
    queryKey: ['/api/storage/usage'],
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Cloud className="text-white text-lg" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">CloudDrive</h1>
          </div>
          
          <div className="hidden md:block">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search files..." 
                className="w-80 pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {storageUsage && (
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <Database className="text-accent w-4 h-4" />
              <span>{formatBytes((storageUsage as any).used)}</span>
              <span>/</span>
              <span>{formatBytes((storageUsage as any).limit)}</span>
              {(storageUsage as any).telegramConnected && (
                <MessageCircle className="text-blue-500 w-4 h-4" title="Telegram Connected" />
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setTelegramSettingsOpen(true)}
              className="hidden md:flex items-center space-x-1"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Bot</span>
            </Button>
            
            {(user as any)?.profileImageUrl && (
              <img 
                src={(user as any).profileImageUrl} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover" 
              />
            )}
            <span className="hidden md:inline text-gray-700 font-medium">
              {(user as any)?.firstName || (user as any)?.email || 'User'}
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = '/api/logout'}
            >
              Logout
            </Button>
          </div>
        </div>

        <TelegramSettings 
          open={telegramSettingsOpen} 
          onClose={() => setTelegramSettingsOpen(false)} 
        />
      </div>
    </header>
  );
}
