import OpenAI from "openai";
import fs from "fs";
import path from "path";
import os from "os";

// Use environment variables for API keys
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Use GPT-4o for text generation
export const OPENAI_MODEL = "gpt-4o";

// The transcription model to use for audio-to-text
export const TRANSCRIPTION_MODEL = "gpt-4o-mini-transcribe";

/**
 * Transcribes audio using OpenAI's transcription API (gpt-4o-mini-transcribe).
 * Supports audio formats: mp3, mp4, mpeg, mpga, m4a, wav, and webm (must be under 25 MB).
 *
 * @param audioBuffer - Audio data in Buffer format.
 * @returns The transcribed text.
 */
export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.webm`);

  try {
    console.log(`Transcribing audio of size ${audioBuffer.byteLength} bytes`);

    fs.writeFileSync(tempFilePath, audioBuffer);
    const fileStream = fs.createReadStream(tempFilePath);

    const transcriptionText = await openai.audio.transcriptions.create({
      file: fileStream,
      model: TRANSCRIPTION_MODEL,
      response_format: "text", // returns raw string, not an object
    });

    // Now `transcriptionText` is a plain string
    console.log(`Transcription result: ${transcriptionText}`);
    return transcriptionText;

  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // Clean up temporary file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
}
