// src/hooks/useOnboarding.ts
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";

import { useToast } from "@/hooks/use-toast";

export function useOnboarding() {
    const { toast } = useToast();

    const completeOnboarding = useMutation<void, Error, void>({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/onboarding/complete");
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "オンボーディング完了の更新に失敗しました。");
            }
        },
        onSuccess: () => {
            toast({
                title: "オンボーディング完了",
                description: "お疲れさまでした！",
            });
        },
        onError: (error) => {
            toast({
                title: "更新に失敗しました",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    return completeOnboarding;
}
