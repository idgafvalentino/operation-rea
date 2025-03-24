/**
 * Conflict Analysis Module
 * Contains functions for analyzing ethical conflicts between frameworks
 */

/**
 * Analyze the nature of a conflict between two frameworks
 * @param {string} framework1 - First framework
 * @param {string} framework2 - Second framework
 * @param {Object} rec1 - Recommendation from first framework
 * @param {Object} rec2 - Recommendation from second framework
 * @param {Object} dilemma - The dilemma being analyzed
 * @returns {string} The identified conflict nature
 */
export function analyzeConflictNature(framework1, framework2, rec1, rec2, dilemma) {
  // Check for factual disagreements
  if (rec1.factualAssumptions && rec2.factualAssumptions) {
    // Compare factual assumptions - if major differences, it may be a factual conflict
    const factualDiff = calculateSimilarity(rec1.factualAssumptions.join(' '), rec2.factualAssumptions.join(' '));  
    if (factualDiff < 0.3) {
      return 'factual_conflict';
    }
  }
  
  // Check for methodological conflicts
  if (rec1.methodology && rec2.methodology && rec1.methodology !== rec2.methodology) {
    return 'methodological_conflict';
  }
  
  // Check for value conflicts (most common)
  if (rec1.coreValues && rec2.coreValues) {
    // Calculate value overlap
    const valueOverlap = rec1.coreValues.filter(value => rec2.coreValues.includes(value)).length;
    if (valueOverlap === 0) {
      return 'value_conflict';
    }
  }
  
  // Default: framework conflict - the basic structure of the frameworks leads to different conclusions
  return 'framework_conflict';
}

/**
 * Determine if a conflict is primarily a framework conflict
 * @param {Object} conflict - The conflict object
 * @returns {boolean} Whether it's a framework conflict
 */
export function isFrameworkConflict(conflict) {
  return conflict.nature === 'framework_conflict';
}

/**
 * Determine if a conflict is primarily a value conflict
 * @param {Object} conflict - The conflict object
 * @returns {boolean} Whether it's a value conflict
 */
export function isValueConflict(conflict) {
  return conflict.nature === 'value_conflict';
}

/**
 * Determine if a conflict is primarily a factual conflict
 * @param {Object} conflict - The conflict object
 * @returns {boolean} Whether it's a factual conflict
 */
export function isFactualConflict(conflict) {
  return conflict.nature === 'factual_conflict';
}

/**
 * Determine if a conflict is primarily a methodological conflict
 * @param {Object} conflict - The conflict object
 * @returns {boolean} Whether it's a methodological conflict
 */
export function isMethodologicalConflict(conflict) {
  return conflict.nature === 'methodological_conflict';
}

/**
 * Analyze the severity of a conflict between two frameworks
 * @param {string} framework1 - First framework
 * @param {string} framework2 - Second framework
 * @param {string} conflictNature - The nature of the conflict
 * @param {Object} dilemma - The dilemma being analyzed
 * @returns {number} Severity score between 0-1
 */
export function analyzeConflictSeverity(framework1, framework2, conflictNature, dilemma) {
  // Default moderate severity
  let severity = 0.5;
  
  // Framework distance increases severity
  const frameworkDistance = calculateFrameworkDistance(framework1, framework2, dilemma);
  severity += frameworkDistance * 0.3;
  
  // Factual conflicts are generally less severe as they can be resolved with more information
  if (conflictNature === 'factual_conflict') {
    severity -= 0.2;
  }
  
  // Value conflicts can be very severe
  if (conflictNature === 'value_conflict') {
    severity += 0.2;
  }
  
  // Cap severity between 0 and 1
  return Math.max(0, Math.min(1, severity));
}

/**
 * Identify potential areas of compromise between conflicting frameworks
 * @param {string} framework1 - First framework
 * @param {string} framework2 - Second framework
 * @param {Object} rec1 - Recommendation from first framework
 * @param {Object} rec2 - Recommendation from second framework
 * @param {Object} dilemma - The dilemma being analyzed
 * @returns {Array} Potential compromise areas
 */
export function identifyCompromiseAreas(framework1, framework2, rec1, rec2, dilemma) {
  const compromiseAreas = [];
  
  // Check for shared ethical dimensions
  const sharedDimensions = identifySharedEthicalDimensions(framework1, framework2, rec1, rec2);
  if (sharedDimensions.length > 0) {
    compromiseAreas.push({
      type: 'shared_dimensions',
      description: `Frameworks share concerns for ${sharedDimensions.join(', ')}`,
      dimensions: sharedDimensions
    });
  }
  
  // Check for partial action overlap
  if (rec1.partialActions && rec2.partialActions) {
    const sharedActions = rec1.partialActions.filter(a => rec2.partialActions.includes(a));
    if (sharedActions.length > 0) {
      compromiseAreas.push({
        type: 'partial_action_overlap',
        description: `Both frameworks support partial actions: ${sharedActions.join(', ')}`,
        actions: sharedActions
      });
    }
  }
  
  // Check for compatible stakeholder concerns
  const stakeholders1 = rec1.keyStakeholders || [];
  const stakeholders2 = rec2.keyStakeholders || [];
  const sharedStakeholders = stakeholders1.filter(s => stakeholders2.includes(s));
  
  if (sharedStakeholders.length > 0) {
    compromiseAreas.push({
      type: 'stakeholder_overlap',
      description: `Both frameworks prioritize stakeholders: ${sharedStakeholders.join(', ')}`,
      stakeholders: sharedStakeholders
    });
  }
  
  return compromiseAreas;
}

/**
 * Generate a human-readable conflict description
 * @param {string} framework1 - First framework
 * @param {string} framework2 - Second framework
 * @param {Object} rec1 - Recommendation from first framework
 * @param {Object} rec2 - Recommendation from second framework
 * @returns {string} Human-readable conflict description
 */
export function generateConflictDescription(framework1, framework2, rec1, rec2) {
  const f1Name = framework1.charAt(0).toUpperCase() + framework1.slice(1).replace('_', ' ');
  const f2Name = framework2.charAt(0).toUpperCase() + framework2.slice(1).replace('_', ' ');
  
  return `Conflict between ${f1Name} recommending "${rec1.recommendedAction}" and ${f2Name} recommending "${rec2.recommendedAction}". ` +
         `The frameworks prioritize different ethical considerations, leading to contrasting conclusions.`;
}

/**
 * Calculate the conceptual distance between two ethical frameworks
 * @param {string} framework1 - First framework
 * @param {string} framework2 - Second framework
 * @param {Object} dilemma - The dilemma being analyzed
 * @returns {number} Distance score between 0-1
 */
export function calculateFrameworkDistance(framework1, framework2, dilemma) {
  // Define known framework distances based on ethical theory relationships
  const knownDistances = {
    'utilitarian_deontology': 0.8,
    'utilitarian_virtue_ethics': 0.6,
    'utilitarian_care_ethics': 0.5,
    'utilitarian_justice': 0.4,
    'deontology_virtue_ethics': 0.5,
    'deontology_care_ethics': 0.6,
    'deontology_justice': 0.4,
    'virtue_ethics_care_ethics': 0.3,
    'virtue_ethics_justice': 0.4,
    'care_ethics_justice': 0.5
  };
  
  // Check both possible orderings of the frameworks
  const key1 = `${framework1}_${framework2}`;
  const key2 = `${framework2}_${framework1}`;
  
  if (knownDistances[key1] !== undefined) {
    return knownDistances[key1];
  } else if (knownDistances[key2] !== undefined) {
    return knownDistances[key2];
  }
  
  // If no known distance, use a default moderate distance
  return 0.5;
}

/**
 * Calculate text similarity between two strings
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} Similarity score between 0-1
 */
export function calculateSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  
  // Simple Jaccard similarity implementation
  const words1 = new Set(text1.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  const words2 = new Set(text2.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  
  let intersection = 0;
  for (const word of words1) {
    if (words2.has(word)) intersection++;
  }
  
  const union = words1.size + words2.size - intersection;
  
  return union === 0 ? 0 : intersection / union;
}

/**
 * Identify shared ethical dimensions between frameworks
 * @param {string} framework1 - First framework
 * @param {string} framework2 - Second framework
 * @param {Object} rec1 - Recommendation from first framework
 * @param {Object} rec2 - Recommendation from second framework
 * @returns {Array} Shared ethical dimensions
 */
export function identifySharedEthicalDimensions(framework1, framework2, rec1, rec2) {
  // Define known shared dimensions between common frameworks
  const knownSharedDimensions = {
    'utilitarian_deontology': ['moral worth', 'human dignity'],
    'utilitarian_virtue_ethics': ['flourishing', 'well-being'],
    'utilitarian_care_ethics': ['welfare', 'harm prevention'],
    'utilitarian_justice': ['fairness', 'equality'],
    'deontology_virtue_ethics': ['character', 'moral principles'],
    'deontology_care_ethics': ['respect', 'protection'],
    'deontology_justice': ['rights', 'universality'],
    'virtue_ethics_care_ethics': ['relationships', 'character development'],
    'virtue_ethics_justice': ['fairness as virtue', 'community'],
    'care_ethics_justice': ['vulnerable protection', 'relational equality']
  };
  
  // Check both possible orderings of the frameworks
  const key1 = `${framework1}_${framework2}`;
  const key2 = `${framework2}_${framework1}`;
  
  if (knownSharedDimensions[key1]) {
    return knownSharedDimensions[key1];
  } else if (knownSharedDimensions[key2]) {
    return knownSharedDimensions[key2];
  }
  
  // If no known shared dimensions, use a default empty array
  return [];
} 