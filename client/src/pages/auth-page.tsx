import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { insertUserSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";


export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [, setLocation] = useLocation();

  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (!user) {
    const onSubmit = form.handleSubmit((data) => {
      if (isLogin) {
        loginMutation.mutate(data);
      } else {
        registerMutation.mutate(data);
      }
    });

    return (
      <div className="min-h-screen flex flex-col md:grid md:grid-cols-2">
        {/* Bot Logo in Mobile View */}
        <div className="flex flex-col items-center justify-center p-8 md:hidden bg-[#f8eee2]">
          <img src="/images/slogo.png" alt="桜AI Logo" className="w-24 mb-4" />
          
          
        </div>

        {/* Authentication Card */}
        <div className="flex flex-col items-center justify-center p-8 bg-[#f7e6d5]">
          <img src="/images/pclogo.png" alt="Company Logo" className="w-32 mb-6" />
          <Card className="w-full max-w-md p-8 bg-[#fcf8f3]">
            <h1 className="text-3xl font-bold mb-8">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-[#16213e]"
                  disabled={loginMutation.isPending || registerMutation.isPending}
                >
                  {loginMutation.isPending || registerMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm "
              >
                {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Branding Section (Hidden in Mobile) */}
        <div className="hidden md:flex flex-col justify-center items-center p-8 bg-[#f8eee2] text-primary-foreground">
          <img src="/images/slogo.png" alt="桜AI Logo" className="w-40 mb-6" />
          <div className="max-w-md text-center">
            
            
          </div>
        </div>
      </div>
    );
  }

  return null;
}