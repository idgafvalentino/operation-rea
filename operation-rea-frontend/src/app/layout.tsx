import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Operation REA",
  description: "Reasoning engine accelerator tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t py-6 md:py-8">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} Operation REA. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Privacy
                  </a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Terms
                  </a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
