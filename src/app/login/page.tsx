import LoginForm from "@/components/auth/login_form";
import MarketingSidebar from "@/components/auth/login_screen_sidebar";
export default function LoginPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 bg-background">
      <MarketingSidebar />

      {/* Right Column: Authentication Form Container */}
      <div className="relative flex flex-col items-center justify-center bg-background px-8 py-12 lg:px-16 overflow-y-auto">
        <LoginForm />

        <p className="mt-10 w-full max-w-sm text-center text-sm text-muted-foreground">
          Need access?{" "}
          <a
            href="#"
            className="font-medium underline-offset-4 hover:underline"
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
