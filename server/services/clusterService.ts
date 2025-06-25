// src/services/clusterService.ts

import { openai } from 'server/apis/openAiClient';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

/** Raw user question plus optional AI reply (extra context) */
export interface RawQuestion {
  question: string;
  ts: Date;
  context?: string;
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
 * Auto-filter raw questions via LLM: keeps only valid standalone questions.
 */
async function autoFilterQuestions(raw: RawQuestion[]): Promise<RawQuestion[]> {
  if (raw.length === 0) return [];
  const list = raw.map((r, i) => `- #${i}: ${r.question.replace(/\n/g, ' ')}`).join('\n');

  const systemMsg: ChatCompletionMessageParam = {
    role: 'system',
    content: `
You are a data-cleaning assistant.
I will give you a list of user messages.
Decide if each one is a real, standalone question suitable for an FAQ.

Return ONLY a JSON object with two arrays:
{
  "valid":   [/* indexes to keep */],
  "invalid": [/* indexes to drop */]
}
`.trim(),
  };

  const userMsg: ChatCompletionMessageParam = {
    role: 'user',
    content: `
Here are the user messages:

${list}

Return only the JSON object.
`.trim(),
  };

  const chat = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    max_tokens: 300,
    messages: [systemMsg, userMsg],
  });

  const text = chat.choices?.[0]?.message?.content || '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Bad filter response:\n${text}`);

  const { valid } = JSON.parse(match[0]) as { valid: number[]; invalid: number[] };
  return valid.map(i => raw[i]);
}

/**
 * Cluster raw Q&A pairs into as many intents as needed and return refined FAQs.
 */
export async function clusterAndRefine(raw: RawQuestion[]): Promise<ClusterResult[]> {
  if (raw.length === 0) return [];

  // 0) Auto-filter raw questions
  let dataset = await autoFilterQuestions(raw);
  if (dataset.length === 0) return [];

  let finalClusters: ClusterResult[] = [];
  const MAX_ATTEMPTS = 2;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // 1) Generate initial clusters
    const initial = await generateInitialClusters(dataset);

    // 2) Validate clusters via LLM
    const validated = await validateQuestionSet(initial);

    // 3) Post-process: drop empty or mismatched clusters, dedupe
    const cleaned = validated
      .filter(c => c.members.length > 0 && c.count === c.members.length)
      .filter((c, i, arr) => arr.findIndex(d => d.question === c.question) === i);

    if (cleaned.length > 0) {
      finalClusters = cleaned;
      break;
    }

    // 4) Retry auto-filter on dataset
    dataset = await autoFilterQuestions(dataset);
    if (dataset.length === 0) break;
  }

  return finalClusters;
}

/**
 * Generate initial clusters via GPT, returning raw ClusterResult[].
 */
async function generateInitialClusters(raw: RawQuestion[]): Promise<ClusterResult[]> {
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

  const systemMsg: ChatCompletionMessageParam = {
    role: 'system',
    content: `
You are Sakura AI, the internal AI assistant for Pacific Consultants Co. Ltd. (PCKK).

You will receive a list of ${raw.length} user questions (with optional AI responses for context).

**Your tasks**
1. Clean each question (remove greetings, fillers, typos).
2. Cluster into logical intents; every question must belong to exactly one intent.
3. For each intent, craft a clear, polite Japanese FAQ (≤80 chars).
4. Provide index numbers (0-based) of all questions for that intent.
5. Count how many questions were assigned; must match index list length.
6. Ensure sum of counts equals ${raw.length}.

Return ONLY a JSON array sorted by count desc, objects with keys:
{
  "question": "<FAQ>",
  "count":   <int>,
  "members": [<int>,…]
}
`.trim(),
  };

  const userMsg: ChatCompletionMessageParam = {
    role: 'user',
    content: `
Here are the user questions (with optional AI replies):
${list}

Return only the JSON array.
`.trim(),
  };

  const chat = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    max_tokens: 1500,
    messages: [systemMsg, userMsg],
  });

  const text = chat.choices?.[0]?.message?.content;
  if (!text) throw new Error('No response from LLM when refining FAQs');
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error(`Failed to find JSON array in LLM response:\n${text}`);

  let parsed: unknown;
  try { parsed = JSON.parse(match[0]); } catch {
    throw new Error(`Invalid JSON from LLM:\n${match[0]}`);
  }
  if (!Array.isArray(parsed)) throw new Error('Expected a JSON array from LLM');

  return (parsed as any[])
    .filter(it => typeof it === 'object' && it !== null && typeof it.question === 'string' && typeof it.count === 'number' && Array.isArray(it.members))
    .map(it => ({ question: (it.question as string).trim(), count: it.count as number, members: (it.members as number[]).map(Number) }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Validate final FAQ clusters via LLM, returning only valid ones.
 */
async function validateQuestionSet(clusters: ClusterResult[]): Promise<ClusterResult[]> {
  if (clusters.length === 0) return [];

  const validationPrompt = clusters.map((c, i) => `- #${i}: ${c.question}`).join('\n');

  const systemMsg: ChatCompletionMessageParam = {
    role: 'system',
    content: `
You are a quality-control assistant for a Japanese FAQ bot.
Given a list of FAQ questions, identify which are valid, useful, and intelligible,
not nonsensical or filler.

Return ONLY a JSON array of valid indexes: [0,2,3,...]
`.trim(),
  };

  const userMsg: ChatCompletionMessageParam = { role: 'user', content: validationPrompt };

  const chat = await openai.chat.completions.create({ model: 'gpt-4o-mini', temperature: 0, max_tokens: 500, messages: [systemMsg, userMsg] });
  const text = chat.choices?.[0]?.message?.content || '';
  const match = text.match(/\[[\s\d,]*\]/);
  if (!match) throw new Error(`Failed to find valid JSON array of indexes:\n${text}`);

  const indexes: number[] = JSON.parse(match[0]);
  return indexes.map(i => clusters[i]);
}
