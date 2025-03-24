/**
 * REA System - Dilemma Similarity
 * Contains functions for comparing dilemmas and finding relevant precedents
 */

import { getPrecedentDatabase } from '../precedents.js';

/**
 * Find precedents relevant to the current dilemma
 * @param {Object} dilemma - The dilemma to find precedents for
 * @param {Object} options - Options for precedent search
 * @returns {Array} Relevant precedents with similarity scores
 */
export function findRelevantPrecedents(dilemma, options = {}) {
    // Get precedent database
    const precedents = getPrecedentDatabase();

    // Extract dilemma text for comparison
    const dilemmaText = `${dilemma.title} ${dilemma.description}`.toLowerCase();

    // Find similarities based on keywords
    const relevantPrecedents = precedents.map(precedent => {
        // Calculate simple similarity based on keyword matching
        let similarityScore = 0;

        // Check for keyword matches
        const keywords = precedent.similarity_keywords || [];
        keywords.forEach(keyword => {
            if (dilemmaText.includes(keyword.toLowerCase())) {
                similarityScore += 0.1; // Add 0.1 for each keyword match
            }
        });

        // Check for ethical dimensions matches
        const dimensions = precedent.ethical_dimensions || [];
        const dilemmaDimensions = dilemma.ethical_dimensions || [];

        dimensions.forEach(dimension => {
            if (dilemmaDimensions.includes(dimension)) {
                similarityScore += 0.15; // Add 0.15 for each matching ethical dimension
            }
        });

        // Cap similarity at 1.0
        similarityScore = Math.min(similarityScore, 1.0);

        return {
            ...precedent,
            similarity: similarityScore
        };
    });

    // Sort by similarity (descending)
    relevantPrecedents.sort((a, b) => b.similarity - a.similarity);

    // Filter out precedents with low similarity if threshold provided
    const threshold = options.threshold || 0.2;
    const filteredPrecedents = relevantPrecedents.filter(p => p.similarity >= threshold);

    // Return top N precedents if limit provided
    const limit = options.limit || filteredPrecedents.length;
    return filteredPrecedents.slice(0, limit);
}

export default { findRelevantPrecedents }; 