"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authToasts } from "@/lib/toast-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Book, Eye, EyeOff } from "lucide-react";
import { LoginSchema, type LoginRequest } from "@/shared";
import { login } from "@/lib/auth-client";
import { errorMessage } from "@/lib/api";

/** @param from - where to go after sign-in; the page passes only same-site paths */
export function LoginForm({ from }: { from: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginRequest) => {
    try {
      await login(data);
      authToasts.loginSuccess();
      router.replace(from);
      router.refresh();
    } catch (error) {
      authToasts.loginError(errorMessage(error, "Login failed. Please try again."));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Book className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Bookmarked
          </h1>
          <p className="text-muted-foreground mt-2">
            Your personal media library awaits
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* {loginError && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
                  {loginError}
                </div>
              )} */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="h-12 border-border focus:border-ring transition-colors"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="h-12 pr-12 border-border focus:border-ring transition-colors"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold"
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-foreground hover:underline font-semibold"
                >
                  Create one here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Bookmarked. Track your reading and watching journey.</p>
        </div>
      </div>
    </div>
  );
}
