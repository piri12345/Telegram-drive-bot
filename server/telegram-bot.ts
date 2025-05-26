import TelegramBot from 'node-telegram-bot-api';
import { storage } from './storage';
import path from 'path';
import fs from 'fs';
import { insertFileSchema } from '@shared/schema';

export class TelegramBotService {
  private bot: TelegramBot | null = null;
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async initialize(token: string) {
    if (!token) {
      console.log('Telegram bot token not provided');
      return;
    }

    try {
      this.bot = new TelegramBot(token, { polling: true });
      this.setupBotHandlers();
      console.log('Telegram bot initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Telegram bot:', error);
    }
  }

  private setupBotHandlers() {
    if (!this.bot) return;

    // Start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramUserId = msg.from?.id.toString();
      
      await this.bot!.sendMessage(chatId, 
        `🚀 Welcome to CloudDrive Bot!\n\n` +
        `To connect your account:\n` +
        `1. Sign in to CloudDrive web app\n` +
        `2. Go to Settings and connect Telegram\n` +
        `3. Use code: ${telegramUserId}\n\n` +
        `Once connected, you can upload files directly here!`
      );
    });

    // Connect command
    this.bot.onText(/\/connect (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const telegramUserId = msg.from?.id.toString();
      const telegramUsername = msg.from?.username;
      const userId = match?.[1];

      if (!userId || !telegramUserId) {
        await this.bot!.sendMessage(chatId, '❌ Invalid connection code. Please try again.');
        return;
      }

      try {
        const user = await storage.getUser(userId);
        if (!user) {
          await this.bot!.sendMessage(chatId, '❌ User not found. Please check your connection code.');
          return;
        }

        // Update user with Telegram info
        await storage.connectTelegram(userId, telegramUserId, telegramUsername || '');
        
        await this.bot!.sendMessage(chatId, 
          `✅ Successfully connected to CloudDrive!\n\n` +
          `📊 Your storage limit is now upgraded to 100GB!\n` +
          `📁 Send me any file to upload it to your cloud storage.`
        );
      } catch (error) {
        console.error('Error connecting Telegram:', error);
        await this.bot!.sendMessage(chatId, '❌ Failed to connect. Please try again later.');
      }
    });

    // Handle file uploads
    this.bot.on('document', async (msg) => {
      await this.handleFileUpload(msg, msg.document);
    });

    this.bot.on('photo', async (msg) => {
      if (msg.photo && msg.photo.length > 0) {
        const photo = msg.photo[msg.photo.length - 1]; // Get highest resolution
        await this.handleFileUpload(msg, photo, 'image.jpg');
      }
    });

    this.bot.on('video', async (msg) => {
      await this.handleFileUpload(msg, msg.video);
    });

    this.bot.on('audio', async (msg) => {
      await this.handleFileUpload(msg, msg.audio);
    });

    this.bot.on('voice', async (msg) => {
      await this.handleFileUpload(msg, msg.voice, 'voice.ogg');
    });

    // Help command
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;
      await this.bot!.sendMessage(chatId,
        `🤖 CloudDrive Bot Commands:\n\n` +
        `/start - Get started\n` +
        `/connect <code> - Connect your account\n` +
        `/status - Check connection status\n` +
        `/help - Show this help\n\n` +
        `📁 Simply send any file to upload it!`
      );
    });

    // Status command
    this.bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramUserId = msg.from?.id.toString();

      try {
        const user = await storage.getUserByTelegramId(telegramUserId || '');
        if (user) {
          const usage = await storage.getUserStorageUsage(user.id);
          const limit = user.telegramConnected ? 100 * 1024 * 1024 * 1024 : 15 * 1024 * 1024 * 1024; // 100GB vs 15GB
          const usedGB = (usage / (1024 * 1024 * 1024)).toFixed(2);
          const limitGB = (limit / (1024 * 1024 * 1024)).toFixed(0);

          await this.bot!.sendMessage(chatId,
            `📊 Account Status:\n\n` +
            `✅ Connected to CloudDrive\n` +
            `💾 Storage: ${usedGB}GB / ${limitGB}GB\n` +
            `📁 Ready to receive files!`
          );
        } else {
          await this.bot!.sendMessage(chatId,
            `❌ Not connected to CloudDrive\n\n` +
            `Use /start to get connection instructions.`
          );
        }
      } catch (error) {
        await this.bot!.sendMessage(chatId, '❌ Failed to check status. Please try again.');
      }
    });
  }

  private async handleFileUpload(msg: any, fileInfo: any, defaultName?: string) {
    const chatId = msg.chat.id;
    const telegramUserId = msg.from?.id.toString();

    if (!telegramUserId) {
      await this.bot!.sendMessage(chatId, '❌ Unable to identify user.');
      return;
    }

    try {
      // Check if user is connected
      const user = await storage.getUserByTelegramId(telegramUserId);
      if (!user) {
        await this.bot!.sendMessage(chatId, 
          '❌ Please connect your account first using /start command.'
        );
        return;
      }

      // Check file size (2GB limit)
      if (fileInfo.file_size && fileInfo.file_size > 2 * 1024 * 1024 * 1024) {
        await this.bot!.sendMessage(chatId, '❌ File too large. Maximum size is 2GB.');
        return;
      }

      await this.bot!.sendMessage(chatId, '⏳ Uploading file...');

      // Download file from Telegram
      const fileLink = await this.bot!.getFileLink(fileInfo.file_id);
      const response = await fetch(fileLink);
      
      if (!response.ok) {
        throw new Error('Failed to download file from Telegram');
      }

      // Generate unique filename
      const originalName = fileInfo.file_name || defaultName || 'file';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(originalName);
      const filename = uniqueSuffix + extension;
      const filePath = path.join(this.uploadDir, filename);

      // Save file
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));

      // Determine MIME type
      let mimeType = 'application/octet-stream';
      if (fileInfo.mime_type) {
        mimeType = fileInfo.mime_type;
      } else if (extension) {
        const extToMime: { [key: string]: string } = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.mp4': 'video/mp4',
          '.mp3': 'audio/mpeg',
          '.ogg': 'audio/ogg',
          '.pdf': 'application/pdf',
          '.txt': 'text/plain',
        };
        mimeType = extToMime[extension.toLowerCase()] || mimeType;
      }

      // Save to database
      const fileData = {
        userId: user.id,
        name: filename,
        originalName: originalName,
        mimeType: mimeType,
        size: fileInfo.file_size || buffer.byteLength,
        path: filePath,
        uploadSource: "telegram",
      };

      const validatedData = insertFileSchema.parse(fileData);
      await storage.createFile(validatedData);

      await this.bot!.sendMessage(chatId, 
        `✅ File uploaded successfully!\n\n` +
        `📁 ${originalName}\n` +
        `💾 ${this.formatFileSize(fileInfo.file_size || buffer.byteLength)}\n\n` +
        `Access it on CloudDrive web app.`
      );

    } catch (error) {
      console.error('Error uploading file via Telegram:', error);
      await this.bot!.sendMessage(chatId, '❌ Failed to upload file. Please try again.');
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async sendMessage(telegramUserId: string, message: string) {
    if (this.bot) {
      try {
        await this.bot.sendMessage(telegramUserId, message);
      } catch (error) {
        console.error('Error sending Telegram message:', error);
      }
    }
  }
}

export const telegramBot = new TelegramBotService();