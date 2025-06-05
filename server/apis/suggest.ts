import type { Request, Response } from "express";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const suggestHandler = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Invalid or empty message." });
    }

    const prompt = `
You are an AI that suggests useful follow-up questions based on the user's message.
User said: "${message}"

Respond ONLY with a JSON array of 3 short follow-up messages.
Example: ["What is the difference?", "Can you show an example?", "How do I use it in code?"]
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const raw = completion.choices[0].message.content || "";

    let suggestions: string[] = [];

    // Try to extract the first valid JSON array from the response
    const jsonMatch = raw.match(/\[.*?\]/s);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          suggestions = parsed.map(item => String(item).trim()).slice(0, 3);
        }
      } catch (err) {
        console.error("JSON.parse failed:", err);
        return res.status(500).json({ error: "Failed to parse AI JSON output." });
      }
    } else {
      console.error("No valid JSON array found in OpenAI response:", raw);
      return res.status(500).json({ error: "AI response did not contain a valid JSON array." });
    }

    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error("Suggest handler error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};