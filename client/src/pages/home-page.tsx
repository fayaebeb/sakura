import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import ChatInterface from "@/components/chat-interface";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Company Logo */}
          <div className="flex items-center gap-3">
            <img
              src="../images/pclogo.png" // Replace with actual company logo path
              alt="Company Logo"
              className="h-10" // Adjust size as needed
            />
          </div>

          {/* 桜AI Branding */}
          <div className="flex items-center">
            <img
              src="../images/sklogo.png" // Replace with actual 桜AI logo path
              alt="桜AI Logo"
              className="h-8" // Adjust size as needed
            />
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.username}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <ChatInterface />
      </main>
    </div>
  );
}



