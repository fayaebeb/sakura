import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertMessageSchema } from "@shared/schema";

const LANGFLOW_API = "https://sakurabotpckk-langflowsakura.hf.space/api/v1/run/ea69718c-2ffe-4eeb-917b-89850ed11bb8";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/chat", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    // Validate request data
    const result = insertMessageSchema.safeParse(req.body);
    if (!result.success) {
      console.error("Invalid request body:", result.error);
      return res.status(400).json({ error: "Invalid request data" });
    }

    const body = result.data; // Parsed input data

    try {
      // Store user message
      await storage.createMessage(req.user!.id, {
        ...body,
        isBot: false,
      });

      // Call Langflow API
      console.log(`Sending request to Langflow API: ${body.content}`);
      const response = await fetch(LANGFLOW_API, {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "Content-Type": "application/json",
          "x-api-key": "sk-8VZ0gMpAWDCihjjLMB8KCeQREgqe1GX2bjoaNYWGs6Q",
        },
        body: JSON.stringify({
          input_value: body.content,
          output_type: "chat",
          input_type: "chat",
          tweaks: {
            "TextInput-5f8Sb": {
              "input_value": body.sessionId,
            },
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Langflow API Error:", errorText);
        throw new Error(`Langflow API responded with status ${response.status}`);
      }

      const aiResponse = await response.json();
      console.log("Langflow API Response:", JSON.stringify(aiResponse, null, 2));

      // ✅ **Improved AI Response Handling**
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
        console.error("Unexpected AI Response Format:", JSON.stringify(aiResponse, null, 2));
        throw new Error("Could not extract message from AI response");
      }

      // Store bot message
      const botMessage = await storage.createMessage(req.user!.id, {
        content: aiOutputText,
        isBot: true,
        sessionId: body.sessionId,
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
      const messages = await storage.getMessagesByUserAndSession(
        req.user!.id,
        req.params.sessionId
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
