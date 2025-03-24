import { useQuery } from "@tanstack/react-query";

// Define the Dilemma type
export interface Dilemma {
    id: string;
    title: string;
    description: string;
    category: string;
    stakeholderCount: number;
}

// Mock data for development
const mockDilemmas: Dilemma[] = [
    {
        id: "1",
        title: "Privacy vs Security",
        description: "Should we implement surveillance measures to enhance security at the cost of privacy?",
        category: "Technology",
        stakeholderCount: 4,
    },
    {
        id: "2",
        title: "Automation Impact",
        description: "How to handle job displacement caused by automation and AI?",
        category: "Society",
        stakeholderCount: 6,
    },
    {
        id: "3",
        title: "Healthcare Resources",
        description: "How to allocate limited healthcare resources during a crisis?",
        category: "Ethics",
        stakeholderCount: 5,
    },
];

// Function to fetch dilemmas from an API (using mock data for now)
async function fetchDilemmas(): Promise<Dilemma[]> {
    // In a real app, this would be a fetch call to your API
    // Example: return fetch('/api/dilemmas').then(res => res.json())

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return mockDilemmas;
}

// The hook to fetch and provide dilemmas data
export function useDilemmas() {
    return useQuery({
        queryKey: ['dilemmas'],
        queryFn: fetchDilemmas,
    });
} 