import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState<number | null>(null);

  // Get session ID from local storage
  const getSessionId = () => {
    if (!user?.id) return "";
    const storageKey = `chat_session_id_user_${user.id}`;
    return localStorage.getItem(storageKey) || "";
  };

  const feedbackMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("ユーザー情報が見つかりません。");
      }
      
      const sessionId = getSessionId();
      if (!sessionId) {
        throw new Error("セッションIDが見つかりません。");
      }
      
      // Note: messageId is optional in this implementation
      const payload = {
        comment,
        rating,
        sessionId,
      };

      const res = await apiRequest("POST", `/api/feedback`, payload);
      if (!res.ok) {
        const errorText = await res.text().catch(() => "Unknown error");
        throw new Error(`Failed to submit feedback: ${res.status} ${errorText}`);
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "フィードバック送信完了",
        description: "フィードバックをお送りいただきありがとうございます。",
        duration: 3000,
      });
      
      // Reset the form and close the dialog
      setComment("");
      setRating(null);
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "送信エラー",
        description: error instanceof Error ? error.message : "フィードバックの送信に失敗しました。",
        variant: "destructive",
        duration: 4000,
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    feedbackMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-auto max-w-[95%] bg-white p-6 rounded-xl border border-pink-100">
        <DialogHeader>
          <DialogTitle className="text-pink-600 text-xl">フィードバックをお聞かせください</DialogTitle>
          <DialogDescription className="text-pink-400/80">
            サービス向上のため、ご意見・ご感想をお聞かせください。
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Rating Stars */}
          <div className="space-y-2">
            <Label htmlFor="rating" className="text-pink-600">評価</Label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`hover:bg-pink-50 p-1 ${rating && rating >= value ? "text-yellow-400" : "text-gray-300"}`}
                  onClick={() => setRating(value)}
                >
                  <Star className="h-6 w-6" fill={rating && rating >= value ? "currentColor" : "none"} />
                </Button>
              ))}
            </div>
          </div>
          
          {/* Comment Textarea */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-pink-600">コメント</Label>
            <Textarea
              id="comment"
              placeholder="ご意見・ご感想をお聞かせください..."
              className="min-h-[100px] border-pink-200 focus:border-pink-400 focus:ring-pink-400"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="mt-4 border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={feedbackMutation.isPending || (!comment && rating === null)}
              className="mt-4 bg-pink-500 hover:bg-pink-600 text-white border border-pink-400"
            >
              送信
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}