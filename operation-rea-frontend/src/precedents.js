/**
 * REA System Precedents
 * Contains precedent cases for casuistry analysis
 */

/**
 * Get the precedent case database
 * @returns {Array} Array of precedent cases
 */
export function getPrecedentDatabase() {
    // Return an array of precedent cases for casuistry analysis
    return [
        {
            id: "precedent_medical_autonomy_1",
            title: "Patient Autonomy vs. Medical Benefit",
            description: "Case involving patient refusal of life-saving treatment based on personal beliefs",
            ethical_dimensions: ["autonomy", "beneficence", "medical_ethics"],
            outcome: "respect_autonomy",
            reasoning: "Respect for patient autonomy was prioritized over medical benefit in this case.",
            similarity_keywords: ["medical", "autonomy", "treatment", "refusal", "beliefs"]
        },
        {
            id: "precedent_resource_allocation_1",
            title: "Limited Resource Allocation",
            description: "Case involving fair distribution of limited medical resources",
            ethical_dimensions: ["justice", "utility", "fairness"],
            outcome: "utilitarian_distribution",
            reasoning: "Utilitarian principles were applied to maximize overall benefit.",
            similarity_keywords: ["resources", "allocation", "scarcity", "distribution", "fairness"]
        },
        {
            id: "precedent_privacy_security_1",
            title: "Privacy vs. Security",
            description: "Case involving surveillance and privacy concerns",
            ethical_dimensions: ["privacy", "security", "rights"],
            outcome: "balanced_approach",
            reasoning: "A balanced approach respecting privacy while maintaining necessary security was adopted.",
            similarity_keywords: ["privacy", "security", "surveillance", "rights", "balance"]
        }
    ];
}

export default { getPrecedentDatabase }; 