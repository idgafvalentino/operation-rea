"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Github, LogOut } from "lucide-react";

export function Header() {
    const { data: session, status } = useSession();
    const isLoading = status === "loading";

    return (
        <header className="sticky top-0 bg-background/90 backdrop-blur-sm z-50 border-b border-border/40 shadow-sm">
            <div className="container flex h-16 md:h-20 items-center justify-between px-4 md:px-6 lg:px-8 mx-auto">
                <Link href="/" className="font-bold text-xl md:text-2xl tracking-tight hover:text-primary/90 transition-colors">
                    Operation REA
                </Link>

                <nav className="flex items-center gap-4 md:gap-6">
                    {isLoading ? (
                        <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
                    ) : session ? (
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="flex items-center gap-3">
                                {session.user?.image && (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || "User"}
                                        className="h-8 w-8 md:h-10 md:w-10 rounded-full ring-2 ring-primary/10"
                                    />
                                )}
                                <span className="text-sm md:text-base font-medium hidden sm:inline-block">
                                    {session.user?.name}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => signOut()}
                                title="Sign out"
                                className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={() => signIn("github")}
                            className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                            <Github className="h-4 w-4" />
                            <span className="font-medium">Sign In</span>
                        </Button>
                    )}
                </nav>
            </div>
        </header>
    );
} 