import {
  users,
  messages,
  sessions,
  feedback,
  inviteTokens,
  type User,
  type InsertUserSafe,
  type Message,
  type InsertMessage,
  type Session,
  type Feedback,
  type InsertFeedback,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUserSafe): Promise<User>;
  getMessagesByUserAndSession(userId: number, sessionId: string): Promise<Message[]>;
  createMessage(userId: number, message: InsertMessage): Promise<Message>;
  getUserLastSession(userId: number): Promise<Session | undefined>;
  createUserSession(userId: number, sessionId: string): Promise<Session>;
  deleteMessagesByUserAndSession(userId: number, sessionId: string): Promise<void>;
  createFeedback(userId: number, feedbackData: InsertFeedback): Promise<Feedback>;
  getInviteToken(tokenString: string): Promise<typeof inviteTokens.$inferSelect | undefined>;
  useInviteToken(tokenId: number, userId: number): Promise<void>;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUserSafe): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getMessagesByUserAndSession(userId: number, sessionId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(and(eq(messages.userId, userId), eq(messages.sessionId, sessionId)))
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
      .where(and(eq(messages.userId, userId), eq(messages.sessionId, sessionId)));
  }

  async createFeedback(userId: number, feedbackData: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db
      .insert(feedback)
      .values({
        userId,
        ...feedbackData,
      })
      .returning();
    return newFeedback;
  }

  async getInviteToken(tokenString: string) {
    const [token] = await db
      .select()
      .from(inviteTokens)
      .where(eq(inviteTokens.token, tokenString));
    return token;
  }

  async useInviteToken(tokenId: number, userId: number) {
    await db
      .update(inviteTokens)
      .set({
        usedById: userId,
        usedAt: new Date(),
        isValid: false,
      })
      .where(eq(inviteTokens.id, tokenId));
  }
}

export const storage = new DatabaseStorage();