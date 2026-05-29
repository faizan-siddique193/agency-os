import Image from "next/image";
import { Star } from "lucide-react";

function MarketingSidebar() {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-primary p-10 py-12 text-primary-foreground">
      {/* Top: Logo & Copy */}
      <div className="shrink-0 relative z-10">
        <div className="text-xl font-bold tracking-tight">AgencyOS</div>
        <div className="mt-12 space-y-4 max-w-lg">
          <h1 className="text-4xl font-bold leading-tight tracking-tight lg:text-5xl">
            Run your agency
            <br />
            with total clarity.
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-primary-foreground/80">
            Streamline operations, boost team productivity, and gain
            unprecedented visibility into your projects.
          </p>
        </div>
      </div>

      {/* Middle: Image Mock Representation */}
      <div className="relative flex-1 flex items-center justify-center min-h-75 my-4">
        <div className="relative w-full max-w-xl xl:max-w-2xl">
          <Image
            src="/3d_dashboard_passwordless_screen.png"
            alt="Dashboard Component Preview"
            width={1200}
            height={900}
            className="w-full h-auto object-contain drop-shadow-2xl rounded-lg ring-1 ring-primary-foreground/10"
            priority
          />
        </div>
      </div>

      {/* Bottom: Testimonial */}
      <div className="shrink-0 relative z-10 max-w-md">
        <blockquote className="space-y-4">
          <div className="flex gap-1 text-primary-foreground">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="size-4 fill-primary-foreground"
                strokeWidth={1}
              />
            ))}
          </div>

          <p className="text-sm font-medium italic leading-relaxed text-primary-foreground/90">
            &ldquo;Built to help modern agencies streamline operations, improve
            team visibility, and scale with confidence.&rdquo;
          </p>

          <footer className="space-y-1">
            <p className="text-xs font-semibold tracking-wide text-primary-foreground/80">
              Enterprise-grade workflow infrastructure
            </p>

            <p className="text-[11px] text-primary-foreground/60">
              Secure • Scalable • Designed for high-performing teams
            </p>
          </footer>
        </blockquote>
      </div>
    </div>
  );
}

export default MarketingSidebar;
