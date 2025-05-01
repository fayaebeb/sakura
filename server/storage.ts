import { users, messages, sessions, type User, type InsertUser, type Message, type InsertMessage, type Session } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getMessagesByUserAndSession(userId: number, sessionId: string): Promise<Message[]>;
  createMessage(userId: number, message: InsertMessage): Promise<Message>;
  getUserLastSession(userId: number): Promise<Session | undefined>;
  createUserSession(userId: number, sessionId: string): Promise<Session>;
  deleteMessagesByUserAndSession(userId: number, sessionId: string): Promise<void>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getMessagesByUserAndSession(userId: number, sessionId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.userId, userId),
          eq(messages.sessionId, sessionId)
        )
      )
      .orderBy(messages.timestamp);
  }

  async createMessage(userId: number, message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values({
        userId,
        ...message,
      })
      .returning();
    return newMessage;
  }

  async getUserLastSession(userId: number): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(desc(sessions.createdAt))
      .limit(1);
    return session;
  }

  async createUserSession(userId: number, sessionId: string): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values({
        userId,
        sessionId,
      })
      .returning();
    return session;
  }

  async deleteMessagesByUserAndSession(userId: number, sessionId: string): Promise<void> {
    await db
      .delete(messages)
      .where(
        and(
          eq(messages.userId, userId),
          eq(messages.sessionId, sessionId)
        )
      );
  }
}

export const storage = new DatabaseStorage();