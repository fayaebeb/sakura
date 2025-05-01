import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertMessageSchema } from "@shared/schema";
import { transcribeAudio } from "./apis/openai";
import { textToSpeechStream } from "./apis/openaitts";
//import { textToSpeech } from "./apis/unrealspeech";
import multer from "multer";

const LANGFLOW_API = process.env.LANGFLOW_API;

// Setup multer for handling file uploads (in-memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper function to format the bot's response
// Updated, minimal formatting function
function formatBotResponse(text: string): string {
  return text.replace(/\\n/g, '\n').trim();
}

// Helper function to send message to Langflow API
async function sendMessageToLangflow(content: string, persistentSessionId: string) {
  console.log(`Sending request to Langflow API: ${content}`);
  const response = await fetch(LANGFLOW_API, {
    method: "POST",
    headers: {
      Authorization: process.env.AUTHORIZATION_TOKEN,
      "Content-Type": "application/json",
      "x-api-key": process.env.X_API_KEY,
    },
    body: JSON.stringify({
      input_value: content,
      output_type: "chat",
      input_type: "chat",
      tweaks: {
        "TextInput-DpRro": {
          input_value: persistentSessionId,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Langflow API Error:", errorText);
    throw new Error(
      `Langflow API responded with status ${response.status}`,
    );
  }

  const aiResponse = await response.json();
  console.log(
    "Langflow API Response:",
    JSON.stringify(aiResponse, null, 2),
  );

  let aiOutputText = null;

  if (aiResponse.outputs && Array.isArray(aiResponse.outputs)) {
    const firstOutput = aiResponse.outputs[0];
    if (firstOutput?.outputs?.[0]?.results?.message?.data?.text) {
      aiOutputText = firstOutput.outputs[0].results.message.data.text;
    } else if (firstOutput?.outputs?.[0]?.messages?.[0]?.message) {
      aiOutputText = firstOutput.outputs[0].messages[0].message;
    }
  }

  if (!aiOutputText) {
    console.error(
      "Unexpected AI Response Format:",
      JSON.stringify(aiResponse, null, 2),
    );
    throw new Error("Could not extract message from AI response");
  }

  return formatBotResponse(aiOutputText);
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Text-based chat endpoint
  app.post("/api/chat", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const persistentSessionId = req.user!.username.split("@")[0];

    const result = insertMessageSchema.safeParse(req.body);
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

      // Get response from Langflow
      const formattedResponse = await sendMessageToLangflow(body.content, persistentSessionId);

      const botMessage = await storage.createMessage(req.user!.id, {
        content: formattedResponse,
        isBot: true,
        sessionId: persistentSessionId,
      });

      res.json(botMessage);
    } catch (error) {
      console.error("Error in chat processing:", error);
      res.status(500).json({
        message: "Failed to process message",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Voice input endpoint - transcribes audio and processes as text
  // Voice input endpoint - transcribes audio only
  app.post(
    "/api/voice/transcribe",
    upload.single("audio"),
    async (req, res) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      if (!req.file) return res.status(400).json({ error: "No audio file uploaded" });

      try {
        // 1️⃣ transcribe audio to text
        console.log("Transcribing audio file...");
        const transcribedText = await transcribeAudio(req.file.buffer);
        console.log("Transcribed text:", transcribedText);

        // 2️⃣ return ONLY the transcript
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

  // Text-to-speech endpoint - converts bot response to speech
  app.post("/api/voice/speech", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { text, voiceId } = req.body;

      if (!text) {
        return res.status(400).json({ error: "No text provided" });
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
  });

  app.get("/api/messages/:sessionId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      // Use the persistent sessionId from user's email
      const persistentSessionId = req.user!.username.split('@')[0];
      
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
  });

  // Delete all messages for a user's session
  app.delete("/api/messages/:sessionId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      // Use the persistent sessionId from user's email
      const persistentSessionId = req.user!.username.split('@')[0];
      
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
  });

  const httpServer = createServer(app);
  return httpServer;
}