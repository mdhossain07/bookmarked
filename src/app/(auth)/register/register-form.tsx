"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, type RegisterRequest } from "@/shared";
import { FieldError } from "@/components/auth/FieldError";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errorMessage } from "@/lib/api";
import { register as registerUser } from "@/lib/auth-client";
import { authToasts } from "@/lib/toast-helpers";

export function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterRequest>({ resolver: zodResolver(RegisterSchema) });

  // D5: the API signs the new user in, so go straight to the dashboard.
  const onSubmit = async (data: RegisterRequest) => {
    try {
      await registerUser(data);
      authToasts.registerSuccess();
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      authToasts.registerError(errorMessage(error, "Registration failed. Please try again."));
    }
  };

  const describedBy = (field: keyof RegisterRequest) => (errors[field] ? `${field}-error` : undefined);

  return (
    <>
      <h1 className="text-2xl font-semibold">Create your library</h1>
      <p className="mt-1 text-muted-foreground">Track every book and movie in one calm place.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              autoComplete="given-name"
              className="h-11"
              aria-invalid={Boolean(errors.firstName)}
              aria-describedby={describedBy("firstName")}
              {...register("firstName")}
            />
            <FieldError id="firstName-error" message={errors.firstName?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">
              Last name <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="lastName"
              autoComplete="family-name"
              className="h-11"
              aria-invalid={Boolean(errors.lastName)}
              aria-describedby={describedBy("lastName")}
              {...register("lastName")}
            />
            <FieldError id="lastName-error" message={errors.lastName?.message} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="h-11"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("email")}
            {...register("email")}
          />
          <FieldError id="email-error" message={errors.email?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            className="h-11"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={describedBy("password") ?? "password-hint"}
            {...register("password")}
          />
          {errors.password ? (
            <FieldError id="password-error" message={errors.password.message} />
          ) : (
            <p id="password-hint" className="text-sm text-muted-foreground">
              At least 8 characters.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            className="h-11"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={describedBy("confirmPassword")}
            {...register("confirmPassword")}
          />
          <FieldError id="confirmPassword-error" message={errors.confirmPassword?.message} />
        </div>

        <Button type="submit" disabled={isSubmitting} className="h-11 w-full">
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
