// src/jobs/lastWeekFaq.ts

import cron from 'node-cron';
import { generateAndSaveFaqSnapshot } from '../services/faqService';

/**
 * Schedules the weekly job at every Monday 00:00 in Asia/Tokyo.
 */
export function scheduleLastWeekFaqJob(): void {
  cron.schedule(
    '0 0 * * 1',
    async () => {
      console.log('[FAQ Job] Starting last-week snapshot');
      try {
        await generateAndSaveFaqSnapshot();
        console.log('[FAQ Job] Completed successfully');
      } catch (err) {
        console.error('[FAQ Job] Error:', err);
      }
    },
    {
      timezone: 'Asia/Tokyo',
    }
  );
}
