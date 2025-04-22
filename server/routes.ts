import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertMessageSchema } from "@shared/schema";

const LANGFLOW_API = process.env.LANGFLOW_API;

// Helper function to format the bot's response
// Updated, minimal formatting function
function formatBotResponse(text: string): string {
  return text.replace(/\\n/g, '\n').trim();
}


export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

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

      console.log(`Sending request to Langflow API: ${body.content}`);
      const response = await fetch(LANGFLOW_API, {
        method: "POST",
        headers: {
          Authorization: process.env.AUTHORIZATION_TOKEN,
                "Content-Type": "application/json",
                "x-api-key": process.env.X_API_KEY,
        },
        body: JSON.stringify({
          input_value: body.content,
          output_type: "chat",
          input_type: "chat",
          tweaks: {
            "TextInput-nni38": {
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

      // Format the bot's response before storing it
      const formattedResponse = formatBotResponse(aiOutputText);

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

  const httpServer = createServer(app);
  return httpServer;
}