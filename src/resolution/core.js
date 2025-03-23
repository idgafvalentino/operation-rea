/**
 * Resolution Core Module
 * 
 * Core utility functions for ethical conflict resolution.
 */

/**
 * Normalize a framework name for consistent comparison
 * @param {string} frameworkName - The framework name to normalize
 * @returns {string} Normalized framework name
 */
export function normalizeFrameworkName(frameworkName) {
  if (!frameworkName) return '';
  
  // Convert to lowercase and remove special characters
  return frameworkName.toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .trim();
}

/**
 * Calculate similarity between two ethical frameworks
 * @param {string} framework1 - First framework name
 * @param {string} framework2 - Second framework name
 * @returns {number} Similarity score between 0 and 1
 */
export function calculateFrameworkSimilarity(framework1, framework2) {
  // Normalize framework names
  const norm1 = normalizeFrameworkName(framework1);
  const norm2 = normalizeFrameworkName(framework2);
  
  // Simple equality check for exact matches
  if (norm1 === norm2) return 1.0;
  
  // Basic similarity for related frameworks
  const relationshipMap = {
    'utilitarianism': ['consequentialism', 'utility'],
    'deontology': ['kantian', 'duty', 'rights_based'],
    'virtue_ethics': ['character_ethics', 'excellence'],
    'care_ethics': ['feminist_ethics', 'relational_ethics'],
    'justice': ['fairness', 'rawlsian', 'distributive_justice']
  };
  
  // Check if frameworks are related
  for (const [base, related] of Object.entries(relationshipMap)) {
    if ((norm1.includes(base) && related.some(r => norm2.includes(r))) ||
        (norm2.includes(base) && related.some(r => norm1.includes(r)))) {
      return 0.7; // High similarity for related frameworks
    }
  }
  
  // Default low similarity
  return 0.2;
}

/**
 * Get default framework weights
 * @returns {Object} Default weights for ethical frameworks
 */
export function getDefaultFrameworkWeights() {
  return {
    'utilitarian': 0.2,
    'deontology': 0.2,
    'virtue_ethics': 0.2,
    'care_ethics': 0.2,
    'justice': 0.2
  };
}

/**
 * Generate a resolution strategy for a given conflict
 * @param {Object} conflict - The conflict to resolve
 * @returns {string} Recommended resolution strategy
 */
export function generateResolutionStrategy(conflict) {
  if (!conflict) return 'framework_balancing';
  
  // Default strategies for different conflict types
  const strategies = {
    'framework_conflict': 'framework_balancing',
    'stakeholder_conflict': 'stakeholder_compromise',
    'value_conflict': 'principled_priority',
    'multi_framework_conflict': 'multi_framework_integration'
  };
  
  return strategies[conflict.type] || 'framework_balancing';
} 