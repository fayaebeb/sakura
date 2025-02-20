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
  <div className="container mx-auto px-4 py-2 flex justify-between items-center">
    {/* Company Logo (Smaller on Mobile) */}
    <div className="flex items-center">
      <img src="/images/pclogo.png" alt="Company Logo" className="h-5 sm:h-10" />
    </div>

    {/* AI Brand Logo (Same for All Screens) */}
    <div className="flex items-center">
      <img src="/images/slogo.png" alt="桜AI ロゴ" className="h-16 sm:h-24 w-auto" />
    </div>

    {/* User Info & Logout (Username Hidden on Mobile) */}
    <div className="flex items-center gap-3">
      <span className="hidden sm:inline text-sm font-bold text-gray-700">{displayName}</span>
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
