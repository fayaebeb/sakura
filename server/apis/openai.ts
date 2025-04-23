import OpenAI from "openai";
import fs from "fs";
import path from "path";
import os from "os";

// Use environment variables for API keys
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
export const OPENAI_MODEL = "gpt-4o";

// Function to transcribe audio using OpenAI's Whisper model
export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  try {
    console.log(`Transcribing audio of size ${audioBuffer.byteLength} bytes`);
    
    // Create a temporary file to store the audio data
    const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.webm`);
    fs.writeFileSync(tempFilePath, audioBuffer);
    
    // OpenAI Node.js SDK expects a ReadStream for file uploads
    const fileStream = fs.createReadStream(tempFilePath);
    
    // Use the file stream with OpenAI's API
    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: "whisper-1",
    });
    
    // Clean up the temporary file when done
    fs.unlinkSync(tempFilePath);

    console.log(`Transcription result: ${transcription.text}`);
    return transcription.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}