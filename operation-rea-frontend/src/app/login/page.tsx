"use client";

import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
    return (
        <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 md:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-xl border bg-card/50 backdrop-blur-sm p-8 md:p-10 shadow-xl">
                <div className="text-center space-y-3">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Welcome to Operation REA</h1>
                    <p className="text-muted-foreground text-base md:text-lg">Sign in to continue your journey</p>
                </div>

                <div className="py-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">Continue with</span>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={() => signIn("github", { callbackUrl: "/" })}
                    className="w-full flex items-center justify-center gap-3 py-6 text-base font-medium shadow-sm transition-all hover:shadow-md"
                    size="lg"
                >
                    <Github className="h-5 w-5 md:h-6 md:w-6" />
                    Sign in with GitHub
                </Button>
            </div>
        </div>
    );
} 