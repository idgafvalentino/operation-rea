'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to console for debugging
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="container mx-auto px-4 py-16 flex flex-col items-center">
            <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
                <p className="text-muted-foreground mb-6">
                    {error.message || 'An unexpected error occurred'}
                </p>
                {error.digest && (
                    <div className="p-4 mb-6 bg-muted rounded-md overflow-auto">
                        <code>Error ID: {error.digest}</code>
                    </div>
                )}
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                        Try again
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
                    >
                        Go to homepage
                    </button>
                </div>
            </div>
        </div>
    );
} 