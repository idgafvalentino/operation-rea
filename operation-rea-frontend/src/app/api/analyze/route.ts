import { NextResponse } from 'next/server';
import { processEthicalDilemma, detectConflicts, resolveConflicts } from '../../../../src/core/rea.js';
import { v4 as uuidv4 } from 'uuid';

// Define interface for frontend dilemma input
interface DilemmaInput {
    title: string;
    description: string;
}

// Define interfaces for REA system types
interface DilemmaParameter {
    value: number;
    description: string;
}

interface DilemmaStakeholder {
    id: string;
    name: string;
    concerns: string;
    influence: number;
}

interface DilemmaAction {
    id: string;
    action: string;
    description: string;
    predicted_consequences: string;
}

interface ContextualFactor {
    factor: string;
    value: string;
    relevance: string;
    explanation: string;
}

interface Dilemma {
    id: string;
    title: string;
    description: string;
    frameworks: string[];
    processing_mode: string;
    stakeholders: DilemmaStakeholder[];
    parameters: Record<string, DilemmaParameter>;
    possible_actions: DilemmaAction[];
    contextual_factors: ContextualFactor[];
    ethical_dimensions: string[];
}

interface FrameworkAnalysis {
    recommendedAction: string;
    justification: string;
}

interface Conflict {
    type: string;
    description: string;
    frameworks: string[];
    severity: number;
}

interface Conflicts {
    conflicts: Conflict[];
}

interface Resolution {
    type: string;
    description: string;
    frameworks: string[];
    resolution_method: string;
}

interface Resolutions {
    resolutions: Resolution[];
    metadata: { resolution_count: number };
    final_recommendation?: {
        action: string;
        justification: string;
        confidence: number;
    };
}

interface ProcessingResults {
    frameworks: Record<string, {
        recommendedAction: string;
        justification: string;
        [key: string]: any;
    }>;
    stakeholderImpacts?: Record<string, any>;
    [key: string]: any;
}

// Function to transform simple frontend dilemma data into the format expected by the REA system
function createDilemmaFromInput(input: DilemmaInput): Dilemma {
    // Generate a unique ID for the dilemma
    const id = `dilemma_${uuidv4().replace(/-/g, '_')}`;

    // Create a properly formatted dilemma object
    return {
        id,
        title: input.title,
        description: input.description,
        // Add default values for required fields
        frameworks: ['utilitarian', 'justice', 'deontology', 'care_ethics', 'virtue_ethics'],
        processing_mode: 'standard',
        stakeholders: [
            {
                id: 'user',
                name: 'User',
                concerns: 'Personal ethics, moral consistency, finding the right solution',
                influence: 0.9
            },
            {
                id: 'affected_parties',
                name: 'Affected Parties',
                concerns: 'Fair treatment, welfare, rights, autonomy',
                influence: 0.8
            }
        ],
        parameters: {
            // Required parameters for utilitarian framework
            population_served_option_a: { value: 5, description: 'Number of people affected by option A' },
            benefit_per_person_option_a: { value: 7, description: 'Average benefit per person for option A' },
            population_served_option_b: { value: 4, description: 'Number of people affected by option B' },
            benefit_per_person_option_b: { value: 8, description: 'Average benefit per person for option B' },

            // Required parameters for deontology framework
            urgency_option_a: { value: 8, description: 'Urgency level of option A' },
            urgency_option_b: { value: 7, description: 'Urgency level of option B' },

            // Required parameters for care_ethics framework
            deportation_risk: { value: 2, description: 'Risk of deportation or displacement' },
            specialized_care_importance: { value: 6, description: 'Importance of specialized care' },

            // General parameters
            fairness: { value: 7, description: 'Importance of fairness in this situation' },
            autonomy: { value: 8, description: 'Importance of respecting autonomy' },
            welfare: { value: 8, description: 'Importance of overall welfare' },
            rights: { value: 7, description: 'Importance of respecting rights' },
            duty: { value: 7, description: 'Importance of fulfilling duties' }
        },
        possible_actions: [
            {
                id: 'action_a',
                action: 'action_a',
                description: 'Take action A',
                predicted_consequences: 'The potential outcomes of taking action A'
            },
            {
                id: 'action_b',
                action: 'action_b',
                description: 'Take action B',
                predicted_consequences: 'The potential outcomes of taking action B'
            }
        ],
        contextual_factors: [
            {
                factor: 'uncertainty',
                value: 'moderate',
                relevance: 'medium',
                explanation: 'There is moderate uncertainty about the outcomes'
            }
        ],
        // Add ethical dimensions for precedent matching
        ethical_dimensions: [
            'autonomy_vs_beneficence',
            'fair_allocation',
            'rights_based_conflict'
        ]
    };
}

// Function to extract relevant information from the full analysis results
function formatAnalysisResponse(
    dilemma: Dilemma,
    results: ProcessingResults,
    conflicts: Conflicts,
    resolutions: Resolutions
) {
    // Extract framework recommendations
    const frameworkAnalysis: Record<string, FrameworkAnalysis> = {};
    if (results.frameworks) {
        Object.entries(results.frameworks).forEach(([framework, analysis]) => {
            frameworkAnalysis[framework] = {
                recommendedAction: analysis.recommendedAction,
                justification: analysis.justification
            };
        });
    }

    // Extract the final recommendation if available
    let finalRecommendation = null;
    if (resolutions && resolutions.final_recommendation) {
        finalRecommendation = resolutions.final_recommendation;
    }

    // Format the response
    return {
        analysis: {
            dilemma: {
                id: dilemma.id,
                title: dilemma.title,
                description: dilemma.description
            },
            frameworks: frameworkAnalysis,
            conflicts: conflicts ? {
                count: conflicts.conflicts ? conflicts.conflicts.length : 0,
                details: conflicts.conflicts || []
            } : { count: 0, details: [] },
            finalRecommendation: finalRecommendation || {
                action: Object.values(frameworkAnalysis)[0]?.recommendedAction || "no_clear_action",
                justification: "Based on framework analysis without conflict resolution",
                confidence: 0.6
            },
            stakeholderImpacts: results.stakeholderImpacts || {}
        }
    };
}

export async function POST(request: Request) {
    try {
        // Get form data from request
        const formData = await request.json() as DilemmaInput;

        // Create a properly formatted dilemma object
        const dilemma = createDilemmaFromInput(formData);

        // Process the dilemma through the REA system
        const results = processEthicalDilemma(dilemma) as ProcessingResults;

        // Detect conflicts between ethical frameworks
        const conflicts = detectConflicts(dilemma) as Conflicts;

        // Resolve conflicts if any are detected
        let resolutions: Resolutions = { resolutions: [], metadata: { resolution_count: 0 } };
        if (conflicts.conflicts && conflicts.conflicts.length > 0) {
            resolutions = resolveConflicts(results, conflicts, dilemma) as Resolutions;
        }

        // Format the response with relevant information
        const formattedResponse = formatAnalysisResponse(dilemma, results, conflicts, resolutions);

        // Return the analysis results
        return NextResponse.json(formattedResponse);
    } catch (error: any) {
        console.error('Error analyzing dilemma:', error);

        // Return an error response
        return NextResponse.json(
            { error: 'Failed to analyze dilemma', message: error.message },
            { status: 500 }
        );
    }
} 