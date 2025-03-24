/**
 * Resolution Weighting Module
 * 
 * This module contains functions for weighting different resolution approaches
 * and calculating the relative importance of different ethical considerations.
 */

/**
 * Calculate weights for different ethical considerations based on the dilemma context
 * @param {Object} dilemma - The ethical dilemma
 * @param {Array|Object} frameworks - The ethical frameworks being considered (array or single framework)
 * @returns {Object} Weights for different ethical considerations
 */
function calculateEthicalWeights(dilemma, frameworks) {
    const weights = {};
    
    // Initialize weights for common ethical considerations with default values
    weights.harm = 0.5;          // default value for harm consideration
    weights.autonomy = 0.5;      // default value for autonomy consideration
    weights.justice = 0.5;       // default value for justice consideration
    weights.beneficence = 0.5;   // default value for beneficence consideration
    weights.rights = 0.5;        // default value for rights consideration
    weights.duties = 0.5;        // default value for duties consideration
    weights.virtues = 0.5;       // default value for virtues consideration
    weights.care = 0.5;          // default value for care consideration
    
    // Adjust weights based on dilemma context
    if (dilemma && dilemma.context && dilemma.context.domain) {
        switch (dilemma.context.domain.toLowerCase()) {
            case 'healthcare':
                weights.harm = 0.9;
                weights.beneficence = 0.8;
                weights.autonomy = 0.7;
                break;
            case 'business':
                weights.justice = 0.8;
                weights.rights = 0.7;
                weights.duties = 0.6;
                break;
            case 'technology':
                weights.harm = 0.8;
                weights.autonomy = 0.7;
                weights.justice = 0.6;
                break;
            case 'environment':
                weights.harm = 0.8;
                weights.justice = 0.7;
                weights.duties = 0.6;
                break;
            default:
                // Default weights for general cases
                weights.harm = 0.7;
                weights.autonomy = 0.7;
                weights.justice = 0.7;
                weights.beneficence = 0.7;
                weights.rights = 0.7;
                weights.duties = 0.7;
                weights.virtues = 0.7;
                weights.care = 0.7;
        }
    }
    
    // Ensure frameworks is an array
    const frameworksArray = Array.isArray(frameworks) ? frameworks : (frameworks ? [frameworks] : []);
    
    // Adjust weights based on frameworks
    frameworksArray.forEach(framework => {
        if (!framework) return;
        
        const name = framework.name ? framework.name.toLowerCase() : '';
        
        if (name.includes('utilitarian')) {
            weights.harm += 0.2;
            weights.beneficence += 0.2;
        } else if (name.includes('deontolog') || name.includes('kantian')) {
            weights.duties += 0.2;
            weights.rights += 0.2;
        } else if (name.includes('virtue')) {
            weights.virtues += 0.2;
            weights.character = (weights.character || 0) + 0.2; // Initialize if undefined
        } else if (name.includes('care')) {
            weights.care += 0.2;
            weights.relationships = (weights.relationships || 0) + 0.2; // Initialize if undefined
        } else if (name.includes('justice')) {
            weights.justice += 0.2;
            weights.fairness = (weights.fairness || 0) + 0.2; // Initialize if undefined
        }
    });
    
    // Normalize weights to ensure they're between 0 and 1
    Object.keys(weights).forEach(key => {
        weights[key] = Math.min(weights[key], 1);
    });
    
    return weights;
}

/**
 * Calculate the weighted score for a resolution based on ethical considerations
 * @param {Object} resolution - The proposed resolution
 * @param {Object} weights - The weights for different ethical considerations
 * @returns {number} The weighted score
 */
function calculateResolutionScore(resolution, weights) {
    let score = 0;
    let totalWeight = 0;
    
    // Calculate score based on weighted ethical considerations
    Object.keys(weights).forEach(consideration => {
        const weight = weights[consideration];
        totalWeight += weight;
        
        // Check if the resolution addresses this consideration
        if (resolution.considerations && resolution.considerations[consideration]) {
            score += weight * resolution.considerations[consideration].score;
        }
    });
    
    // Normalize score
    return totalWeight > 0 ? score / totalWeight : 0;
}

/**
 * Rank resolutions based on their weighted scores
 * @param {Array} resolutions - Array of possible resolutions
 * @param {Object} weights - The weights for different ethical considerations
 * @returns {Array} Ranked resolutions with scores
 */
function rankResolutions(resolutions, weights) {
    const scoredResolutions = resolutions.map(resolution => {
        return {
            ...resolution,
            score: calculateResolutionScore(resolution, weights)
        };
    });
    
    // Sort by score in descending order
    return scoredResolutions.sort((a, b) => b.score - a.score);
}

export {
    calculateEthicalWeights,
    calculateResolutionScore,
    rankResolutions
}; 