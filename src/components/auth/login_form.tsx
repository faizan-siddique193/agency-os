"use client";
import * as React from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle } from "lucide-react";
import { Controller } from "react-hook-form";
import { useEmailLogin } from "./use_email_login";

function LoginForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [emailSent, setEmailSent] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState("");

  const { control, handleSubmit } = useEmailLogin();

  //  submit handler
  const onSubmit = async (data: { email: string }) => {
    setIsLoading(true);

    try {
      const result = await signIn("email", {
        email: data.email,
        redirect: false,
      });

      if (result?.error) {
        alert("Something went wrong. Please try again.");
      } else {
        setSubmittedEmail(data.email);
        setEmailSent(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Google handler
  const onGoogleSignIn = () => {
    setIsGoogleLoading(true);
    signIn("google", { callbackUrl: "/dashboard" });
  };

  // Success UI State
  if (emailSent) {
    return (
      <div className="w-full max-w-sm space-y-4 p-6 rounded-md bg-green-50/50 border border-green-200 text-center">
        <h3 className="text-lg font-semibold tracking-tight text-green-900">Check your email</h3>
        <p className="text-sm text-green-700">
          We sent a secure magic link to <br /><strong className="text-green-900">{submittedEmail}</strong>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold tracking-tight">
          Sign in to your workspace
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter your email below to securely log in. No passwords required.
        </p>
      </div>

      <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <div className="space-y-2">
              <Input
                {...field}
                type="email"
                placeholder="m@example.com"
                disabled={isLoading || isGoogleLoading}
                className="h-11"
              />

              {fieldState.error && (
                <p className="text-sm text-red-500 font-medium">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
        
        {/* 4. Added the Submit Button INSIDE the form */}
        <Button
          type="submit"
          className="h-11 w-full"
          disabled={isLoading || isGoogleLoading}
        >
          {isLoading ? (
            <>
              <LoaderCircle className="size-4 animate-spin mr-2" />
              <span>Sending link...</span>
            </>
          ) : (
             "Continue with Email"
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full"
        onClick={onGoogleSignIn}
        disabled={isLoading || isGoogleLoading}
      >
        {isGoogleLoading ? (
          <>
            <LoaderCircle className="size-4 animate-spin mr-2" />
            <span>Connecting Google...</span>
          </>
        ) : (
          <>
            <svg className="mr-2 size-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            <span> Google</span>
          </>
        )}
      </Button>
    </div>
  );
}

export default LoginForm;