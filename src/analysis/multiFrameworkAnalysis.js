/**
 * Multi-Framework Analysis Module
 * Contains functions for analyzing and resolving conflicts between multiple ethical frameworks
 */

/**
 * Analyzes conflicts between multiple frameworks
 * @param {Object} actionGroups - Groups of frameworks organized by their recommended actions
 * @param {Object} frameworkRecommendations - The recommendations from each framework
 * @param {Object} dilemma - The ethical dilemma context
 * @returns {Object} Analysis of the multi-framework conflict
 */
export function analyzeMultiFrameworkConflict(actionGroups, frameworkRecommendations, dilemma) {
  // Initialize analysis object
  const analysis = {
    severity: 0.5, // Default moderate severity
    patterns: [],
    rootTensions: [],
    integrationPossibilities: []
  };
  
  // Count frameworks in each action group
  const actionCounts = {};
  for (const action in actionGroups) {
    actionCounts[action] = actionGroups[action].length;
  }
  
  // Get the dominant action (with most frameworks supporting it)
  let dominantAction = null;
  let maxCount = 0;
  for (const action in actionCounts) {
    if (actionCounts[action] > maxCount) {
      maxCount = actionCounts[action];
      dominantAction = action;
    }
  }
  
  // Calculate severity based on how evenly divided the frameworks are
  const totalFrameworks = Object.values(actionCounts).reduce((sum, count) => sum + count, 0);
  const evenness = 1 - (maxCount / totalFrameworks);
  analysis.severity = 0.3 + (evenness * 0.7); // More even distribution = higher severity
  
  // Identify conflict patterns
  analysis.patterns = identifyConflictPatterns(actionGroups, frameworkRecommendations);
  
  // Identify root tensions between frameworks
  analysis.rootTensions = identifyRootTensions(actionGroups, frameworkRecommendations);
  
  // Assess integration possibilities
  analysis.integrationPossibilities = assessIntegrationPossibilities(
    actionGroups, 
    frameworkRecommendations,
    dilemma
  );
  
  return analysis;
}

/**
 * Resolves a conflict between multiple frameworks
 * @param {Object} conflict - The multi-framework conflict to resolve
 * @param {Object} dilemma - The ethical dilemma context
 * @returns {Object} The resolution of the multi-framework conflict
 */
export function resolveMultiFrameworkConflict(conflict, dilemma) {
  // Initialize resolution
  const resolution = {
    weights: {},
    reasoning: '',
    meta_recommendation: '',
    confidence: 0.6, // Default confidence
    criticalParameters: []
  };
  
  // Get all unique recommended actions
  const allActions = new Set();
  for (const framework in conflict.recommendations) {
    allActions.add(conflict.recommendations[framework]);
  }
  
  // Count how many frameworks recommend each action
  const actionCounts = {};
  for (const action of allActions) {
    actionCounts[action] = 0;
  }
  
  for (const framework in conflict.recommendations) {
    const action = conflict.recommendations[framework];
    actionCounts[action] += 1;
  }
  
  // Assign weights to frameworks based on the conflict nature
  let totalWeight = 0;
  for (const framework in conflict.recommendations) {
    // Default equal weighting
    let weight = 1;
    
    // Adjust weights based on conflict specifics if available
    if (conflict.conflict_nature === 'value_conflict') {
      // In value conflicts, prioritize frameworks that align with dilemma values
      if (dilemma.values && dilemma.values.includes(framework)) {
        weight = 1.5;
      }
    } else if (conflict.conflict_nature === 'methodological_conflict') {
      // In methodological conflicts, consider context appropriateness
      if (dilemma.context && isMethodologyAppropriate(framework, dilemma.context)) {
        weight = 1.3;
      }
    }
    
    resolution.weights[framework] = weight;
    totalWeight += weight;
  }
  
  // Normalize weights
  for (const framework in resolution.weights) {
    resolution.weights[framework] /= totalWeight;
  }
  
  // Calculate weighted action scores
  const actionScores = {};
  for (const action of allActions) {
    actionScores[action] = 0;
  }
  
  for (const framework in conflict.recommendations) {
    const action = conflict.recommendations[framework];
    const weight = resolution.weights[framework];
    actionScores[action] += weight;
  }
  
  // Select the highest-scoring action
  let highestScore = 0;
  let recommendedAction = null;
  
  for (const action in actionScores) {
    if (actionScores[action] > highestScore) {
      highestScore = actionScores[action];
      recommendedAction = action;
    }
  }
  
  // Set confidence based on how decisive the recommendation is
  const scoreDifference = getScoreDifference(actionScores);
  resolution.confidence = 0.5 + (scoreDifference * 0.5);
  
  // Generate reasoning for the recommendation
  resolution.reasoning = generateMultiFrameworkReasoning(
    recommendedAction,
    conflict,
    resolution.weights,
    dilemma
  );
  
  // Set the final recommendation
  resolution.meta_recommendation = recommendedAction;
  
  // Identify critical parameters
  resolution.criticalParameters = identifyCriticalParameters(conflict, dilemma);
  
  return resolution;
}

/**
 * Generates reasoning for a recommendation based on template
 * @param {string} strategy - The resolution strategy
 * @param {Object} conflict - The conflict being resolved
 * @param {Object} dilemma - The ethical dilemma context
 * @returns {string} Generated reasoning text
 */
export function generateReasoningFromTemplate(strategy, conflict, dilemma) {
  // Default reasoning templates
  const templates = {
    'principled_priority': 
      `In resolving the conflict between ${formatFrameworkList(conflict.between)}, the principled priority approach identifies that ${conflict.between[0]} principles take precedence in this specific context due to the nature of the dilemma.`,
      
    'casuistry': 
      `By comparing this dilemma to similar precedent cases, the conflict between ${formatFrameworkList(conflict.between)} is resolved through case-based reasoning, which suggests that ${conflict.recommendations[conflict.between[0]]} is the most appropriate action based on relevant similarities.`,
      
    'multi_framework_integration': 
      `The conflict between ${formatFrameworkList(conflict.between)} is addressed through careful integration of their perspectives, weighing each framework's concerns proportionally to arrive at a balanced recommendation.`,
      
    'framework_balancing': 
      `To resolve the conflict between ${formatFrameworkList(conflict.between)}, their perspectives are balanced by weighing the severity of their concerns and the contextual relevance of each framework.`,
      
    'compromise': 
      `A compromise approach is used to address the conflict between ${formatFrameworkList(conflict.between)}, finding a middle ground that partially satisfies the key concerns of each framework.`,
      
    'procedural': 
      `The conflict between ${formatFrameworkList(conflict.between)} is addressed through a procedural approach that ensures fair consideration of all relevant ethical perspectives before reaching a determination.`,
      
    'meta_ethical': 
      `The tension between ${formatFrameworkList(conflict.between)} is analyzed at a meta-ethical level, examining the foundational assumptions of each framework to arrive at a more comprehensive ethical understanding.`,
      
    'stakeholder_compromise': 
      `Resolving the conflict between ${formatFrameworkList(conflict.between)} focuses on identifying a solution that addresses the concerns of key stakeholders while minimizing ethical harm.`
  };
  
  // Return the appropriate template, or a generic one if not found
  return templates[strategy] || 
    `The conflict between ethical frameworks is resolved by applying ${strategy}, which leads to a recommendation that balances the relevant ethical considerations.`;
}

// Helper functions

/**
 * Identifies patterns in conflicts between frameworks
 * @param {Object} actionGroups - Groups of frameworks organized by their recommended actions
 * @param {Object} frameworkRecommendations - The recommendations from each framework
 * @returns {Array} Identified conflict patterns
 */
function identifyConflictPatterns(actionGroups, frameworkRecommendations) {
  const patterns = [];
  
  // Check for consequentialist vs. deontological divide
  if (actionGroups && 
      (actionGroups['action_a']?.includes('utilitarian') || actionGroups['action_b']?.includes('utilitarian')) &&
      (actionGroups['action_a']?.includes('deontology') || actionGroups['action_b']?.includes('deontology'))) {
    if (actionGroups['action_a']?.includes('utilitarian') && actionGroups['action_b']?.includes('deontology')) {
      patterns.push({
        type: 'consequentialist_deontological_divide',
        description: 'Classical tension between utilitarian outcomes and deontological duties'
      });
    } else if (actionGroups['action_a']?.includes('deontology') && actionGroups['action_b']?.includes('utilitarian')) {
      patterns.push({
        type: 'consequentialist_deontological_divide',
        description: 'Classical tension between deontological duties and utilitarian outcomes'
      });
    }
  }
  
  // Check for individual vs. collective good tension
  if (actionGroups && 
      (actionGroups['action_a']?.includes('care_ethics') || actionGroups['action_b']?.includes('care_ethics')) &&
      (actionGroups['action_a']?.includes('justice') || actionGroups['action_b']?.includes('justice'))) {
    patterns.push({
      type: 'individual_collective_tension',
      description: 'Tension between individual care and collective justice considerations'
    });
  }
  
  // Check for character vs. outcome tension
  if (actionGroups && 
      (actionGroups['action_a']?.includes('virtue_ethics') || actionGroups['action_b']?.includes('virtue_ethics')) &&
      (actionGroups['action_a']?.includes('utilitarian') || actionGroups['action_b']?.includes('utilitarian'))) {
    patterns.push({
      type: 'character_outcome_tension',
      description: 'Tension between character development and outcome optimization'
    });
  }
  
  return patterns;
}

/**
 * Identifies fundamental tensions between ethical frameworks
 * @param {Object} actionGroups - Groups of frameworks organized by their recommended actions
 * @param {Object} frameworkRecommendations - The recommendations from each framework
 * @returns {Array} Identified root tensions
 */
function identifyRootTensions(actionGroups, frameworkRecommendations) {
  const tensions = [];
  
  // Identify tension between different types of values
  tensions.push({
    type: 'value_prioritization',
    description: 'Different frameworks prioritize different ethical values',
    specifics: 'Each ethical framework emphasizes different core values, leading to different recommended actions.'
  });
  
  // Identify methodological tensions
  tensions.push({
    type: 'methodological_differences',
    description: 'Frameworks use different methods to evaluate ethical situations',
    specifics: 'Some frameworks focus on outcomes, others on principles, virtues, or relationships.'
  });
  
  return tensions;
}

/**
 * Assesses possibilities for integrating different frameworks
 * @param {Object} actionGroups - Groups of frameworks organized by their recommended actions
 * @param {Object} frameworkRecommendations - The recommendations from each framework
 * @param {Object} dilemma - The ethical dilemma context
 * @returns {Array} Assessed integration possibilities
 */
function assessIntegrationPossibilities(actionGroups, frameworkRecommendations, dilemma) {
  const possibilities = [];
  
  // Assess hierarchical integration
  possibilities.push({
    type: 'hierarchical_integration',
    description: 'Establish a hierarchy of ethical considerations',
    viability: 0.7,
    approach: 'Prioritize one framework as primary, with others as secondary considerations'
  });
  
  // Assess weighted balance
  possibilities.push({
    type: 'weighted_balance',
    description: 'Assign proportional weights to different ethical perspectives',
    viability: 0.8,
    approach: 'Weight each framework based on contextual relevance to the specific dilemma'
  });
  
  // Assess principled compromise
  possibilities.push({
    type: 'principled_compromise',
    description: 'Find common ground between competing ethical perspectives',
    viability: 0.6,
    approach: 'Identify shared ethical principles and build a solution that honors these commonalities'
  });
  
  return possibilities;
}

/**
 * Formats a list of frameworks into a readable string
 * @param {Array} frameworks - List of framework names
 * @returns {string} Formatted string
 */
function formatFrameworkList(frameworks) {
  if (!frameworks || frameworks.length === 0) {
    return 'ethical frameworks';
  }
  
  if (frameworks.length === 1) {
    return frameworks[0];
  }
  
  if (frameworks.length === 2) {
    return `${frameworks[0]} and ${frameworks[1]}`;
  }
  
  const lastFramework = frameworks[frameworks.length - 1];
  const otherFrameworks = frameworks.slice(0, frameworks.length - 1);
  
  return `${otherFrameworks.join(', ')}, and ${lastFramework}`;
}

/**
 * Determines if a methodology is appropriate for a given context
 * @param {string} framework - The ethical framework
 * @param {string} context - The context of the dilemma
 * @returns {boolean} Whether the methodology is appropriate
 */
function isMethodologyAppropriate(framework, context) {
  // Simple implementation for demonstration
  if (context.includes('emergency') && framework === 'utilitarian') {
    return true; // Utilitarianism may be more appropriate in emergencies
  }
  
  if (context.includes('rights') && framework === 'deontology') {
    return true; // Deontology may be more appropriate when rights are at stake
  }
  
  if (context.includes('character') && framework === 'virtue_ethics') {
    return true; // Virtue ethics may be more appropriate in character development contexts
  }
  
  if (context.includes('vulnerable') && framework === 'care_ethics') {
    return true; // Care ethics may be more appropriate when vulnerable individuals are involved
  }
  
  if (context.includes('fairness') && framework === 'justice') {
    return true; // Justice may be more appropriate in fairness contexts
  }
  
  return false;
}

/**
 * Calculates the difference between the highest and second-highest scores
 * @param {Object} actionScores - Scores for each action
 * @returns {number} The normalized difference between top scores
 */
function getScoreDifference(actionScores) {
  const scores = Object.values(actionScores).sort((a, b) => b - a);
  
  if (scores.length < 2) {
    return 1; // Only one action, maximum confidence
  }
  
  const highestScore = scores[0];
  const secondHighestScore = scores[1];
  
  // Normalize the difference to a 0-1 scale
  return (highestScore - secondHighestScore) / highestScore;
}

/**
 * Generates reasoning for a multi-framework recommendation
 * @param {string} recommendedAction - The recommended action
 * @param {Object} conflict - The conflict being resolved
 * @param {Object} weights - Weights assigned to different frameworks
 * @param {Object} dilemma - The ethical dilemma context
 * @returns {string} Generated reasoning
 */
function generateMultiFrameworkReasoning(recommendedAction, conflict, weights, dilemma) {
  // Format weights into a readable string
  const weightDescriptions = [];
  for (const framework in weights) {
    const percentage = Math.round(weights[framework] * 100);
    weightDescriptions.push(`${framework} (${percentage}%)`);
  }
  
  // Generate the reasoning
  const reasoning = `
    After analyzing the conflict between multiple ethical frameworks,
    the recommended action is ${recommendedAction}.
    
    This recommendation integrates perspectives from ${formatFrameworkList(Object.keys(weights))},
    with relative weights of ${weightDescriptions.join(', ')}.
    
    The integration takes into account the nature of the dilemma,
    the severity of the conflict (${Math.round(conflict.severity * 100)}% severity),
    and the contextual factors that make certain ethical considerations more relevant.
  `;
  
  return reasoning.replace(/\n\s+/g, ' ').trim();
}

/**
 * Identifies critical parameters for a multi-framework conflict
 * @param {Object} conflict - The conflict being analyzed
 * @param {Object} dilemma - The ethical dilemma context
 * @returns {Array} List of critical parameters
 */
function identifyCriticalParameters(conflict, dilemma) {
  const criticalParameters = [];
  
  // Add standard critical parameters based on conflict type
  if (conflict.conflict_nature === 'value_conflict') {
    criticalParameters.push('value_weights', 'ethical_priority');
  } else if (conflict.conflict_nature === 'methodological_conflict') {
    criticalParameters.push('methodology_appropriateness', 'context_specificity');
  }
  
  // Add dilemma-specific parameters if available
  if (dilemma.parameters) {
    const paramKeys = Object.keys(dilemma.parameters);
    
    // Add the first few parameters (if available) as critical
    for (let i = 0; i < Math.min(3, paramKeys.length); i++) {
      if (!criticalParameters.includes(paramKeys[i])) {
        criticalParameters.push(paramKeys[i]);
      }
    }
  }
  
  return criticalParameters;
} 