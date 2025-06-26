// src/services/faqService.ts

import { and, gte, lte, desc, count as countFn } from 'drizzle-orm';
import { db } from '../db';
import { getLastWeekWindow } from '../utils/time';
import { clusterAndRefine, RawQuestion } from './clusterService';
import { generateTrendAnalysis } from './trendService';
import { faqItems, faqSnapshots, messages } from '@shared/schema';

/**
 * Fetches either last-week’s messages (if ≥50) or the latest 50 messages,
 * then extracts user questions, clusters & validates them, and persists.
 */

export async function generateAndSaveFaqSnapshot(): Promise<void> {
  const { from, to } = getLastWeekWindow();

  // 1) Count last-week messages
  const [{ count: lastWeekCount }] = await db
    .select({ count: countFn(messages.id) })
    .from(messages)
    .where(and(gte(messages.timestamp, from), lte(messages.timestamp, to)));

  // 2) Fetch messages by rule
  let allMsgs = [];
  if (Number(lastWeekCount) < 50) {
    console.log(`[FAQ Snapshot] ${lastWeekCount} messages last week; fetching latest 50 overall.`);
    allMsgs = await db
      .select({
        content: messages.content,
        ts:      messages.timestamp,
        isBot:   messages.isBot,
      })
      .from(messages)
      .orderBy(desc(messages.timestamp))
      .limit(50);
    allMsgs.reverse();
  } else {
    console.log(`[FAQ Snapshot] ${lastWeekCount} messages last week; using last-week window.`);
    allMsgs = await db
      .select({
        content: messages.content,
        ts:      messages.timestamp,
        isBot:   messages.isBot,
      })
      .from(messages)
      .where(and(gte(messages.timestamp, from), lte(messages.timestamp, to)))
      .orderBy(messages.timestamp);
  }

  // 3) Extract user questions + optional next-bot context
  const raw: RawQuestion[] = [];
  for (let i = 0; i < allMsgs.length; i++) {
    const msg = allMsgs[i];
    if (!msg.isBot) {
      const question = msg.content.trim();
      let context: string | undefined;
      const next = allMsgs[i + 1];
      if (next?.isBot) context = next.content.trim();
      raw.push({ question, ts: msg.ts, context });
    }
  }

  const totalQuestions = raw.length;
  console.log(`[FAQ Snapshot] Collected ${totalQuestions} raw questions.`);
  if (totalQuestions === 0) return;

  // 4) Cluster & refine (includes auto-filter + validation)
  const clusters = await clusterAndRefine(raw);
  console.log(`[FAQ Snapshot] Generated ${clusters.length} clusters.`);
  if (clusters.length === 0) return;

  // 5) Persist snapshot + items
  const trendText = await generateTrendAnalysis(clusters);
  const [snapshot] = await db
    .insert(faqSnapshots)
    .values({ trendText, totalQuestions })
    .returning();

  await Promise.all(
    clusters.map(({ question, count }) =>
      db.insert(faqItems).values({ snapshotId: snapshot.id, question, count })
    )
  );

  console.log(`[FAQ Snapshot] Saved snapshot ${snapshot.id} with ${clusters.length} FAQ items.`);
}
