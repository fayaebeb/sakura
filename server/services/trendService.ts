// src/services/trendService.ts

import { openai } from 'server/apis/openAiClient';
import { ClusterResult } from './clusterService';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

export async function generateTrendAnalysis(
  clusters: ClusterResult[]
): Promise<string> {
  // 1) Build the top‐5 list from the refined FAQs
  const top5 = clusters.slice(0, 5)
    .map((c, i) => `${i + 1}. 「${c.question}」（${c.count}件）`)
    .join('\n');

  // 2) System prompt: focus purely on the FAQ trends
  const systemMsg: ChatCompletionMessageParam = {
    role: 'system',
    content: `
You are Sakura AI, the internal chatbot for Pacific Consultants Co., Ltd. (PCKK).
You will receive the top‐5 refined FAQ questions (in Japanese) along with their occurrence counts.
Based only on these, write 「質問傾向からわかるトレンドの考察」 in Japanese (~250 characters),
covering:
- 社内のニーズや課題
- 今後注力すべきテーマ
- 具体的なアクション提言
Respond with only the analysis text.
    `.trim(),
  };

  // 3) User prompt: supply the top‐5 FAQs
  const userMsg: ChatCompletionMessageParam = {
    role: 'user',
    content: `
以下は先週AIにより生成・精練された上位5つのFAQです：
${top5}

このデータをもとに「質問傾向からわかるトレンドの考察」を作成してください。
    `.trim(),
  };

  // 4) Call the model
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [systemMsg, userMsg],
    temperature: 0.5,
    top_p: 0.9,
    max_tokens: 400,
  });

  const content = resp.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error('OpenAI did not return any trend analysis');
  }

  return content.trim();
}
