"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// Define the types for the analysis result
type Framework = {
    recommendedAction: string;
    justification: string;
};

type Conflict = {
    type: string;
    description: string;
    frameworks: string[];
    severity: number;
};

type FinalRecommendation = {
    action: string;
    justification: string;
    confidence: number;
    supporting_frameworks?: string[];
    opposing_frameworks?: string[];
};

type AnalysisResultData = {
    analysis: {
        dilemma: {
            id: string;
            title: string;
            description: string;
        };
        frameworks: Record<string, Framework>;
        conflicts: {
            count: number;
            details: Conflict[];
        };
        finalRecommendation: FinalRecommendation;
        stakeholderImpacts: Record<string, {
            impact: number;
            explanation: string;
        }>;
    };
};

type AnalysisReportProps = {
    analysisResult: AnalysisResultData;
};

export function AnalysisReport({ analysisResult }: AnalysisReportProps) {
    const { analysis } = analysisResult;

    // Format framework names for better display
    const formatFrameworkName = (name: string) => {
        return name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Format conflict severity as percentage
    const formatSeverity = (severity: number) => {
        return Math.round(severity * 100);
    };

    // Format confidence as percentage
    const formatConfidence = (confidence: number) => {
        return Math.round(confidence * 100);
    };

    return (
        <div className="space-y-6 w-full">
            <Card>
                <CardHeader>
                    <CardTitle>Ethical Analysis Report</CardTitle>
                    <CardDescription>Analysis results for "{analysis?.dilemma?.title || 'Dilemma'}"</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Framework Analysis Section */}
                    {analysis?.frameworks && Object.keys(analysis.frameworks).length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Framework Analysis</h3>
                            <Table>
                                <TableCaption>Ethical framework perspectives on this dilemma</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[180px]">Framework</TableHead>
                                        <TableHead>Recommended Action</TableHead>
                                        <TableHead className="min-w-[300px]">Justification</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(analysis.frameworks).map(([framework, details]) => (
                                        <TableRow key={framework}>
                                            <TableCell className="font-medium">{formatFrameworkName(framework)}</TableCell>
                                            <TableCell>{details?.recommendedAction || 'N/A'}</TableCell>
                                            <TableCell>{details?.justification || 'No justification provided'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <Separator />

                    {/* Stakeholder Impact Section */}
                    {analysis?.stakeholderImpacts && Object.keys(analysis.stakeholderImpacts).length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Stakeholder Impact</h3>
                            <Table>
                                <TableCaption>How this dilemma affects different stakeholders</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[180px]">Stakeholder</TableHead>
                                        <TableHead className="w-[120px]">Impact</TableHead>
                                        <TableHead>Explanation</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(analysis.stakeholderImpacts).map(([stakeholder, impact]) => (
                                        <TableRow key={stakeholder}>
                                            <TableCell className="font-medium">{stakeholder}</TableCell>
                                            <TableCell>
                                                <Progress value={(impact?.impact || 0) * 100} className="h-2 w-full" />
                                                <span className="text-xs mt-1 block">{((impact?.impact || 0) * 10).toFixed(1)}/10</span>
                                            </TableCell>
                                            <TableCell>{impact?.explanation || 'No explanation provided'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Ethical Conflicts Section */}
                    {analysis?.conflicts?.count > 0 && analysis.conflicts.details && (
                        <div>
                            <Separator className="my-4" />
                            <h3 className="text-lg font-semibold mb-4">Ethical Conflicts</h3>
                            <div className="space-y-4">
                                {analysis.conflicts.details.map((conflict, index) => (
                                    <Card key={index} className="border-l-4 border-l-amber-500">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-base">
                                                    Conflict #{index + 1}: {(conflict?.type || '').replace(/_/g, ' ')}
                                                </CardTitle>
                                                <Badge variant={(conflict?.severity || 0) > 0.7 ? "destructive" : "secondary"}>
                                                    Severity: {formatSeverity(conflict?.severity || 0)}%
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm mb-2">{conflict?.description || 'No description provided'}</p>
                                            {conflict?.frameworks && conflict.frameworks.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {conflict.frameworks.map((framework, i) => (
                                                        <Badge key={i} variant="outline">
                                                            {formatFrameworkName(framework)}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    <Separator />

                    {/* Final Recommendation Section */}
                    {analysis?.finalRecommendation && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Final Recommendation</h3>
                            <Card className="border-l-4 border-l-green-500">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">Recommended Action</CardTitle>
                                        <Badge variant="outline">
                                            Confidence: {formatConfidence(analysis.finalRecommendation.confidence || 0)}%
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="font-semibold">{analysis.finalRecommendation.action || 'No action specified'}</p>
                                    <p className="text-sm">{analysis.finalRecommendation.justification || 'No justification provided'}</p>

                                    {analysis.finalRecommendation.supporting_frameworks && analysis.finalRecommendation.supporting_frameworks.length > 0 && (
                                        <div className="mt-2">
                                            <p className="text-sm font-medium">Supporting Frameworks:</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {analysis.finalRecommendation.supporting_frameworks.map((framework, i) => (
                                                    <Badge key={i} variant="secondary">
                                                        {formatFrameworkName(framework)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {analysis.finalRecommendation.opposing_frameworks && analysis.finalRecommendation.opposing_frameworks.length > 0 && (
                                        <div className="mt-2">
                                            <p className="text-sm font-medium">Opposing Frameworks:</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {analysis.finalRecommendation.opposing_frameworks.map((framework, i) => (
                                                    <Badge key={i} variant="outline" className="border-red-300">
                                                        {formatFrameworkName(framework)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 