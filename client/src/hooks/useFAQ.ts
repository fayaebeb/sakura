// src/hooks/useFaqLastWeek.ts
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

import { useToast } from "@/hooks/use-toast";

/** A single FAQ entry returned by the endpoint */
export interface FaqItem {
  question: string;
  count: number;
}

/** Full payload returned by GET /api/faq/last-week */
export interface FaqLastWeekResponse {
  generatedAt: string;
  totalQuestions: number;
  trendText: string | null;
  faqs: FaqItem[];
}

/**
 * Hook to fetch the latest weekly FAQ snapshot.
 *
 * Usage:
 * ```tsx
 * const faqLastWeek = useFaqLastWeek();   // returns a mutation object
 *
 * useEffect(() => {
 *   faqLastWeek.mutate();                 // fire the request whenever you like
 * }, []);
 * ```
 */
export function useFaqLastWeek() {
  const { toast } = useToast();

  const fetchLastWeekFaqs = useMutation<FaqLastWeekResponse, Error, void>({
    mutationFn: async () => {
      const res = await apiRequest("GET", "/api/faq/last-week");

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "FAQ の取得に失敗しました。");
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "FAQ を取得しました",
        description: "最新の FAQ が利用可能です。",
      });
    },
    onError: (error) => {
      toast({
        title: "取得に失敗しました",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return fetchLastWeekFaqs;
}
