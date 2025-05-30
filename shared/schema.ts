import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  isBot: boolean("is_bot").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  sessionId: text("session_id").notNull().references(() => sessions.sessionId),
  category: text("category").default("SELF").notNull(),
});

// Representing the feedback table that already exists in the database
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  sessionId: text("session_id").references(() => sessions.sessionId),
  messageId: integer("message_id").references(() => messages.id),
  comment: text("comment"),
  rating: integer("rating"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Add password validation to the insert schema
export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true
  })
  .extend({
    password: z.string().min(6, "パスワードは6文字以上でなければなりません")
  });

export const insertSessionSchema = createInsertSchema(sessions).pick({
  userId: true,
  sessionId: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  isBot: true,
  sessionId: true,
  category: true,
});

export const chatRequestSchema = insertMessageSchema.extend({
  useWeb: z.boolean().optional(),
  useDb: z.boolean().optional(),
  db: z.string().optional(),
});

export const insertFeedbackSchema = createInsertSchema(feedback).pick({
  comment: true,
  rating: true,
  messageId: true,
  sessionId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;