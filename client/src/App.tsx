import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import VoiceModePage from "@/pages/voice-mode-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { RecoilRoot } from "recoil";
import Tour from "./components/Tour";
import Testing from "./pages/testing";
import { useIsMobile } from "./hooks/use-mobile";
import InfoPage from "./pages/info-page";
import Settings from "./components/settings";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/info" component={InfoPage} />
      <ProtectedRoute path="/voice" component={VoiceModePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/test" component={Testing} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  //testing again
  useIsMobile();
  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <AuthProvider>
          <Tour />
          <Router />
          <Toaster />
          <Settings/>
        </AuthProvider>
      </RecoilRoot>
    </QueryClientProvider>
  );
}

export default App;
