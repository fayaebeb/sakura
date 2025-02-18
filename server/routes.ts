import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertMessageSchema } from "@shared/schema";
import { z } from "zod";

const LANGFLOW_API = "https://fayaebeb-langflow.hf.space/api/v1/run/08a09a5e-de43-44f7-bbb0-0f50a0fcf7d7";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/chat", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const body = insertMessageSchema.parse(req.body);
      
      // Store user message
      await storage.createMessage(req.user!.id, {
        ...body,
        isBot: false,
      });

      // Call Langflow API
      const response = await fetch(LANGFLOW_API, {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "Content-Type": "application/json",
          "x-api-key": "sk-QBuoI88mMiEVJH_nESwwmDyHlDRSr-cRN8-w6foiEhE"
        },
        body: JSON.stringify({
          input_value: body.content,
          output_type: "chat",
          input_type: "chat",
          tweaks: {
            "TextInput-nLYCj": {
              "input_value": body.sessionId
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const botResponse = await response.json();
      
      // Store bot message
      const botMessage = await storage.createMessage(req.user!.id, {
        content: botResponse.text || "Sorry, I couldn't process that.",
        isBot: true,
        sessionId: body.sessionId,
      });

      res.json(botMessage);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.get("/api/messages/:sessionId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const messages = await storage.getMessagesByUserAndSession(
      req.user!.id,
      req.params.sessionId
    );
    res.json(messages);
  });

  const httpServer = createServer(app);
  return httpServer;
}
