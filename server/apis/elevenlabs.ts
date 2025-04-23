import { ElevenLabsClient } from "elevenlabs";
import { Readable } from "stream";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// Initialize ElevenLabs client
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

/**
 * Converts either a Node.js or Web ReadableStream into a Buffer.
 * @param stream The stream returned by the ElevenLabs SDK
 */
async function streamToBuffer(stream: any): Promise<Buffer> {
  // Case: SDK returned a Web ReadableStream
  if (typeof stream.getReader === "function") {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  }

  // Case: SDK returned a Node.js Readable stream
  if (typeof stream.on === "function") {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk: Buffer) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", reject);
    });
  }

  throw new Error("Unsupported stream format from ElevenLabs SDK.");
}

/**
 * Converts text to speech using ElevenLabs API
 * @param text The text to convert
 * @param voiceId Voice ID to use (defaults to Rachel)
 * @returns Audio buffer (MP3)
 */
export async function textToSpeech(
  text: string,
  voiceId: string = DEFAULT_VOICE_ID
): Promise<Buffer> {
  try {
    // Extract only content before "### 社内文書情報:"
    const delimiter = "### 社内文書情報:";
    const filteredText = text.includes(delimiter)
      ? text.split(delimiter)[0].trim()
      : text;

    if (!filteredText) {
      throw new Error("Input text does not contain any content to speak.");
    }

    const stream = await elevenlabs.textToSpeech.convert(voiceId, {
      text: filteredText,
      model_id: "eleven_multilingual_v2",
      output_format: "mp3_44100_128",
      voice_settings: {
        stability: 0.7,
        similarity_boost: 0.7,
      },
    });

    const buffer = await streamToBuffer(stream);
    console.log(`Generated audio buffer: ${buffer.byteLength} bytes`);
    return buffer;
  } catch (error) {
    console.error("TTS generation error:", error);
    throw new Error(
      `Failed to generate speech: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
