import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, X, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface TelegramSettingsProps {
  open: boolean;
  onClose: () => void;
}

export default function TelegramSettings({ open, onClose }: TelegramSettingsProps) {
  const [telegramUserId, setTelegramUserId] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const connectMutation = useMutation({
    mutationFn: async ({ telegramUserId, telegramUsername }: { telegramUserId: string; telegramUsername: string }) => {
      const response = await apiRequest('POST', '/api/telegram/connect', {
        telegramUserId,
        telegramUsername,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/storage/usage'] });
      toast({
        title: "Success!",
        description: "Telegram bot connected successfully! Your storage limit is now 100GB.",
      });
      onClose();
      setTelegramUserId("");
      setTelegramUsername("");
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect Telegram bot",
        variant: "destructive",
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/telegram/disconnect');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/storage/usage'] });
      toast({
        title: "Disconnected",
        description: "Telegram bot disconnected. Storage limit reverted to 15GB.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Disconnection Failed",
        description: error.message || "Failed to disconnect Telegram bot",
        variant: "destructive",
      });
    },
  });

  const handleConnect = () => {
    if (!telegramUserId.trim()) {
      toast({
        title: "Error",
        description: "Please enter your Telegram User ID",
        variant: "destructive",
      });
      return;
    }
    connectMutation.mutate({ telegramUserId: telegramUserId.trim(), telegramUsername: telegramUsername.trim() });
  };

  const handleDisconnect = () => {
    if (window.confirm('Are you sure you want to disconnect Telegram? Your storage limit will revert to 15GB.')) {
      disconnectMutation.mutate();
    }
  };

  const openTelegramBot = () => {
    window.open('https://t.me/your_bot_username', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <span>Telegram Bot</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {user?.telegramConnected ? (
            // Connected State
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Telegram Bot Connected</span>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="space-y-2">
                  <p className="text-sm text-green-800">
                    <strong>Storage Upgraded:</strong> 100GB
                  </p>
                  {user.telegramUsername && (
                    <p className="text-sm text-green-800">
                      <strong>Username:</strong> @{user.telegramUsername}
                    </p>
                  )}
                  <p className="text-sm text-green-800">
                    <strong>User ID:</strong> {user.telegramUserId}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={openTelegramBot}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Open Bot
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>

                <Button 
                  variant="outline" 
                  onClick={handleDisconnect}
                  disabled={disconnectMutation.isPending}
                  className="w-full border-red-200 text-red-600 hover:bg-red-50"
                >
                  {disconnectMutation.isPending ? "Disconnecting..." : "Disconnect Bot"}
                </Button>
              </div>
            </div>
          ) : (
            // Disconnected State
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Connect Telegram Bot</span>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900">Benefits of connecting:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Upgrade storage to 100GB</li>
                    <li>• Upload files directly via Telegram</li>
                    <li>• Easy file sharing and management</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="telegram-user-id">Telegram User ID *</Label>
                  <Input
                    id="telegram-user-id"
                    value={telegramUserId}
                    onChange={(e) => setTelegramUserId(e.target.value)}
                    placeholder="Enter your Telegram User ID"
                  />
                  <p className="text-xs text-gray-500">
                    Don't know your User ID? Message our bot and use /start command
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegram-username">Telegram Username (optional)</Label>
                  <Input
                    id="telegram-username"
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                    placeholder="@username (optional)"
                  />
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={openTelegramBot}
                    variant="outline"
                    className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Open Bot to Get User ID
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>

                  <Button 
                    onClick={handleConnect}
                    disabled={connectMutation.isPending || !telegramUserId.trim()}
                    className="w-full bg-primary text-white"
                  >
                    {connectMutation.isPending ? "Connecting..." : "Connect Bot"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="font-medium text-gray-900 mb-2">How to connect:</h4>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Click "Open Bot to Get User ID"</li>
              <li>2. Send /start command to the bot</li>
              <li>3. Copy your User ID from bot message</li>
              <li>4. Paste it here and click "Connect Bot"</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}