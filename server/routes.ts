import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { comparePasswords, hashPassword, setupAuth } from "./auth";
import { insertMessageSchema, insertFeedbackSchema, chatRequestSchema, faqSnapshots, faqItems } from "@shared/schema";
import { transcribeAudio } from "./apis/openai";
import { textToSpeechStream } from "./apis/openaitts";
import multer from "multer";
import { WebSocketServer, WebSocket } from "ws";
import { suggestHandler } from "./apis/suggest";
import {
  apiRateLimit,
  validateMessage,
  validateFeedback,
  handleValidationErrors,
  validatePasswordChange
} from "./security";
import rateLimit from 'express-rate-limit';
import { sendError, getPersistentSessionId } from "./utils/errorResponse";
import dotenv from "dotenv";
import { db } from "./db";
import { desc, eq } from "drizzle-orm";
dotenv.config();

const createUserAwareRateLimiter = (options: { windowMs: number; max: number; message?: string }) =>
  rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: options.message || 'Too many requests' },
    keyGenerator: (req: Request) => {
      const userId = req.user?.id ?? 'anonymous';
      const ip = req.ip;
      return `${userId}-${ip}`;
    },
  });

// Chat: 10 messages per minute per user
const granularChatLimiter = createUserAwareRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many chat requests. Please wait a moment.",
});

// Transcribe: 5 uploads per 5 minutes per user
const granularTranscribeLimiter = createUserAwareRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: "Too many transcription requests. Please wait and try again.",
});


// Setup multer for handling file uploads (in-memory storage) with enhanced security
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit (OpenAI requirement)
    files: 1 // Only allow one file
  },
  fileFilter: (req, file, cb) => {
    // Only allow audio files for voice transcription
    const allowedMimeTypes = [
      'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm',
      'audio/m4a', 'audio/mpga', 'audio/mp3', 'audio/webm;codecs=opus'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.log(`Security: Rejected file upload with mime type: ${file.mimetype}`);
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  }
});

const SKAPI = process.env.SKAPI!;

// send message to SKAPI
async function sendMessageToLangchain(
  message: string,
  useWeb: boolean,
  useDb: boolean,
  selectedDb: string
): Promise<string> {
  // console.log(`Sending request to LangChain FastAPI: ${message}`);

  const response = await fetch(SKAPI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      useweb: useWeb,
      usedb: useDb,
      db: selectedDb,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("LangChain FastAPI Error:", errorText);
    throw new Error(`LangChain API responded with status ${response.status}`);
  }

  const data = await response.json();
  console.log("LangChain API Response:", JSON.stringify(data, null, 2));

  if (!data.reply) {
    throw new Error("No reply field in LangChain API response");
  }

  return data.reply.trim();
}


export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Apply API rate limiting to all API routes
  app.use("/api", apiRateLimit);

  // Text-based chat endpoint with security measures
  app.post("/api/chat",
    granularChatLimiter,
    validateMessage,
    handleValidationErrors,
    async (req: Request, res: Response) => {
      if (!req.isAuthenticated()) return sendError(res, 401, "Unauthorized");

      const persistentSessionId = getPersistentSessionId(req.user!.email);
      const result = chatRequestSchema.safeParse(req.body);
      if (!result.success) {
        console.error("Invalid request body:", result.error);
        return sendError(res, 400, "Invalid request data", result.error);
      }

      const body = result.data;

      try {
        // Check if the session exists, if not, create it
        const existingSession = await storage.getUserLastSession(req.user!.id);
        if (!existingSession || existingSession.sessionId !== persistentSessionId) {
          console.log(`Creating new session for user ${req.user!.id} with sessionId ${persistentSessionId}`);
          await storage.createUserSession(req.user!.id, persistentSessionId);
        }

        await storage.createMessage(req.user!.id, {
          ...body,
          isBot: false,
          sessionId: persistentSessionId,
        });

        // Get response from langchain
        const formattedResponse = await sendMessageToLangchain(
          body.content,
          body.useWeb ?? false,
          body.useDb ?? false,
          body.db ?? "files"
        );

        // Bot message should inherit the same category as the user message
        const botMessage = await storage.createMessage(req.user!.id, {
          content: formattedResponse,
          isBot: true,
          sessionId: persistentSessionId,
          category: body.category, // Inherit the category from the user message
        });

        res.json(botMessage);
      } catch (error) {
        console.error("Error in chat processing:", error);
        return sendError(res, 500, "Failed to process message", error instanceof Error ? error.message : "Unknown error");
      }
    }
  );

  app.post("/api/suggest", apiRateLimit, suggestHandler);

  // Voice input endpoint - transcribes audio only with enhanced security
  app.post(
    "/api/voice/transcribe",
    granularTranscribeLimiter,
    upload.single("audio"),
    async (req: Request, res: Response) => {
      if (!req.isAuthenticated()) return sendError(res, 401, "Unauthorized");
      if (!req.file) return sendError(res, 400, "No audio file uploaded");

      try {
        console.log(`Security: Audio file upload from user ${req.user!.email}, size: ${req.file.size} bytes`);

        // Transcribe audio to text
        const transcribedText = await transcribeAudio(req.file.buffer);
        console.log("Transcribed text:", transcribedText);

        // Return only the transcript
        return res.status(200).json({ transcribedText });
      } catch (error) {
        console.error("Error processing voice input:", error);
        return sendError(
          res,
          500,
          "Failed to process voice input",
          error instanceof Error ? error.message : "Unknown error"
        );

      }
    }
  );

  // Text-to-speech endpoint with validation
  app.post("/api/voice/speech",
    apiRateLimit,
    async (req: Request, res: Response) => {
      if (!req.isAuthenticated()) return sendError(res, 401, "Unauthorized");

      try {
        const { text, voiceId } = req.body;

        if (!text || typeof text !== 'string') {
          return sendError(res, 400, "Valid text is required");
        }

        if (text.length > 10000) {
          return sendError(res, 400, "Text too long (max 10,000 characters)");
        }

        console.log("Streaming TTS audio...");

        const openaiResponse = await textToSpeechStream(text, voiceId);

        // Set headers for streaming audio
        res.setHeader("Content-Type", "audio/wav");
        res.setHeader("Transfer-Encoding", "chunked");

        // Stream OpenAI's audio response directly to the client
        openaiResponse.data.pipe(res);
      } catch (error) {
        console.error("Streaming error:", error);
        return sendError(
          res,
          500,
          "Failed to stream speech",
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }
  );

  // ─── New: “Last Week FAQs” endpoint ────────────────────────────────────────
  app.get('/api/faq/last-week', async (_req: Request, res: Response) => {
    // 1. Fetch the most recent snapshot
    const [latest] = await db
      .select()
      .from(faqSnapshots)
      .orderBy(desc(faqSnapshots.generatedAt)) // use desc() helper instead of string
      .limit(1);

    if (!latest) {
      return res.status(404).json({ error: 'No FAQ snapshot found' });
    }

    // 2. Fetch items for that snapshot, ordered by count desc
    const items = await db
      .select({
        question: faqItems.question,
        count: faqItems.count,
      })
      .from(faqItems)
      .where(eq(faqItems.snapshotId, latest.id))
      .orderBy(desc(faqItems.count));          // again use desc()

    // 3. Return combined payload
    return res.json({
      generatedAt: latest.generatedAt,
      totalQuestions: latest.totalQuestions,
      trendText: latest.trendText,
      faqs: items,
    });
  })


  app.get("/api/messages/:sessionId",
    apiRateLimit,
    async (req: Request, res: Response) => {
      if (!req.isAuthenticated()) return sendError(res, 401, "Unauthorized");

      try {
        // Use the persistent sessionId from user's email
        const persistentSessionId = getPersistentSessionId(req.user!.email);

        // Check if the session exists, if not, create it
        const existingSession = await storage.getUserLastSession(req.user!.id);
        if (!existingSession || existingSession.sessionId !== persistentSessionId) {
          console.log(`Creating new session for user ${req.user!.id} with sessionId ${persistentSessionId}`);
          await storage.createUserSession(req.user!.id, persistentSessionId);
        }

        const messages = await storage.getMessagesByUserAndSession(
          req.user!.id,
          persistentSessionId
        );
        res.json(messages);
      } catch (error) {
        console.error("Error retrieving messages:", error);
        return sendError(
          res,
          500,
          "Failed to retrieve messages",
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }
  );

  // Delete all messages for a user's session
  app.delete("/api/messages/:sessionId",
    apiRateLimit,
    async (req: Request, res: Response) => {
      if (!req.isAuthenticated()) return sendError(res, 401, "Unauthorized");

      try {
        // Use the persistent sessionId from user's email
        const persistentSessionId = getPersistentSessionId(req.user!.email);

        await storage.deleteMessagesByUserAndSession(
          req.user!.id,
          persistentSessionId
        );

        console.log(`Deleted all messages for user ${req.user!.id} with sessionId ${persistentSessionId}`);
        res.status(200).json({ message: "Chat history deleted successfully" });
      } catch (error) {
        console.error("Error deleting messages:", error);
        return sendError(
          res,
          500,
          "Failed to delete messages",
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }
  );

  // Submit feedback with validation
  app.post("/api/feedback",
    apiRateLimit,
    validateFeedback,
    handleValidationErrors,
    async (req: Request, res: Response) => {
      if (!req.isAuthenticated()) return sendError(res, 401, "Unauthorized");

      const result = insertFeedbackSchema.safeParse(req.body);
      if (!result.success) {
        console.error("Invalid feedback data:", result.error);
        return sendError(res, 400, "Invalid feedback data", result.error);
      }

      try {
        // Get the user's persistent session ID
        const persistentSessionId = getPersistentSessionId(req.user!.email);

        // Create feedback entry
        const feedback = await storage.createFeedback(req.user!.id, {
          ...result.data,
          sessionId: persistentSessionId, // Use the persistent session ID
        });

        console.log(`Feedback submitted for user ${req.user!.id}`);
        res.status(201).json(feedback);
      } catch (error) {
        console.error("Error saving feedback:", error);
        return sendError(
          res,
          500,
          "Failed to save feedback",
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }
  );

  app.post("/api/change-password",
    apiRateLimit,
    validatePasswordChange, // Use the password validation defined above
    handleValidationErrors, // Handle validation errors
    async (req: Request, res: Response) => {
      if (!req.isAuthenticated()) return sendError(res, 401, "Unauthorized");
      console.log("🔍 Received change-password request");
      console.log("🔐 req.user:", req.user); // <== log this

      const { oldPassword, newPassword } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      try {
        // Fetch user from the database
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        // Compare old password
        const passwordValid = await comparePasswords(oldPassword, user.password);
        if (!passwordValid) {
          return res.status(400).json({ error: "Old password is incorrect" });
        }

        // Hash the new password and update it in the database
        const hashedPassword = await hashPassword(newPassword);
        await storage.updateUserPassword(userId, hashedPassword);

        // Respond with success
        res.status(200).json({ message: "Password changed successfully" });
      } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ error: "Failed to change password" });
      }
    }
  );

  const httpServer = createServer(app);

  // Set up WebSocket server with basic security
  const wss = new WebSocketServer({
    server: httpServer,
    path: '/ws',
    verifyClient: (info: any) => {
      // Basic rate limiting for WebSocket connections
      const origin = info.origin;
      const userAgent = info.req.headers['user-agent'];

      console.log(`WebSocket connection attempt from origin: ${origin}, user-agent: ${userAgent}`);

      // Allow all connections in development, add origin checking in production
      return true;
    }
  });

  interface VoiceModeClient {
    userId: number;
    email: string;
    ws: WebSocket;
    sessionId: string;
    lastActivity: number;
  }

  const voiceModeClients: VoiceModeClient[] = [];

  // Clean up inactive clients every 5 minutes
  setInterval(() => {
    const now = Date.now();
    const timeout = 30 * 60 * 1000; // 30 minutes

    for (let i = voiceModeClients.length - 1; i >= 0; i--) {
      const client = voiceModeClients[i];
      if (now - client.lastActivity > timeout) {
        console.log(`Removing inactive WebSocket client: ${client.email}`);
        client.ws.close();
        voiceModeClients.splice(i, 1);
      }
    }
  }, 5 * 60 * 1000);

  wss.on('connection', (ws, req) => {
    console.log(`WebSocket client connected from ${req.socket.remoteAddress}`);

    // Set up ping/pong for connection health
    (ws as any).isAlive = true;
    ws.on('pong', () => {
      (ws as any).isAlive = true;
    });

    // Handle client connection
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('WebSocket message received:', data.type);

        if (data.type === 'auth') {
          // Authenticate user and store connection info
          if (data.userId && data.email && data.sessionId) {
            const existingClientIndex = voiceModeClients.findIndex(
              client => client.userId === data.userId
            );

            const clientData = {
              userId: data.userId,
              email: data.email,
              ws,
              sessionId: data.sessionId,
              lastActivity: Date.now()
            };

            if (existingClientIndex !== -1) {
              // Update existing client
              voiceModeClients[existingClientIndex].ws = ws;
              console.log(`Updated WebSocket connection for user ${data.email}`);
            } else {
              // Add new client
              voiceModeClients.push({
                userId: data.userId,
                email: data.email,
                ws,
                sessionId: data.sessionId,
                lastActivity: Date.now()
              });
              console.log(`Registered WebSocket connection for user ${data.email}`);
            }

            // Send confirmation
            ws.send(JSON.stringify({ type: 'auth_success' }));
          }
          return;
        }

        // Require authentication for all other message types
        const client = voiceModeClients.find(c => c.ws === ws);
        if (!client) {
          console.warn("Unauthenticated WebSocket message blocked:", data.type);
          ws.send(JSON.stringify({ type: 'error', message: 'Authenticate first' }));
          ws.close();
          return;
        }

        client.lastActivity = Date.now();

        if (data.type === 'speech') {
          if (!data.audioData) {
            ws.send(JSON.stringify({ type: 'error', message: 'Missing audio data' }));
            return;
          }

          try {
            const buffer = Buffer.from(data.audioData, 'base64');
            console.log("Transcribing voice mode audio...");
            const transcribedText = await transcribeAudio(buffer);
            console.log("Voice mode transcribed text:", transcribedText);

            ws.send(JSON.stringify({
              type: 'transcription',
              text: transcribedText
            }));

            const persistentSessionId = getPersistentSessionId(client.email);

            const userMessage = await storage.createMessage(client.userId, {
              content: transcribedText,
              isBot: false,
              sessionId: persistentSessionId,
              category: "SELF",
            });

            console.log("Processing voice mode message with AI...");
            const formattedResponse = await sendMessageToLangchain(
              transcribedText,
              data.useweb ?? false,
              data.usedb ?? false,
              data.db ?? "files"
            );

            const botMessage = await storage.createMessage(client.userId, {
              content: formattedResponse,
              isBot: true,
              sessionId: persistentSessionId,
              category: userMessage.category,
            });

            ws.send(JSON.stringify({
              type: 'ai_response',
              userMessage,
              message: botMessage
            }));

            console.log("Generating speech for voice mode response...");
            try {
              const openaiResponse = await textToSpeechStream(formattedResponse);

              const chunks: Buffer[] = [];
              let totalSize = 0;
              let streamAborted = false;
              const MAX_AUDIO_SIZE = 5 * 1024 * 1024;

              openaiResponse.data.on('data', (chunk: Buffer) => {
                if (streamAborted) return;

                totalSize += chunk.length;
                if (totalSize > MAX_AUDIO_SIZE) {
                  streamAborted = true;
                  console.error(`TTS stream exceeded limit: ${totalSize} bytes`);
                  openaiResponse.data.destroy();

                  ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Audio response too large to handle safely.'
                  }));
                  return;
                }

                chunks.push(chunk);
              });

              openaiResponse.data.on('end', () => {
                if (streamAborted) return;

                const audioBuffer = Buffer.concat(chunks);
                const base64Audio = audioBuffer.toString('base64');

                ws.send(JSON.stringify({
                  type: 'speech_response',
                  audioData: base64Audio
                }));
              });

              openaiResponse.data.on('error', (err: Error) => {
                console.error("Error streaming TTS:", err);
                if (!streamAborted) {
                  ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Failed to generate speech'
                  }));
                }
              });

            } catch (error) {
              console.error("Error generating speech:", error);
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to generate speech response'
              }));
            }
          } catch (error) {
            console.error("Error processing voice mode message:", error);
            ws.send(JSON.stringify({
              type: 'error',
              message: error instanceof Error ? error.message : 'Unknown error'
            }));
          }
        }

      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      const clientIndex = voiceModeClients.findIndex(client => client.ws === ws);
      if (clientIndex !== -1) {
        const client = voiceModeClients[clientIndex];
        console.log(`User ${client.email} disconnected from voice mode`);
        voiceModeClients.splice(clientIndex, 1);
      }
    });

    ws.send(JSON.stringify({ type: 'connected' }));
  });

  return httpServer;
}