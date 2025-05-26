import {
  users,
  files,
  folders,
  type User,
  type UpsertUser,
  type File,
  type InsertFile,
  type Folder,
  type InsertFolder,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByTelegramId(telegramUserId: string): Promise<User | undefined>;
  connectTelegram(userId: string, telegramUserId: string, telegramUsername: string): Promise<User>;
  disconnectTelegram(userId: string): Promise<User>;
  
  // File operations
  createFile(file: InsertFile): Promise<File>;
  getFilesByUserId(userId: string): Promise<File[]>;
  getFileById(id: number, userId: string): Promise<File | undefined>;
  deleteFile(id: number, userId: string): Promise<boolean>;
  getUserStorageUsage(userId: string): Promise<number>;
  
  // Folder operations
  createFolder(folder: InsertFolder): Promise<Folder>;
  getFoldersByUserId(userId: string): Promise<Folder[]>;
  deleteFolder(id: number, userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByTelegramId(telegramUserId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.telegramUserId, telegramUserId));
    return user;
  }

  async connectTelegram(userId: string, telegramUserId: string, telegramUsername: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        telegramUserId,
        telegramUsername,
        telegramConnected: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async disconnectTelegram(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        telegramUserId: null,
        telegramUsername: null,
        telegramConnected: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // File operations
  async createFile(file: InsertFile): Promise<File> {
    const [newFile] = await db
      .insert(files)
      .values(file)
      .returning();
    return newFile;
  }

  async getFilesByUserId(userId: string): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(eq(files.userId, userId))
      .orderBy(desc(files.createdAt));
  }

  async getFileById(id: number, userId: string): Promise<File | undefined> {
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, id), eq(files.userId, userId)));
    return file;
  }

  async deleteFile(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(files)
      .where(and(eq(files.id, id), eq(files.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async getUserStorageUsage(userId: string): Promise<number> {
    const result = await db
      .select({ totalSize: sql<number>`sum(${files.size})` })
      .from(files)
      .where(eq(files.userId, userId));
    return result[0]?.totalSize || 0;
  }

  // Folder operations
  async createFolder(folder: InsertFolder): Promise<Folder> {
    const [newFolder] = await db
      .insert(folders)
      .values(folder)
      .returning() as any;
    return newFolder;
  }

  async getFoldersByUserId(userId: string): Promise<Folder[]> {
    return await db
      .select()
      .from(folders)
      .where(eq(folders.userId, userId))
      .orderBy(folders.name);
  }

  async deleteFolder(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(folders)
      .where(and(eq(folders.id, id), eq(folders.userId, userId)));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
