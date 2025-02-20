import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import ChatInterface from "@/components/chat-interface";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  // Extract username before '@' from email
  const displayName = user?.username?.split("@")[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#f7e6d5]">
      {/* ヘッダーセクション */}
      <header className="border-b bg-[#f8eee2] shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* 会社ロゴ */}
          <div className="flex items-center gap-3">
            <img
              src="/images/pclogo.png"
              alt="会社ロゴ"
              className="h-10"
            />
          </div>

          {/* 桜AI ブランドロゴ */}
          <div className="flex items-center">
            <img
              src="/images/slogo.png"
              alt="桜AI ロゴ"
              className="h-24 w-auto"
            />
          </div>

          {/* ユーザー情報 & ログアウト */}
          <div className="flex items-center gap-5">
            <span className="text-sm font-bold text-gray-700">{displayName}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      {/* チャットインターフェースセクション */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-4 max-w-3xl mx-auto">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}
