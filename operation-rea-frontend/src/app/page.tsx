// app/dilemmas/page.tsx (or app/page.tsx)
"use client";

import { DilemmaCard } from "@/components/DilemmaCard";
import { useDilemmas, type Dilemma } from "@/hooks/use-dilemmas";
import { Loader2 } from "lucide-react";
import { DilemmaInputForm } from "@/components/DilemmaInputForm";

export default function DilemmasPage() {
  const { data: dilemmas, isLoading, isError } = useDilemmas();

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Ethical Dilemmas</h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-3xl">
          Explore and analyze complex ethical scenarios that challenge traditional decision-making frameworks.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin mb-4" />
          <p className="text-lg">Loading dilemmas...</p>
        </div>
      ) : isError ? (
        <div className="bg-destructive/10 text-destructive px-4 py-6 rounded-lg text-center">
          <p className="text-lg font-medium">Error fetching dilemmas.</p>
          <p className="text-sm mt-2">Please try again later or contact support if the problem persists.</p>
        </div>
      ) : dilemmas?.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed rounded-lg">
          <p className="text-lg font-medium">No dilemmas found</p>
          <p className="text-sm mt-2">Create your first dilemma to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {dilemmas?.map((dilemma: Dilemma) => (
            <DilemmaCard
              key={dilemma.id}
              title={dilemma.title}
              description={dilemma.description}
              category={dilemma.category}
              stakeholderCount={dilemma.stakeholderCount}
            />
          ))}
        </div>
      )}

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Submit Your Ethical Dilemma
              </h2>
              <p className="text-lg text-muted-foreground">
                Use our advanced ethical reasoning engine to analyze your moral dilemmas. Get a
                comprehensive analysis based on multiple ethical frameworks.
              </p>
            </div>
            <DilemmaInputForm />
          </div>
        </div>
      </section>
    </div>
  );
}