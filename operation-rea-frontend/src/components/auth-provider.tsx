"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
    return (
        <SessionProvider
            // Force re-fetch session on client mount to ensure we always have latest data
            refetchInterval={0}
            refetchOnWindowFocus={true}
        >
            {children}
        </SessionProvider>
    );
} 