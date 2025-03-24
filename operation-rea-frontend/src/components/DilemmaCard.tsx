// operation-rea-frontend/src/components/DilemmaCard.tsx
"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"; // Importing the shadcn/ui Card components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

type DilemmaCardProps = {
    title: string;
    description: string;
    category: string;
    stakeholderCount: number;
};

export function DilemmaCard({
    title,
    description,
    category,
    stakeholderCount,
}: DilemmaCardProps) {
    return (
        <Card className="w-full overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20 relative">
            <Badge className="absolute top-4 right-4 bg-background border border-border/60 hover:bg-background text-foreground font-medium px-3 py-1 text-xs">
                {category}
            </Badge>
            <CardHeader className="pb-3">
                <div className="pr-24">
                    <CardTitle className="text-xl font-bold tracking-tight text-foreground line-clamp-2">{title}</CardTitle>
                    <CardDescription className="mt-2.5 line-clamp-3 text-sm text-muted-foreground">
                        {description}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">{stakeholderCount} Stakeholders</span>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-4 gap-3">
                <Button
                    variant="outline"
                    className="flex-1 transition-all hover:bg-secondary hover:text-secondary-foreground"
                >
                    Details
                </Button>
                <Button
                    className="flex-1 transition-all shadow-sm hover:shadow-md"
                >
                    Analyze
                </Button>
            </CardFooter>
        </Card>
    );
}