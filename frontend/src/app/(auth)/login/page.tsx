import { LoginForm } from "./login-form";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login | UBID Portal",
  description: "Secure login for the UBID Government Portal",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground px-4">
      <div className="absolute top-8 left-8">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            U
          </div>
          <span>UBID</span>
        </div>
      </div>
      <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
