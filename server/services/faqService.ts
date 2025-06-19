// src/services/faqService.ts

import { and, eq, gte, lte } from 'drizzle-orm';
import { db } from '../db';
import { getLastWeekWindow } from '../utils/time';
import { clusterAndRefine, RawQuestion } from './clusterService';
import { generateTrendAnalysis } from './trendService';
import { faqItems, faqSnapshots, messages } from '@shared/schema';

export async function generateAndSaveFaqSnapshot(): Promise<void> {
  // 1) Compute last-week window
  const { from, to } = getLastWeekWindow();

  // 2) Fetch all messages (user & bot) in that window, ordered by time
  const allMsgs = await db
    .select({
      content: messages.content,
      ts: messages.timestamp,
      isBot: messages.isBot,
    })
    .from(messages)
    .where(
      and(
        gte(messages.timestamp, from),
        lte(messages.timestamp, to),
      )
    )
    .orderBy(messages.timestamp);

  // 3) Pair each user question (isBot = false) with the very next bot reply (isBot = true)
  const raw: RawQuestion[] = [];
  for (let i = 0; i < allMsgs.length; i++) {
    const msg = allMsgs[i];
    // only user messages
    if (msg.isBot === false) {
      const question = msg.content.trim();
      if (
        question.length <= 3 ||
        /^(hi|hello|thanks?|おはよう|こんにちは|ありがとう)$/i.test(question)
      ) {
        continue;
      }
      // find next AI reply
      let context: string | undefined;
      const next = allMsgs[i + 1];
      if (next && next.isBot === true) {
        context = next.content.trim();
      }
      raw.push({ question, ts: msg.ts, context });
    }
  }

  // 4) Total user questions
  const totalQuestions = raw.length;

  // 5) Generate FAQs by grouping/counting only on the user questions
  const clusters = await clusterAndRefine(raw);

  console.log(clusters)

  // 6) Trend analysis
  const trendText = await generateTrendAnalysis(clusters);

  // 7) Persist snapshot
  const [snapshot] = await db
    .insert(faqSnapshots)
    .values({ trendText, totalQuestions })
    .returning();

  // 8) Persist each FAQ item
  await Promise.all(
    clusters.map(({ question, count }) =>
      db.insert(faqItems).values({
        snapshotId: snapshot.id,
        question,
        count,
      })
    )
  );
}
