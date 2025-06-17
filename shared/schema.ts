import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
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
export const insertUserSchema = z
  .object({
    email: z.string().email("有効なメールアドレスを入力してください"),
    password: z
      .string()
      .min(8, "パスワードは8文字以上でなければなりません")
      .max(128, "パスワードは128文字以下でなければなりません")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        "英大文字・小文字・数字・記号を含めてください"
      ),
    confirmPassword: z.string(),
    inviteToken: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  });

// ✅ Backend-safe insert schema (used in Drizzle + DB)
export const insertUserSafeSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
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

export const inviteTokens = pgTable("invite_tokens", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  createdById: integer("created_by_id").references(() => users.id),
  usedById: integer("used_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  usedAt: timestamp("used_at"),
  isValid: boolean("is_valid").default(true).notNull(),
});

// ✅ Lightweight schema for login only (no strength checks)
export const loginUserSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードは必須です"),
});

export type LoginUser = z.infer<typeof loginUserSchema>;


export type InviteToken = typeof inviteTokens.$inferSelect;
export type InsertInviteToken = {
  token: string;
  createdById: number;
};

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUserSafe = z.infer<typeof insertUserSafeSchema>;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;