import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertMessageSchema, insertFeedbackSchema, chatRequestSchema } from "@shared/schema";
import { transcribeAudio } from "./apis/openai";
import { textToSpeechStream } from "./apis/openaitts";
import multer from "multer";
import { WebSocketServer, WebSocket } from "ws";
import { suggestHandler } from "./apis/suggest";
import { 
  apiRateLimit, 
  chatRateLimit, 
  uploadRateLimit,
  validateMessage,
  validateFeedback,
  handleValidationErrors
} from "./security";

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
      'audio/m4a', 'audio/mpga', 'audio/mp3'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.log(`Security: Rejected file upload with mime type: ${file.mimetype}`);
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  }
});

// Helper function to send message to Langchain API
async function sendMessageToLangchain(
  message: string,
  useWeb: boolean,
  useDb: boolean,
  selectedDb: string 
): Promise<string> {

  console.log(`Sending request to LangChain FastAPI: ${message}`);

  const response = await fetch("https://skapi-qkrap.ondigitalocean.app/chat", {
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
    chatRateLimit,
    validateMessage,
    handleValidationErrors,
    async (req: Request, res: Response) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const persistentSessionId = req.user!.email.split("@")[0];

      const result = chatRequestSchema.safeParse(req.body);
      if (!result.success) {
        console.error("Invalid request body:", result.error);
        return res.status(400).json({ error: "Invalid request data" });
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
        res.status(500).json({
          message: "Failed to process message",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  app.post("/api/suggest", apiRateLimit, suggestHandler);

  // Voice input endpoint - transcribes audio only with enhanced security
  app.post(
    "/api/voice/transcribe",
    uploadRateLimit,
    upload.single("audio"),
    async (req: Request, res: Response) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      if (!req.file) return res.status(400).json({ error: "No audio file uploaded" });

      try {
        console.log(`Security: Audio file upload from user ${req.user!.email}, size: ${req.file.size} bytes`);
        
        // Transcribe audio to text
        const transcribedText = await transcribeAudio(req.file.buffer);
        console.log("Transcribed text:", transcribedText);

        // Return only the transcript
        return res.status(200).json({ transcribedText });
      } catch (error) {
        console.error("Error processing voice input:", error);
        return res.status(500).json({
          message: "Failed to process voice input",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Text-to-speech endpoint with validation
  app.post("/api/voice/speech", 
    apiRateLimit,
    async (req: Request, res: Response) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      try {
        const { text, voiceId } = req.body;

        if (!text || typeof text !== 'string') {
          return res.status(400).json({ error: "Valid text is required" });
        }

        if (text.length > 10000) {
          return res.status(400).json({ error: "Text too long (max 10,000 characters)" });
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
        res.status(500).json({
          message: "Failed to stream speech",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  app.get("/api/messages/:sessionId", 
    apiRateLimit,
    async (req: Request, res: Response) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      try {
        // Use the persistent sessionId from user's email
        const persistentSessionId = req.user!.email.split('@')[0];

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
        res.status(500).json({
          message: "Failed to retrieve messages",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Delete all messages for a user's session
  app.delete("/api/messages/:sessionId", 
    apiRateLimit,
    async (req: Request, res: Response) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      try {
        // Use the persistent sessionId from user's email
        const persistentSessionId = req.user!.email.split('@')[0];

        await storage.deleteMessagesByUserAndSession(
          req.user!.id,
          persistentSessionId
        );

        console.log(`Deleted all messages for user ${req.user!.id} with sessionId ${persistentSessionId}`);
        res.status(200).json({ message: "Chat history deleted successfully" });
      } catch (error) {
        console.error("Error deleting messages:", error);
        res.status(500).json({
          message: "Failed to delete messages",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Submit feedback with validation
  app.post("/api/feedback", 
    apiRateLimit,
    validateFeedback,
    handleValidationErrors,
    async (req: Request, res: Response) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const result = insertFeedbackSchema.safeParse(req.body);
      if (!result.success) {
        console.error("Invalid feedback data:", result.error);
        return res.status(400).json({ error: "Invalid feedback data" });
      }

      try {
        // Get the user's persistent session ID
        const persistentSessionId = req.user!.email.split('@')[0];

        // Create feedback entry
        const feedback = await storage.createFeedback(req.user!.id, {
          ...result.data,
          sessionId: persistentSessionId, // Use the persistent session ID
        });

        console.log(`Feedback submitted for user ${req.user!.id}`);
        res.status(201).json(feedback);
      } catch (error) {
        console.error("Error saving feedback:", error);
        res.status(500).json({
          message: "Failed to save feedback",
          error: error instanceof Error ? error.message : "Unknown error",
        });
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
                sessionId: data.sessionId
              });
              console.log(`Registered WebSocket connection for user ${data.email}`);
            }

            // Send confirmation
            ws.send(JSON.stringify({ type: 'auth_success' }));
          }
        } else if (data.type === 'speech') {
          // Verify client is authenticated
          const clientIndex = voiceModeClients.findIndex(
            client => client.ws === ws
          );

          if (clientIndex === -1) {
            ws.send(JSON.stringify({
              type: 'error', 
              message: 'Not authenticated' 
            }));
            return;
          }

          const client = voiceModeClients[clientIndex];

          // Handle transcription
          if (data.audioData) {
            try {
              // Decode base64 audio data
              const buffer = Buffer.from(data.audioData, 'base64');

              // Transcribe audio
              console.log("Transcribing voice mode audio...");
              const transcribedText = await transcribeAudio(buffer);
              console.log("Voice mode transcribed text:", transcribedText);

              // Send transcription back to client
            ws.send(JSON.stringify({
                type: 'transcription', 
                text: transcribedText 
              }));

              // Process message with langchain
              const persistentSessionId = client.email.split('@')[0];

              // Create user message in database and keep a reference
              const userMessage = await storage.createMessage(client.userId, {
                content: transcribedText,
                isBot: false,
                sessionId: persistentSessionId,
                category: "SELF", // Default to SELF for voice messages
              });


              // Send to AI and get response
              console.log("Processing voice mode message with AI...");
              const formattedResponse = await sendMessageToLangchain(
                transcribedText,
                data.useweb ?? false,
                data.usedb ?? false,
                data.db ?? "files" 
              );

              // Create bot message in database - inherit category from user message
              const botMessage = await storage.createMessage(client.userId, {
                content: formattedResponse,
                isBot: true,
                sessionId: persistentSessionId,
                category: userMessage.category, // Bot message inherits the same category
              });

              // Send AI response to client
              ws.send(JSON.stringify({ 
                type: 'ai_response', 
                userMessage,
                message: botMessage 
              }));


              // Generate speech from AI response
              console.log("Generating speech for voice mode response...");
              try {
                const openaiResponse = await textToSpeechStream(formattedResponse);

                // Convert stream to buffer
                const chunks: Buffer[] = [];
                openaiResponse.data.on('data', (chunk: Buffer) => {
                  chunks.push(chunk);
                });

                openaiResponse.data.on('end', () => {
                  const audioBuffer = Buffer.concat(chunks);
                  const base64Audio = audioBuffer.toString('base64');

                  // Send audio to client
                  ws.send(JSON.stringify({ 
                    type: 'speech_response', 
                    audioData: base64Audio 
                  }));
                });

                openaiResponse.data.on('error', (err: Error) => {
                  console.error("Error streaming TTS:", err);
                  ws.send(JSON.stringify({ 
                    type: 'error', 
                    message: 'Failed to generate speech' 
                  }));
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
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format' 
        }));
      }
    });

    // Handle client disconnection
    ws.on('close', () => {
      console.log('WebSocket client disconnected');

      // Remove client from active connections
      const clientIndex = voiceModeClients.findIndex(client => client.ws === ws);
      if (clientIndex !== -1) {
        const client = voiceModeClients[clientIndex];
        console.log(`User ${client.email} disconnected from voice mode`);
        voiceModeClients.splice(clientIndex, 1);
      }
    });

    // Send initial connection acknowledgment
    ws.send(JSON.stringify({ type: 'connected' }));
    });

  return httpServer;
}