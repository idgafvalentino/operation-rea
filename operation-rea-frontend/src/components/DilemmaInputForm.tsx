"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import * as z from "zod";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisReport } from "./AnalysisReport";
import { Loader2 } from "lucide-react";

// Define validation schema
const formSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().min(10, { message: "Description must be at least 10 characters" }),
});

// Define the types for the analysis result based on the actual API response
type AnalysisResultData = {
    analysis: {
        dilemma: {
            id: string;
            title: string;
            description: string;
        };
        frameworks: Record<string, {
            recommendedAction: string;
            justification: string;
        }>;
        conflicts: {
            count: number;
            details: Array<{
                type: string;
                description: string;
                frameworks: string[];
                severity: number;
            }>;
        };
        finalRecommendation: {
            action: string;
            justification: string;
            confidence: number;
            supporting_frameworks?: string[];
            opposing_frameworks?: string[];
        };
        stakeholderImpacts: Record<string, {
            impact: number;
            explanation: string;
        }>;
    };
};

export function DilemmaInputForm() {
    const [result, setResult] = useState<AnalysisResultData | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Define form using react-hook-form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
        },
    });

    // Use React Query's useMutation hook to send data to the backend
    const mutation = useMutation({
        mutationFn: async (dilemmaData: z.infer<typeof formSchema>) => {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dilemmaData),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json() as Promise<AnalysisResultData>;
        },
        onSuccess: (data) => {
            setResult(data);
            setError(null);
            console.log("Analysis result structure:", JSON.stringify(data, null, 2));
        },
        onError: (err) => {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setResult(null);
        },
    });

    // Handle form submission
    function onSubmit(values: z.infer<typeof formSchema>) {
        // Log the form data to the console
        console.log(values);
        // Send data to the backend
        mutation.mutate(values);
    }

    return (
        <div className="space-y-8">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Submit Your Dilemma</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dilemma Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter the title of your dilemma" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dilemma Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe your dilemma in detail"
                                                className="min-h-32 resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Provide enough context to understand the situation.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={mutation.isPending}>
                                {mutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : "Submit Dilemma"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Display the analysis result */}
            {mutation.isPending && (
                <div className="p-8 border rounded bg-secondary/20 flex items-center justify-center">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    <p className="text-center">Analyzing your ethical dilemma...</p>
                </div>
            )}

            {error && (
                <div className="p-4 border rounded bg-destructive/20 text-destructive">
                    <p className="text-center">Error analyzing your dilemma: {error}</p>
                </div>
            )}

            {result && <AnalysisReport analysisResult={result} />}
        </div>
    );
} 