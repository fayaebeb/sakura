// src/utils/openaiClient.ts

import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY in environment');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
