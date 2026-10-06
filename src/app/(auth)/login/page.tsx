import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

/** Only same-site paths: `//evil.example` is a protocol-relative URL to another site. */
function safeRedirect(from: string | string[] | undefined): string {
  return typeof from === "string" && from.startsWith("/") && !from.startsWith("//") ? from : "/dashboard";
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { from } = await searchParams;
  return <LoginForm from={safeRedirect(from)} />;
}
