// src/services/clusterService.ts

import { openai } from 'server/apis/openAiClient';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

/** Raw user question plus optional AI reply (extra context) */
export interface RawQuestion {
  question: string;
  ts: Date;
  context?: string;      // the bot’s answer that followed the question
}

/** One clustered / refined FAQ item */
export interface ClusterResult {
  /** Final Japanese FAQ wording (≤80 chars, polite) */
  question: string;
  /** How many raw questions were merged into this intent */
  count: number;
  /** 0-based indexes of the raw array belonging to this intent */
  members: number[];
}

/**
 * Cluster raw Q&A pairs into as many intents as needed and return refined FAQs.
 * Each input question is assigned to exactly one intent.
 */
export async function clusterAndRefine(
  raw: RawQuestion[],
): Promise<ClusterResult[]> {
  if (raw.length === 0) return [];

  /* ------------------------------------------------------------------ *
   * 1) Build the prompt material: bullet list of Q&A pairs
   * ------------------------------------------------------------------ */
  const list = raw
    .map((r, i) => {
      const q = r.question.replace(/\n/g, ' ');
      if (r.context) {
        const a = r.context.replace(/\n/g, ' ');
        return `- #${i}: 質問: ${q}\n  回答: ${a}`;
      }
      return `- #${i}: 質問: ${q}`;
    })
    .join('\n');

  /* ------------------------------------------------------------------ *
   * 2) System prompt – generate as many intents as required
   * ------------------------------------------------------------------ */
  const systemMsg: ChatCompletionMessageParam = {
    role: 'system',
    content: `
You are Sakura AI, the internal AI assistant for Pacific Consultants Co. Ltd. (PCKK).

You will receive a list of ${raw.length} user questions (with optional AI responses for context).

**Your tasks**

1. Clean each question (remove greetings, fillers, typos).
2. Cluster the questions and AI responses (use as context) into logical intents; every question must belong to exactly one intent.
3. For each intent, craft a clear, polite Japanese FAQ (≤80 characters).
4. Provide the index numbers (0-based, as shown in the list) of all questions assigned to that intent.
5. Count how many questions were assigned; this must equal the length of the index list.
6. Check that the **sum of all counts equals ${raw.length}**.

**Return ONLY** a JSON array (sorted by count desc).  
Each object MUST have exactly the following keys:

{
  "question": "<refined FAQ in Japanese>",
  "count":   <integer>,
  "members": [<int>, <int>, …]   // 0-based indexes of input questions
}
    `.trim(),
  };

  /* ------------------------------------------------------------------ *
   * 3) User prompt – inject the Q&A material
   * ------------------------------------------------------------------ */
  const userMsg: ChatCompletionMessageParam = {
    role: 'user',
    content: `
Here are the user questions (with optional AI replies):

${list}

Please follow the instructions above and return only the JSON array.
    `.trim(),
  };

  /* ------------------------------------------------------------------ *
   * 4) Call the model
   * ------------------------------------------------------------------ */
  const chat = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [systemMsg, userMsg],
    temperature: 0.3,
    max_tokens: 1500,
  });

  const text = chat.choices?.[0]?.message?.content;
  if (!text) throw new Error('No response from LLM when refining FAQs');

  /* ------------------------------------------------------------------ *
   * 5) Extract & parse the JSON payload
   * ------------------------------------------------------------------ */
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error(`Failed to find JSON array in LLM response:\n${text}`);

  let parsed: unknown;
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    throw new Error(`Invalid JSON from LLM:\n${match[0]}`);
  }
  if (!Array.isArray(parsed)) throw new Error('Expected a JSON array from LLM');

  /* ------------------------------------------------------------------ *
   * 6) Type-guard, map & sort (defensive)
   * ------------------------------------------------------------------ */
  const clusters: ClusterResult[] = (parsed as any[])
    .filter(
      (it) =>
        typeof it === 'object' &&
        it !== null &&
        typeof it.question === 'string' &&
        typeof it.count === 'number' &&
        Array.isArray(it.members),
    )
    .map((it) => ({
      question: (it.question as string).trim(),
      count: it.count as number,
      members: (it.members as number[]).map(Number),
    }))
    .sort((a, b) => b.count - a.count);

  /* ------------------------------------------------------------------ *
   * 7) Final sanity-check: counts must add up
   * ------------------------------------------------------------------ */
  return clusters;
}
