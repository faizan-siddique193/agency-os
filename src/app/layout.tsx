import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Initialize the Inter font
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgencyOS | Total Clarity",
  description: "Enterprise-grade agency management platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Inject the font into the HTML body
    <html lang="en">
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}