/**
 * REA Testing Framework Adapter
 * Provides compatibility between the testing framework and the REA system
 */

import testDilemma from './reaTestFramework.js';
import { 
  validateDilemma,
  standardizeResolutionDetail,
  verifyOutputQuality,
  standardizeProcessingMode
} from './reaTestFramework.js';
import { templates, createFromTemplate } from './dilemmaTemplates.js';

// Import needed strategies from dedicated module
import { selectResolutionStrategy, applyResolutionStrategy } from '../resolution/strategies.js';

// Import parameter mapping utilities
import {
  getMappedParameterValue,
  mapActionIdToDilemmaAction,
  mapDilemmaActionToFrameworkAction,
  getActionDescription,
  validateParameterMapping,
  postProcessActionReferences
} from '../utils/parameterMapping.js';

// Import parameter access utility for any direct parameter access
import { getParameterValue } from '../utils/parameterAccess.js';

// Import weight calculation functions from resolution/weighting.js
import { calculateEthicalWeights } from '../resolution/weighting.js';

// TEMPLATE FUNCTIONS - Implemented directly in this file instead of importing
// These functions provide standard templates for different ethical frameworks
// Simple implementation - in production would be in separate template files

/**
 * Get a utilitarian template for justifications
 * @param {string} action - The recommended action
 * @param {Object} params - Parameters for the template
 * @returns {string} A formatted justification
 */
function getUtilitarianTemplate(action, params) {
  if (params.valueA === params.valueB) {
    return `Equal ${params.metricName} values (${params.valueA} vs ${params.valueB}) lead to a default recommendation based on secondary considerations.`;
  }
  
  return `Option ${params.higher} has ${params.ratio === Infinity ? "∞" : params.ratio ? params.ratio.toFixed(1) : '?'}x higher ${params.metricName} ` +
         `(${Math.max(params.valueA, params.valueB)} vs ${Math.min(params.valueA, params.valueB)}) ` +
         `indicating greater overall benefit.`;
}

/**
 * Get a deontological template for justifications
 * @param {string} action - The recommended action
 * @param {Object} params - Parameters for the template
 * @returns {string} A formatted justification
 */
function getDeontologicalTemplate(action, params) {
  if (params.valueA === params.valueB) {
    return `Equal ${params.metricName} values (${params.valueA} vs ${params.valueB}) require deliberation to fulfill competing moral duties.`;
  }
  
  return `Option ${params.higher} has ${params.ratio === Infinity ? "∞" : params.ratio ? params.ratio.toFixed(1) : '?'}x higher ${params.metricName} ` +
         `(${Math.max(params.valueA, params.valueB)} vs ${Math.min(params.valueA, params.valueB)}) ` +
         `presenting stronger moral obligation.`;
}

/**
 * Get a virtue ethics template for justifications
 * @param {string} action - The recommended action
 * @param {Object} params - Parameters for the template
 * @returns {string} A formatted justification
 */
function getVirtueEthicsTemplate(action, params) {
  if (action === 'negotiate_compromises') {
    return `Character virtues of compassion and practical wisdom suggest negotiation.`;
  } else if (action === 'approve_option_b') {
    return `Virtue of courage suggests taking decisive action in urgent situations.`;
  }
  
  return `Option ${params.higher} better expresses moral virtues through a balance of ${params.metricName}.`;
}

/**
 * Get a care ethics template for justifications
 * @param {string} action - The recommended action
 * @param {Object} params - Parameters for the template
 * @returns {string} A formatted justification
 */
function getCareEthicsTemplate(action, params) {
  if (params.valueA === params.valueB) {
    return `Equal ${params.metricName} values (${params.valueA} vs ${params.valueB}) suggest a balanced approach to care relationships.`;
  }
  
  return `Option ${params.higher} has ${params.ratio === Infinity ? "∞" : params.ratio ? params.ratio.toFixed(1) : '?'}x higher ${params.metricName} ` +
         `(${Math.max(params.valueA, params.valueB)} vs ${Math.min(params.valueA, params.valueB)}) ` +
         `supporting critical care relationships.`;
}

/**
 * Get a justice template for justifications
 * @param {string} action - The recommended action
 * @param {Object} params - Parameters for the template
 * @returns {string} A formatted justification
 */
function getJusticeTemplate(action, params) {
  if (params.valueA === params.valueB) {
    return `Equal ${params.metricName} values (${params.valueA} vs ${params.valueB}) shift the focus to fair process rather than outcomes.`;
  }
  
  return `Option ${params.higher} has ${params.ratio === Infinity ? "∞" : params.ratio ? params.ratio.toFixed(1) : '?'}x higher ${params.metricName} ` +
         `(${Math.max(params.valueA, params.valueB)} vs ${Math.min(params.valueA, params.valueB)}) ` +
         `serving more people fairly.`;
}

/**
 * Get a resolution template based on strategy
 * @param {string} strategy - The resolution strategy
 * @param {Object} params - Parameters for the template
 * @returns {string} A formatted reasoning
 */
function getResolutionTemplate(strategy, params) {
  // Create default templates for different strategies
  switch (strategy) {
    case 'framework_balancing':
      return `This resolution balances the ethical considerations from ${params.framework1} and ${params.framework2}. ` +
             `While ${params.framework1} emphasizes ${params.recommendation1}, and ${params.framework2} emphasizes ${params.recommendation2}, ` +
             `a balanced approach weighs the relative importance of each framework in this specific context.`;
             
    case 'principled_priority':
      return `This resolution prioritizes the ethical considerations of one framework over another based on principled reasons. ` +
             `In this case, the principles of one framework take precedence because they more directly address the core ethical issues at stake.`;
             
    case 'duty_bounded_utilitarianism':
      return `This hybrid approach applies utilitarian reasoning within deontological constraints. ` +
             `While maximizing overall benefit is important, this must occur within boundaries set by moral duties and rights.`;
             
    case 'virtue_guided_consequentialism':
      return `This hybrid approach evaluates consequences through the lens of virtuous character. ` +
             `The analysis considers not just what outcomes might occur, but what character traits would be developed through different actions.`;
             
    case 'care_based_justice':
      return `This hybrid approach integrates care ethics with justice principles. ` +
             `Fair distribution is important, but must be contextualized within caring relationships and responsiveness to particular needs.`;
             
    default:
      return `This resolution addresses the conflict between different ethical perspectives, ` +
             `recognizing the tension points while seeking a path forward that respects the key insights from each approach.`;
  }
}

// HYBRID RESOLUTION FUNCTIONS - Simplified implementations

/**
 * Apply duty-bounded utilitarianism hybrid strategy
 * @param {Object} conflict - The conflict to resolve
 * @param {Object} dilemma - The dilemma context
 * @param {Object} frameworkResults - Results from framework analysis
 * @returns {Object} Hybrid resolution result
 */
function applyDutyBoundedUtilitarianism(conflict, dilemma, frameworkResults) {
  const frameworks = conflict.between || [];
  
  // Identify utilitarian and deontology frameworks
  const utilitarianFramework = frameworks.find(fw => fw === 'utilitarian');
  const deontologyFramework = frameworks.find(fw => fw === 'deontology');
  
  // Get recommendations
  const utilRec = utilitarianFramework ? frameworkResults.frameworks[utilitarianFramework] : null;
  const deonRec = deontologyFramework ? frameworkResults.frameworks[deontologyFramework] : null;
  
  // Extract key parameters
  const urgencyA = getMappedParameterValue(dilemma, 'urgency_option_a', 0);
  const urgencyB = getMappedParameterValue(dilemma, 'urgency_option_b', 0);
  const benefitA = getMappedParameterValue(dilemma, 'benefit_per_person_option_a', 0);
  const benefitB = getMappedParameterValue(dilemma, 'benefit_per_person_option_b', 0);
  
  // Define deontological constraints
  const dutyConstraints = {
    respectForPersons: urgencyA > 7 || urgencyB > 7,
    nonMaleficence: true,
    fidelity: true
  };
  
  // Calculate weighted recommendation
  let hybridRecommendation = "";
  if (dutyConstraints.respectForPersons) {
    // When rights are at high risk, prioritize deontological considerations
    hybridRecommendation = deonRec.recommendedAction;
  } else {
    // Otherwise, use utilitarian recommendation
    hybridRecommendation = utilRec.recommendedAction;
  }
  
  // Create weights for the frameworks
  const weights = {
    [utilitarianFramework]: dutyConstraints.respectForPersons ? 0.3 : 0.7,
    [deontologyFramework]: dutyConstraints.respectForPersons ? 0.7 : 0.3
  };
  
  return {
    hybrid_recommendation: hybridRecommendation,
    weights: weights,
    duty_constraints: dutyConstraints,
    utility_analysis: {
      benefit_comparison: benefitA > benefitB ? 'Option A provides more benefit' : 'Option B provides more benefit'
    },
    reasoning: `This hybrid approach applies utilitarian reasoning within deontological constraints. ` +
              `The duty to respect persons ${dutyConstraints.respectForPersons ? 'is highly relevant' : 'is considered'} in this context, ` +
              `and utility calculations are ${dutyConstraints.respectForPersons ? 'bounded by' : 'balanced with'} this fundamental duty.`
  };
}

/**
 * Apply virtue-guided consequentialism hybrid strategy
 * @param {Object} conflict - The conflict to resolve
 * @param {Object} dilemma - The dilemma context
 * @param {Object} frameworkResults - Results from framework analysis
 * @returns {Object} Hybrid resolution result
 */
function applyVirtueGuidedConsequentialism(conflict, dilemma, frameworkResults) {
  const frameworks = conflict.between || [];
  
  // Identify relevant frameworks
  const utilitarianFramework = frameworks.find(fw => fw === 'utilitarian');
  const virtueFramework = frameworks.find(fw => fw === 'virtue_ethics');
  
  // Get recommendations
  const utilRec = utilitarianFramework ? frameworkResults.frameworks[utilitarianFramework] : null;
  const virtueRec = virtueFramework ? frameworkResults.frameworks[virtueFramework] : null;
  
  // Extract key parameters
  const publicOpinion = getMappedParameterValue(dilemma, 'public_opinion', 0);
  const benefitA = getMappedParameterValue(dilemma, 'benefit_per_person_option_a', 0);
  const benefitB = getMappedParameterValue(dilemma, 'benefit_per_person_option_b', 0);
  
  // Identify relevant virtues
  const virtues = {
    courage: publicOpinion > 7,
    wisdom: true,
    justice: true,
    moderation: benefitA === benefitB
  };
  
  // Calculate weighted recommendation
  let hybridRecommendation = "";
  if (virtues.courage) {
    // When courage is needed, lean toward decisive action
    hybridRecommendation = benefitA > benefitB ? 'approve_option_a' : 'approve_option_b';
  } else if (virtues.moderation) {
    // When moderation is called for, consider negotiation
    hybridRecommendation = 'negotiate_compromises';
  } else {
    // Otherwise default to utilitarian recommendation
    hybridRecommendation = utilRec.recommendedAction;
  }
  
  // Create weights
  const weights = {
    [utilitarianFramework]: virtues.courage ? 0.4 : 0.6,
    [virtueFramework]: virtues.courage ? 0.6 : 0.4
  };
  
  return {
    hybrid_recommendation: hybridRecommendation,
    weights: weights,
    virtues: virtues,
    consequence_evaluation: {
      benefit_comparison: benefitA > benefitB ? 'Option A provides more benefit' : 'Option B provides more benefit'
    },
    reasoning: `This hybrid approach evaluates consequences through the lens of virtuous character. ` +
              `The virtue of ${virtues.courage ? 'courage' : 'wisdom'} is particularly relevant in this context, ` +
              `guiding us to ${virtues.courage ? 'take decisive action' : 'consider the broader context of the decision'}.`
  };
}

/**
 * Apply care-based justice hybrid strategy
 * @param {Object} conflict - The conflict to resolve
 * @param {Object} dilemma - The dilemma context
 * @param {Object} frameworkResults - Results from framework analysis
 * @returns {Object} Hybrid resolution result
 */
function applyCareBasedJustice(conflict, dilemma, frameworkResults) {
  const frameworks = conflict.between || [];
  
  // Identify relevant frameworks
  const careFramework = frameworks.find(fw => fw === 'care_ethics');
  const justiceFramework = frameworks.find(fw => fw === 'justice');
  
  // Get recommendations
  const careRec = careFramework ? frameworkResults.frameworks[careFramework] : null;
  const justiceRec = justiceFramework ? frameworkResults.frameworks[justiceFramework] : null;
  
  // Extract key parameters
  const populationA = getMappedParameterValue(dilemma, 'population_served_option_a', 0);
  const populationB = getMappedParameterValue(dilemma, 'population_served_option_b', 0);
  const carePriority = getMappedParameterValue(dilemma, 'specialized_care_importance', 0);
  
  // Identify care relationships
  const careRelationships = {
    vulnerableGroups: carePriority > 7,
    closeCommunity: populationA < populationB && populationA > 0,
    futureGenerations: false
  };
  
  // Calculate justice principles
  const justicePrinciples = {
    fairDistribution: populationA > 0 && populationB > 0,
    prioritizationOfVulnerable: careRelationships.vulnerableGroups,
    proceduralJustice: true
  };
  
  // Calculate weighted recommendation
  let hybridRecommendation = "";
  if (careRelationships.vulnerableGroups && justicePrinciples.prioritizationOfVulnerable) {
    // When vulnerable groups are present, care considerations may take precedence
    hybridRecommendation = careRec.recommendedAction;
  } else if (justicePrinciples.fairDistribution) {
    // Otherwise, justice principles guide the decision
    hybridRecommendation = justiceRec.recommendedAction;
  } else {
    // Fallback
    hybridRecommendation = careRec.recommendedAction;
  }
  
  // Create weights
  const weights = {
    [careFramework]: careRelationships.vulnerableGroups ? 0.7 : 0.3,
    [justiceFramework]: careRelationships.vulnerableGroups ? 0.3 : 0.7
  };
  
  return {
    hybrid_recommendation: hybridRecommendation,
    weights: weights,
    care_relationships: careRelationships,
    justice_principles: justicePrinciples,
    reasoning: `This hybrid approach integrates care ethics with justice principles. ` +
              `The ${careRelationships.vulnerableGroups ? 'needs of vulnerable groups' : 'fair distribution of benefits'} ` +
              `are particularly important in this context, informing how we apply principles of justice.`
  };
}

/**
 * Apply reflective equilibrium hybrid strategy
 * @param {Object} conflict - The conflict to resolve
 * @param {Object} dilemma - The dilemma context
 * @param {Object} frameworkResults - Results from framework analysis
 * @returns {Object} Hybrid resolution result
 */
function applyReflectiveEquilibrium(conflict, dilemma, frameworkResults) {
  // For multi-framework conflicts
  if (conflict.type !== 'multi_framework_conflict') {
    return null; // Only apply hybrid strategies to framework conflicts
  }
  
  const actionGroups = conflict.action_groups || {};
  
  // Count frameworks for each action
  const actionCounts = {};
  Object.entries(actionGroups).forEach(([action, frameworks]) => {
    actionCounts[action] = frameworks.length;
  });
  
  // Find majority action
  let majorityAction = null;
  let maxCount = 0;
  Object.entries(actionCounts).forEach(([action, count]) => {
    if (count > maxCount) {
      maxCount = count;
      majorityAction = action;
    }
  });
  
  // Create weights object with default low weights
  const weights = {};
  Object.keys(frameworkResults.frameworks).forEach(fw => {
    weights[fw] = 0.1;
  });
  
  // Boost weights for frameworks that agree with majority
  actionGroups[majorityAction]?.forEach(fw => {
    weights[fw] = 0.8 / (actionGroups[majorityAction].length || 1);
  });
  
  return {
    hybrid_recommendation: majorityAction,
    weights: weights,
    reasoning: `Using reflective equilibrium, we have balanced competing intuitions and principles ` +
              `to reach a coherent position. The majority view (${actionGroups[majorityAction]?.join(', ')}) ` +
              `points to ${majorityAction}, which represents our best approach to coherence in this case.`
  };
}

// ANALYSIS UTILITY FUNCTIONS - Simple implementations

/**
 * Analyze the nature of a conflict between frameworks
 * @param {string} framework1 - First framework
 * @param {string} framework2 - Second framework
 * @param {Object} rec1 - Recommendation from first framework
 * @param {Object} rec2 - Recommendation from second framework
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Analysis of conflict nature
 */
function analyzeConflictNature(framework1, framework2, rec1, rec2, dilemma) {
  // Simple conflict type determination
  
  // Value conflict: Different core values
  if (
    (framework1 === 'utilitarian' && framework2 === 'deontology') ||
    (framework1 === 'deontology' && framework2 === 'utilitarian') ||
    (framework1 === 'care_ethics' && framework2 === 'justice') ||
    (framework1 === 'justice' && framework2 === 'care_ethics')
  ) {
    return {
      type: 'value',
      details: `Core value conflict between ${framework1} and ${framework2}`,
      requiresMetaEthicalAnalysis: true
    };
  }
  
  // Factual conflict: Same values but different understandings
  if (
    rec1.justification.includes('benefit') && rec2.justification.includes('benefit') ||
    rec1.justification.includes('population') && rec2.justification.includes('population')
  ) {
    return {
      type: 'factual',
      details: `Factual disagreement about key parameters`,
      requiresMetaEthicalAnalysis: false
    };
  }
  
  // Methodological conflict: Different approaches
  return {
    type: 'methodological',
    details: `Different methodological approaches between ${framework1} and ${framework2}`,
    requiresMetaEthicalAnalysis: false
  };
}

/**
 * Determine if conflict is a framework conflict
 * @param {Object} conflict - The conflict to analyze
 * @returns {boolean} Whether it's a framework conflict
 */
function isFrameworkConflict(conflict) {
  return conflict.type === 'framework_conflict';
}

/**
 * Determine if conflict is a value conflict
 * @param {Object} conflict - The conflict to analyze
 * @returns {boolean} Whether it's a value conflict
 */
function isValueConflict(conflict) {
  return conflict.conflict_nature === 'value';
}

/**
 * Determine if conflict is a factual conflict
 * @param {Object} conflict - The conflict to analyze
 * @returns {boolean} Whether it's a factual conflict
 */
function isFactualConflict(conflict) {
  return conflict.conflict_nature === 'factual';
}

/**
 * Determine if conflict is a methodological conflict
 * @param {Object} conflict - The conflict to analyze
 * @returns {boolean} Whether it's a methodological conflict
 */
function isMethodologicalConflict(conflict) {
  return conflict.conflict_nature === 'methodological';
}

/**
 * Analyze the severity of a conflict
 * @param {string} framework1 - First framework
 * @param {string} framework2 - Second framework
 * @param {Object} conflictNature - Nature of the conflict
 * @param {Object} dilemma - The dilemma context
 * @returns {number} Severity score between 0-1
 */
function analyzeConflictSeverity(framework1, framework2, conflictNature, dilemma) {
  // Base severity by conflict type
  let baseSeverity = 0.5;
  
  // Value conflicts are typically more severe
  if (conflictNature.type === 'value') {
    baseSeverity += 0.2;
  }
  
  // Certain framework combinations have historically deeper conflicts
  if (
    (framework1 === 'utilitarian' && framework2 === 'deontology') ||
    (framework1 === 'deontology' && framework2 === 'utilitarian')
  ) {
    baseSeverity += 0.1;
  }
  
  // If meta-ethical analysis is required, severity increases
  if (conflictNature.requiresMetaEthicalAnalysis) {
    baseSeverity += 0.1;
  }
  
  // Cap at 1.0
  return Math.min(1.0, baseSeverity);
}

/**
 * Identify potential compromise areas between frameworks
 * @param {string} framework1 - First framework
 * @param {string} framework2 - Second framework
 * @param {Object} rec1 - Recommendation from first framework
 * @param {Object} rec2 - Recommendation from second framework
 * @param {Object} dilemma - The dilemma context
 * @returns {Array} Potential compromise areas
 */
function identifyCompromiseAreas(framework1, framework2, rec1, rec2, dilemma) {
  const compromiseAreas = [];
  
  // Look for keyword overlaps in justifications
  const justification1 = rec1.justification.toLowerCase();
  const justification2 = rec2.justification.toLowerCase();
  
  // Check for common concerns
  const commonTerms = [
    'benefit', 'harm', 'duty', 'right', 'virtue', 'care', 'relationship', 
    'fair', 'justice', 'population', 'distribution', 'urgency'
  ];
  
  for (const term of commonTerms) {
    if (justification1.includes(term) && justification2.includes(term)) {
      compromiseAreas.push({
        type: 'shared_concern',
        concern: term,
        description: `Both frameworks express concern about ${term}`
      });
    }
  }
  
  // If no shared concerns, suggest a potential hybrid approach
  if (compromiseAreas.length === 0) {
    if (
      (framework1 === 'utilitarian' && framework2 === 'deontology') ||
      (framework1 === 'deontology' && framework2 === 'utilitarian')
    ) {
      compromiseAreas.push({
        type: 'hybrid_approach',
        name: 'duty_bounded_utilitarianism',
        description: 'Consider constrained utilitarian reasoning that respects moral duties'
      });
    } else if (
      (framework1 === 'utilitarian' && framework2 === 'virtue_ethics') ||
      (framework1 === 'virtue_ethics' && framework2 === 'utilitarian')
    ) {
      compromiseAreas.push({
        type: 'hybrid_approach',
        name: 'virtue_guided_consequentialism',
        description: 'Consider outcomes in terms of character development and expression'
      });
    } else if (
      (framework1 === 'justice' && framework2 === 'care_ethics') ||
      (framework1 === 'care_ethics' && framework2 === 'justice')
    ) {
      compromiseAreas.push({
        type: 'hybrid_approach',
        name: 'care_based_justice',
        description: 'Apply justice principles with attention to relationships and context'
      });
    }
  }
  
  return compromiseAreas;
}

/**
 * Analyze interactions between opposing frameworks to identify tension and compromise points
 * Implements Document 9 recommendation for interaction mapping expansion
 * @param {Object} results - The framework results with recommendations
 * @returns {Object} Interaction analysis with tension points and similarity metrics
 */
function analyzeFrameworkInteractions(results) {
  if (!results || !results.frameworks || Object.keys(results.frameworks).length < 2) {
    return { interactions: [], similarityMatrix: {} };
  }
  
  const frameworks = Object.keys(results.frameworks);
  const interactions = [];
  const similarityMatrix = {};
  
  // Initialize similarity matrix
  frameworks.forEach(fw1 => {
    similarityMatrix[fw1] = {};
    frameworks.forEach(fw2 => {
      if (fw1 === fw2) {
        similarityMatrix[fw1][fw2] = 1.0; // Same framework has perfect similarity
      } else {
        similarityMatrix[fw1][fw2] = 0.0; // Initialize to zero similarity
      }
    });
  });
  
  // Compare each pair of frameworks
  for (let i = 0; i < frameworks.length; i++) {
    const fw1 = frameworks[i];
    const framework1 = results.frameworks[fw1];
    
    for (let j = i + 1; j < frameworks.length; j++) {
      const fw2 = frameworks[j];
      const framework2 = results.frameworks[fw2];
      
      // Skip if one of the frameworks doesn't have a recommendation
      if (!framework1.recommendedAction || !framework2.recommendedAction) continue;
      
      // Check if recommendations are different
      const hasConflict = framework1.recommendedAction !== framework2.recommendedAction;
      
      if (hasConflict) {
        // Define tension points
        const tensionPoints = [];
        
        // Check parameter sensitivities for overlaps
        const sharedSensitiveParams = (framework1.parameter_sensitivities || [])
          .filter(param => (framework2.parameter_sensitivities || []).includes(param));
          
        if (sharedSensitiveParams.length > 0) {
          tensionPoints.push({
            type: 'shared_sensitive_parameters',
            parameters: sharedSensitiveParams,
            description: `Both ${fw1} and ${fw2} consider these parameters sensitive but reach different conclusions`
          });
        }
        
        // Check for similar threshold values but different actions
        const commonThresholds = Object.keys(framework1.sensitivity_thresholds || {})
          .filter(key => Object.keys(framework2.sensitivity_thresholds || {}).includes(key));
          
        commonThresholds.forEach(param => {
          const threshold1 = framework1.sensitivity_thresholds[param];
          const threshold2 = framework2.sensitivity_thresholds[param];
          
          if (threshold1 && threshold2) {
            const thresholdDiff = Math.abs(
              (threshold1.increase_threshold || 0) - (threshold2.increase_threshold || 0)
            );
            
            if (thresholdDiff < 2) { // Similar thresholds
              tensionPoints.push({
                type: 'similar_thresholds_different_actions',
                parameter: param,
                thresholdDiff,
                description: `${fw1} and ${fw2} have similar sensitivity thresholds for ${param} but recommend different actions`
              });
            }
          }
        });
        
        // Calculate similarity score based on shared sensitivities and justification content
        let similarityScore = 0;
        
        // 1. Add points for shared sensitive parameters
        similarityScore += sharedSensitiveParams.length * 0.1;
        
        // 2. Add points for similar justification language
        const justification1Words = (framework1.justification || '').toLowerCase().split(/\s+/);
        const justification2Words = (framework2.justification || '').toLowerCase().split(/\s+/);
        
        const commonWords = justification1Words.filter(word => 
          word.length > 4 && justification2Words.includes(word)
        );
        
        similarityScore += commonWords.length * 0.02;
        
        // 3. Subtract points for contradictory statements
        const contradictionTerms = [
          { fw1: 'more', fw2: 'less' },
          { fw1: 'higher', fw2: 'lower' },
          { fw1: 'better', fw2: 'worse' },
          { fw1: 'increase', fw2: 'decrease' }
        ];
        
        const hasContradictions = contradictionTerms.some(pair => 
          justification1Words.includes(pair.fw1) && justification2Words.includes(pair.fw2) ||
          justification1Words.includes(pair.fw2) && justification2Words.includes(pair.fw1)
        );
        
        if (hasContradictions) {
          similarityScore -= 0.2;
        }
        
        // Potential compromise areas
        const compromiseAreas = [];
        
        // Look for common words related to values in justifications
        const valueTerms = ['value', 'benefit', 'care', 'right', 'duty', 'virtue', 'justice', 'fairness'];
        const commonValueTerms = valueTerms.filter(term => 
          justification1Words.includes(term) && justification2Words.includes(term)
        );
        
        if (commonValueTerms.length > 0) {
          compromiseAreas.push({
            type: 'shared_values',
            values: commonValueTerms,
            description: `Both frameworks agree on the importance of ${commonValueTerms.join(', ')}`
          });
          
          similarityScore += 0.1;
        }
        
        // Ensure similarity is between 0 and 1
        similarityScore = Math.max(0, Math.min(1, similarityScore));
        
        // Update similarity matrix
        similarityMatrix[fw1][fw2] = similarityScore;
        similarityMatrix[fw2][fw1] = similarityScore;
        
        // Add to interactions
        interactions.push({
          frameworks: [fw1, fw2],
          hasConflict,
          tensionPoints,
          similarityScore,
          compromiseAreas
        });
      } else {
        // Frameworks agree on action
        similarityMatrix[fw1][fw2] = 0.8; // High similarity when they agree
        similarityMatrix[fw2][fw1] = 0.8;
        
        interactions.push({
          frameworks: [fw1, fw2],
          hasConflict: false,
          agreedAction: framework1.recommendedAction,
          similarityScore: 0.8,
          reinforcingFactors: [
            {
              type: 'action_agreement',
              description: `Both ${fw1} and ${fw2} recommend the same action: ${framework1.recommendedAction}`
            }
          ]
        });
      }
    }
  }
  
  return {
    interactions,
    similarityMatrix
  };
}

/**
 * Process an ethical dilemma through different frameworks - adapter for REA system
 * Enhanced with validation and action reference resolution
 * @param {Object} dilemma - The dilemma to analyze
 * @returns {Object} Framework analysis results
 */
export function processEthicalDilemma(dilemma) {
  console.log(`Processing dilemma via adapter: ${dilemma.id}`);
  
  // Apply processing mode standardization
  const processingModeResult = standardizeProcessingMode(dilemma, dilemma.processing_mode || "standard");
  if (!processingModeResult.isValid) {
    console.warn('Processing mode standardization found issues:');
    processingModeResult.issues.forEach(issue => console.warn(` - ${issue}`));
  }
  
  // Use the standardized dilemma for further processing
  const standardizedDilemma = processingModeResult.standardizedDilemma;
  
  // Validate parameter mappings before processing
  const validationResult = validateParameterMapping(standardizedDilemma);
  if (!validationResult.isValid) {
    console.warn('Parameter mapping validation failed:');
    validationResult.errors.forEach(error => console.warn(` - ${error}`));
  }
  
  // Log validation warnings
  if (validationResult.warnings.length > 0) {
    console.warn('Parameter validation warnings:');
    validationResult.warnings.forEach(warning => console.warn(` - ${warning}`));
  }
  
  // Log suggested fixes
  if (validationResult.fixes.length > 0) {
    console.info('Suggested fixes for validation issues:');
    validationResult.fixes.forEach(fix => console.info(` - ${fix.suggestion}`));
  }
  
  // Ensure dilemma has required fields
  if (!standardizedDilemma.frameworks) {
    standardizedDilemma.frameworks = ['utilitarian', 'justice', 'deontology', 'care_ethics', 'virtue_ethics'];
  }
  
  // Create result template
  const results = {
    dilemmaId: standardizedDilemma.id,
    frameworks: {},
    stakeholderImpacts: {},
    validation: {
      warnings: [...validationResult.warnings],
      fixes: [...validationResult.fixes],
      processingModeIssues: processingModeResult.issues
    },
    processing_mode: standardizedDilemma.processing_mode || "standard"
  };
  
  // Analyze through each framework
  standardizedDilemma.frameworks.forEach(framework => {
    const recommendation = getFrameworkRecommendation(standardizedDilemma, framework);
    
    // Collect validation warnings from framework-specific processing
    if (recommendation.validationInfo) {
      results.validation.warnings.push(
        ...recommendation.validationInfo.warnings.map(w => `[${framework}] ${w}`)
      );
      results.validation.fixes.push(
        ...recommendation.validationInfo.fixes.map(f => ({...f, framework}))
      );
    }
    
    // Perform sensitivity analysis for this framework
    const sensitivityAnalysis = performSensitivityAnalysis(standardizedDilemma, framework);
    
    // Store recommendation in results
    results.frameworks[framework] = {
      recommendedAction: recommendation.recommendedAction,
      justification: recommendation.justification,
      parameter_sensitivities: sensitivityAnalysis.sensitivities,
      sensitivity_thresholds: sensitivityAnalysis.thresholds
    };
  });
  
  // Calculate meaningful stakeholder impacts instead of random values
  standardizedDilemma.stakeholders?.forEach(stakeholder => {
    // Base impact factors
    let alignmentScore = 0.5; // Neutral starting point
    let parameterScore = 0.5; // Neutral starting point
    
    // Parse stakeholder concerns
    const stakeholderType = stakeholder.id.toLowerCase();
    const stakeholderConcerns = typeof stakeholder.concerns === 'string' 
      ? stakeholder.concerns.toLowerCase() 
      : '';
    
    // Assess parameter alignment with stakeholder concerns
    if (standardizedDilemma.parameters) {
      if (stakeholderType.includes('migrant') || 
          stakeholderConcerns.includes('humanitarian')) {
        // Higher humanitarian benefit and lower deportation risk are positive for migrants
        const humanitarianBenefit = getMappedParameterValue(standardizedDilemma, 'humanitarian_benefit', 5);
        const deportationRisk = getMappedParameterValue(standardizedDilemma, 'deportation_expansion', 5);
        parameterScore = (humanitarianBenefit / 10) * (1 - deportationRisk / 10);
      } 
      else if (stakeholderType.includes('base') || 
               stakeholderConcerns.includes('progressive')) {
        // Progressive base cares about humanitarian aspects and dislikes political compromise
        const humanitarianBenefit = getMappedParameterValue(standardizedDilemma, 'humanitarian_benefit', 5);
        const baseAlienation = getMappedParameterValue(standardizedDilemma, 'base_alienation', 5);
        parameterScore = (humanitarianBenefit / 10) * (1 - baseAlienation / 10);
      }
      else if (stakeholderType.includes('voter') || 
               stakeholderConcerns.includes('bipartisan')) {
        // Swing voters care about bipartisanship and public opinion
        const bipartisanValue = getMappedParameterValue(standardizedDilemma, 'bipartisan_value', 5);
        const publicOpinion = getMappedParameterValue(standardizedDilemma, 'public_opinion', 5);
        parameterScore = (bipartisanValue / 10) * (publicOpinion / 10);
      }
      else if (stakeholderType.includes('dem') || stakeholderType.includes('party')) {
        // Party leadership and vulnerable Dems care about political benefit
        const politicalBenefit = getMappedParameterValue(standardizedDilemma, 'political_benefit', 5);
        parameterScore = politicalBenefit / 10;
      }
    }
    
    // Calculate overall impact score
    // Use stakeholder influence to weight the impact
    const influenceWeight = stakeholder.influence || 0.5;
    const impactScore = parameterScore * influenceWeight;
    
    // Generate appropriate explanation
    let explanation;
    if (impactScore > 0.7) {
      explanation = `Strong positive impact on ${stakeholder.name} based on their concerns`;
    } else if (impactScore > 0.5) {
      explanation = `Moderate positive impact on ${stakeholder.name} based on their concerns`;
    } else if (impactScore > 0.3) {
      explanation = `Slight positive impact on ${stakeholder.name} based on their concerns`;
    } else {
      explanation = `Limited or negative impact on ${stakeholder.name} based on their concerns`;
    }
    
    // Store the calculated impact
    results.stakeholderImpacts[stakeholder.id] = {
      impact: impactScore,
      explanation: explanation
    };
  });
  
  // NEW: Perform framework interaction analysis (Document 9 recommendation)
  const frameworkInteractions = analyzeFrameworkInteractions(results);
  results.frameworkInteractions = frameworkInteractions;
  
  // Post-process action references to ensure consistency
  const processedResults = postProcessActionReferences(results, standardizedDilemma);
  
  // Verify output quality before returning
  const qualityVerification = verifyOutputQuality(processedResults);
  if (!qualityVerification.isValid) {
    console.warn('Output quality verification failed:');
    qualityVerification.issues.forEach(issue => console.warn(` - ${issue}`));
  }
  
  // Add quality verification information to results
  processedResults.validation.qualityIssues = qualityVerification.issues;
  processedResults.validation.qualityRecommendations = qualityVerification.recommendations;
  
  return processedResults;
}

/**
 * Perform sensitivity analysis to determine how changes in parameters
 * affect recommendations for a specific framework
 * @param {Object} dilemma - The dilemma to analyze
 * @param {string} framework - The ethical framework to use
 * @returns {Object} Sensitivity analysis results including sensitive parameters and thresholds
 */
function performSensitivityAnalysis(dilemma, framework) {
  // Clone the dilemma to avoid modifying the original
  const baseDilemma = JSON.parse(JSON.stringify(dilemma));
  
  // Get the baseline recommendation
  const baseRecommendation = getFrameworkRecommendation(baseDilemma, framework);
  const baseAction = baseRecommendation.recommendedAction;
  
  // Initialize results
  const sensitivities = [];
  const thresholds = {};
  
  // AUTO-CALCULATE THRESHOLDS FOR CARE_ETHICS WHEN MISSING
  // This addresses the Document 9 recommendation for automatic calculation of missing sensitivity thresholds
  if (framework === 'care_ethics') {
    // Ensure we always calculate these critical parameters for care_ethics
    const criticalCareParams = ['humanitarian_benefit', 'deportation_expansion', 'family_impact', 'community_impact'];
    
    // Check if critical parameters exist in the dilemma
    criticalCareParams.forEach(param => {
      if (baseDilemma.parameters[param] && typeof baseDilemma.parameters[param].value === 'number') {
        // Add to the list to ensure we test this parameter
        if (!thresholds[param]) {
          thresholds[param] = {
            original: baseDilemma.parameters[param].value,
            description: baseDilemma.parameters[param].description || param,
            increase_threshold: null,
            decrease_threshold: null
          };
        }
      }
    });
  }
  
  // Test each parameter for sensitivity
  for (const [paramKey, paramObj] of Object.entries(baseDilemma.parameters)) {
    // Skip parameters that don't have a numeric value
    if (typeof paramObj.value !== 'number') continue;
    
    const originalValue = paramObj.value;
    const paramDescription = paramObj.description || paramKey;
    
    // Test decreasing the parameter value
    const decreaseThreshold = findThreshold(
      baseDilemma, 
      framework, 
      paramKey, 
      originalValue, 
      'decrease', 
      baseAction
    );
    
    // Test increasing the parameter value
    const increaseThreshold = findThreshold(
      baseDilemma, 
      framework, 
      paramKey, 
      originalValue, 
      'increase', 
      baseAction
    );
    
    // Calculate sensitivity score based on thresholds
    // If a small change causes the recommendation to flip, the parameter is highly sensitive
    let sensitivityScore = 0;
    
    if (decreaseThreshold !== null) {
      // Calculate how much decrease is needed as a percentage of original
      const decreasePct = (originalValue - decreaseThreshold) / originalValue;
      sensitivityScore += (1 - decreasePct); // Higher score for smaller percent change
    }
    
    if (increaseThreshold !== null) {
      // Calculate how much increase is needed as a percentage of original
      const increasePct = (increaseThreshold - originalValue) / originalValue;
      sensitivityScore += (1 - increasePct); // Higher score for smaller percent change
    }
    
    // If no thresholds found, parameter has low sensitivity
    if (decreaseThreshold === null && increaseThreshold === null) {
      sensitivityScore = 0.1; // Still slightly sensitive
    } else {
      // Normalize to 0-1 range
      sensitivityScore = Math.min(sensitivityScore, 1);
    }
    
    // If sensitivity is significant, add to sensitivities list
    if (sensitivityScore > 0.3) {
      sensitivities.push(paramKey);
      
      // Record threshold values
      thresholds[paramKey] = {
        parameter: paramKey,
        description: paramDescription,
        original_value: originalValue,
        decrease_threshold: decreaseThreshold,
        increase_threshold: increaseThreshold,
        sensitivity_score: sensitivityScore.toFixed(2),
        base_action: baseAction,
        action_changes: {}
      };
      
      // Determine what actions appear at thresholds
      let hasActionChange = false;
      if (decreaseThreshold !== null) {
        const testDilemma = JSON.parse(JSON.stringify(baseDilemma));
        testDilemma.parameters[paramKey].value = decreaseThreshold;
        const decreaseRec = getFrameworkRecommendation(testDilemma, framework);
        thresholds[paramKey].action_changes["decrease"] = decreaseRec.recommendedAction;
        
        // Only count as a change if it's a different action
        if (decreaseRec.recommendedAction !== baseAction) {
          hasActionChange = true;
        }
      }
      
      if (increaseThreshold !== null) {
        const testDilemma = JSON.parse(JSON.stringify(baseDilemma));
        testDilemma.parameters[paramKey].value = increaseThreshold;
        const increaseRec = getFrameworkRecommendation(testDilemma, framework);
        thresholds[paramKey].action_changes["increase"] = increaseRec.recommendedAction;
        
        // Only count as a change if it's a different action
        if (increaseRec.recommendedAction !== baseAction) {
          hasActionChange = true;
        }
      }
      
      // Only include parameters that actually cause action changes
      if (!hasActionChange) {
        // Remove from sensitivities if it doesn't cause action changes
        sensitivities.splice(sensitivities.indexOf(paramKey), 1);
        delete thresholds[paramKey];
      }
    }
  }
  
  // Sort sensitivities by importance based on thresholds
  sensitivities.sort((a, b) => {
    const scoreA = thresholds[a]?.sensitivity_score || 0;
    const scoreB = thresholds[b]?.sensitivity_score || 0;
    return scoreB - scoreA;
  });
  
  return {
    sensitivities,
    thresholds
  };
}

/**
 * Find the threshold value where a recommendation changes
 * @param {Object} dilemma - The dilemma to analyze
 * @param {string} framework - The ethical framework
 * @param {string} paramKey - The parameter to modify
 * @param {number} originalValue - Original parameter value
 * @param {string} direction - 'increase' or 'decrease'
 * @param {string} baseAction - The baseline recommended action
 * @returns {number|null} Threshold value or null if no threshold found
 */
function findThreshold(dilemma, framework, paramKey, originalValue, direction, baseAction) {
  // Clone the dilemma to avoid modifying the original
  const testDilemma = JSON.parse(JSON.stringify(dilemma));
  
  // Determine step size (10% of original value or at least 1)
  const stepSize = Math.max(Math.abs(originalValue * 0.1), 1);
  
  // Set limits for testing (50% change in either direction)
  let minTest = direction === 'decrease' ? originalValue * 0.5 : originalValue;
  let maxTest = direction === 'increase' ? originalValue * 1.5 : originalValue;
  
  // First do a coarse check if there's any threshold to find
  let foundThreshold = false;
  
  // Test the extreme value
  testDilemma.parameters[paramKey].value = direction === 'increase' ? maxTest : minTest;
  const extremeRec = getFrameworkRecommendation(testDilemma, framework);
  
  // Convert framework action to dilemma action (if needed) for comparison
  const baseActionFramework = mapDilemmaActionToFrameworkAction(dilemma, baseAction);
  const extremeAction = mapDilemmaActionToFrameworkAction(dilemma, extremeRec.recommendedAction);
  
  // If the extreme value doesn't change the recommendation, there's no threshold
  if (extremeAction === baseActionFramework) {
    return null;
  }
  
  // Binary search for the threshold
  let low = direction === 'increase' ? originalValue : minTest;
  let high = direction === 'increase' ? maxTest : originalValue;
  
  // Limit search iterations to prevent infinite loops
  let iterations = 0;
  const maxIterations = 10;
  
  while (high - low > stepSize * 0.1 && iterations < maxIterations) {
    iterations++;
    
    const mid = (low + high) / 2;
    testDilemma.parameters[paramKey].value = mid;
    const midRec = getFrameworkRecommendation(testDilemma, framework);
    
    // Convert to framework action for comparison
    const midAction = mapDilemmaActionToFrameworkAction(dilemma, midRec.recommendedAction);
    
    if (midAction === baseActionFramework) {
      // Haven't crossed threshold yet
      if (direction === 'increase') {
        low = mid;
      } else {
        high = mid;
      }
    } else {
      // Have crossed threshold
      if (direction === 'increase') {
        high = mid;
      } else {
        low = mid;
      }
    }
  }
  
  // Return the threshold (midpoint of final range)
  return Math.round((low + high) / 2 * 100) / 100; // Round to 2 decimal places
}

/**
 * Detect conflicts in a dilemma - enhanced with improved analysis
 * @param {Object} dilemma - The dilemma to analyze
 * @returns {Object} Detected conflicts with enhanced analysis
 */
export function detectConflicts(dilemma) {
  console.log(`Detecting conflicts via adapter for: ${dilemma.id}`);
  
  const conflicts = [];
  const interactions = []; // To store framework interactions
  
  // Get all unique pairs of frameworks
  const frameworks = dilemma.frameworks || [];
  
  // First, process dilemma through each framework to get recommendations
  const frameworkRecommendations = {};
  frameworks.forEach(framework => {
    const recommendation = getFrameworkRecommendation(dilemma, framework);
    if (recommendation) {
      frameworkRecommendations[framework] = recommendation;
    }
  });
  
  // Dynamically detect conflicts based on contradictory recommendations
  for (let i = 0; i < frameworks.length; i++) {
    for (let j = i + 1; j < frameworks.length; j++) {
      const framework1 = frameworks[i];
      const framework2 = frameworks[j];
      
      const rec1 = frameworkRecommendations[framework1];
      const rec2 = frameworkRecommendations[framework2];
      
      // Skip if we don't have recommendations for both frameworks
      if (!rec1 || !rec2) continue;
      
      // Detect conflict if recommendations differ
      if (rec1.recommendedAction !== rec2.recommendedAction) {
        // NEW: Use enhanced conflict analysis
        const conflictNature = analyzeConflictNature(framework1, framework2, rec1, rec2, dilemma);
        const severity = analyzeConflictSeverity(framework1, framework2, conflictNature, dilemma);
        const compromiseAreas = identifyCompromiseAreas(framework1, framework2, rec1, rec2, dilemma);
        
        // Create conflict with enhanced analysis
        const conflict = {
          type: 'framework_conflict',
          between: [framework1, framework2],
          description: generateConflictDescription(framework1, framework2, rec1, rec2),
          severity: severity,
          recommendations: {
            [framework1]: rec1.recommendedAction,
            [framework2]: rec2.recommendedAction
          },
          justifications: {
            [framework1]: rec1.justification,
            [framework2]: rec2.justification
          },
          // Enhanced fields from analysis.js
          conflict_nature: conflictNature.type,
          conflict_details: conflictNature.details,
          compromise_areas: compromiseAreas,
          requires_meta_ethical_analysis: conflictNature.requiresMetaEthicalAnalysis || false
        };
        
        conflicts.push(conflict);
      } else {
        // Use enhanced analysis for framework interactions as well
        const interaction = analyzeFrameworkInteraction(
          framework1, 
          framework2, 
          rec1, 
          rec2,
          dilemma
        );
        
        interactions.push(interaction);
      }
    }
  }
  
  // Detect multi-framework conflicts with enhanced analysis
  const actionGroups = {};
  
  // Group frameworks by recommended action
  Object.entries(frameworkRecommendations).forEach(([framework, recommendation]) => {
    const action = recommendation.recommendedAction;
    if (!actionGroups[action]) {
      actionGroups[action] = [];
    }
    actionGroups[action].push(framework);
  });
  
  // If we have multiple action groups, we have a multi-framework conflict
  if (Object.keys(actionGroups).length > 1) {
    // NEW: Analyze the multi-framework conflict more thoroughly
    const multiFrameworkAnalysis = analyzeMultiFrameworkConflict(actionGroups, frameworkRecommendations, dilemma);
    
    const multiConflict = {
      type: 'multi_framework_conflict',
      action_groups: actionGroups,
      description: 'Multiple ethical frameworks recommend different actions',
      severity: multiFrameworkAnalysis.severity || 0.8,
      recommendations: {},
      justifications: {},
      // Enhanced analysis fields
      conflict_patterns: multiFrameworkAnalysis.patterns,
      root_tensions: multiFrameworkAnalysis.rootTensions,
      integration_possibilities: multiFrameworkAnalysis.integrationPossibilities
    };
    
    // Add details for each framework
    Object.entries(frameworkRecommendations).forEach(([framework, recommendation]) => {
      multiConflict.recommendations[framework] = recommendation.recommendedAction;
      multiConflict.justifications[framework] = recommendation.justification;
    });
    
    conflicts.push(multiConflict);
  }
  
  // If we have only one action group with 3+ frameworks, we have a significant consensus
  else if (Object.keys(actionGroups).length === 1 && 
           Object.values(actionGroups)[0].length >= 3) {
    
    const consensusAction = Object.keys(actionGroups)[0];
    const consensusFrameworks = Object.values(actionGroups)[0];
    
    interactions.push({
      type: 'multi_framework_consensus',
      frameworks: consensusFrameworks,
      description: 'Multiple ethical frameworks agree on the same action',
      strength: 0.8, // High strength for multi-framework consensus
      recommendedAction: consensusAction,
      justifications: consensusFrameworks.reduce((acc, framework) => {
        acc[framework] = frameworkRecommendations[framework].justification;
        return acc;
      }, {})
    });
  }
  
  // Generate some conflicts based on stakeholder interests
  if (dilemma.stakeholders && dilemma.stakeholders.length > 1) {
    for (let i = 0; i < dilemma.stakeholders.length - 1; i++) {
      for (let j = i + 1; j < dilemma.stakeholders.length; j++) {
        const stakeholderA = dilemma.stakeholders[i];
        const stakeholderB = dilemma.stakeholders[j];
        
        // Ensure concerns are arrays
        const concernsA = Array.isArray(stakeholderA.concerns) ? stakeholderA.concerns : [];
        const concernsB = Array.isArray(stakeholderB.concerns) ? stakeholderB.concerns : [];
        
        // Check for overlapping concerns but potentially different values
        const sharedConcerns = concernsA.filter(concern => concernsB.includes(concern));
        
        if (sharedConcerns.length > 0) {
          conflicts.push({
            type: 'stakeholder_conflict',
            between: [stakeholderA.id, stakeholderB.id],
            concerns: sharedConcerns,
            description: `Conflicting interests between ${stakeholderA.name} and ${stakeholderB.name} regarding ${sharedConcerns.join(', ')}`,
            severity: 0.6
          });
        }
      }
    }
  }
  
  return {
    conflicts,
    interactions,
    metadata: {
      conflict_count: conflicts.length,
      framework_conflicts: conflicts.filter(c => c.type === 'framework_conflict').length,
      multi_framework_conflicts: conflicts.filter(c => c.type === 'multi_framework_conflict').length,
      stakeholder_conflicts: conflicts.filter(c => c.type === 'stakeholder_conflict').length,
      interaction_count: interactions.length,
      pair_interactions: interactions.filter(i => i.type === 'framework_interaction').length,
      multi_framework_consensus: interactions.filter(i => i.type === 'multi_framework_consensus').length,
      // Enhanced metadata from analysis.js
      value_conflicts: conflicts.filter(c => c.conflict_nature === 'value').length,
      factual_conflicts: conflicts.filter(c => c.conflict_nature === 'factual').length,
      methodological_conflicts: conflicts.filter(c => c.conflict_nature === 'methodological').length,
      meta_ethical_conflicts: conflicts.filter(c => c.requires_meta_ethical_analysis).length
    }
  };
}

/**
 * Enhanced analysis of multi-framework conflicts
 * @param {Object} actionGroups - Groups of frameworks by recommended action
 * @param {Object} recommendations - Framework recommendations
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Enhanced conflict analysis
 */
function analyzeMultiFrameworkConflict(actionGroups, recommendations, dilemma) {
  // Identify patterns in the conflict
  const patterns = {};
  
  // Check for consequentialist vs non-consequentialist division
  const consequentialistFrameworks = ['utilitarian'];
  const nonConsequentialistFrameworks = ['deontology', 'virtue_ethics', 'care_ethics'];
  
  let consequentialistActions = [];
  let nonConsequentialistActions = [];
  
  // Collect actions from different ethical traditions
  Object.entries(actionGroups).forEach(([action, frameworks]) => {
    if (frameworks.some(fw => consequentialistFrameworks.includes(fw))) {
      consequentialistActions.push(action);
    }
    if (frameworks.some(fw => nonConsequentialistFrameworks.includes(fw))) {
      nonConsequentialistActions.push(action);
    }
  });
  
  // Determine if there's a consequentialist vs non-consequentialist pattern
  if (consequentialistActions.length > 0 && nonConsequentialistActions.length > 0 &&
      !consequentialistActions.some(a => nonConsequentialistActions.includes(a))) {
    patterns.consequentialist_divide = {
      consequentialist_actions: consequentialistActions,
      non_consequentialist_actions: nonConsequentialistActions
    };
  }
  
  // Calculate severity based on the number of different recommendations and their distribution
  const actionCount = Object.keys(actionGroups).length;
  const maxFrameworksPerAction = Math.max(...Object.values(actionGroups).map(a => a.length));
  const totalFrameworks = Object.values(actionGroups).flat().length;
  
  // Higher severity when we have more actions and more even distribution
  const severityBase = 0.5 + (0.1 * (actionCount - 1));
  const severityDistribution = 0.3 * (1 - (maxFrameworksPerAction / totalFrameworks));
  
  const severity = Math.min(1.0, severityBase + severityDistribution);
  
  // Identify root tensions
  const rootTensions = [];
  
  // Look for different foundational principles
  if (patterns.consequentialist_divide) {
    rootTensions.push({
      type: 'foundational_principles',
      description: 'Tension between outcome-focused and principle-focused moral reasoning'
    });
  }
  
  // Look for tensions about which stakeholders matter most
  const stakeholderFocuses = {};
  Object.entries(recommendations).forEach(([framework, rec]) => {
    // Extract stakeholder references from justifications
    const justification = rec.justification.toLowerCase();
    dilemma.stakeholders?.forEach(stakeholder => {
      if (stakeholder.name && justification.includes(stakeholder.name.toLowerCase())) {
        if (!stakeholderFocuses[framework]) stakeholderFocuses[framework] = [];
        stakeholderFocuses[framework].push(stakeholder.id);
      }
    });
  });
  
  // Check if frameworks focus on different stakeholders
  const allStakeholderFocuses = new Set(Object.values(stakeholderFocuses).flat());
  if (allStakeholderFocuses.size > 1) {
    rootTensions.push({
      type: 'stakeholder_priorities',
      description: 'Different frameworks prioritize different stakeholders',
      stakeholder_focuses: stakeholderFocuses
    });
  }
  
  // Identify integration possibilities
  const integrationPossibilities = [];
  
  // Check if hybrid approaches might be appropriate
  if (patterns.consequentialist_divide) {
    integrationPossibilities.push({
      type: 'hybrid_approach',
      description: 'Bounded consequentialism - apply utilitarian reasoning within deontological constraints',
      score: 0.8
    });
  }
  
  // Check if virtue ethics could provide a meta-perspective
  if (Object.keys(actionGroups).includes('virtue_ethics')) {
    integrationPossibilities.push({
      type: 'virtue_meta_perspective',
      description: 'Use virtue ethics to evaluate the character traits that would be developed by each approach',
      score: 0.7
    });
  }
  
  return {
    patterns,
    severity,
    rootTensions,
    integrationPossibilities
  };
}

/**
 * Analyze how frameworks interact when they agree on actions
 * @param {string} framework1 - First framework name
 * @param {string} framework2 - Second framework name
 * @param {Object} rec1 - Recommendation from first framework
 * @param {Object} rec2 - Recommendation from second framework
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Interaction analysis
 */
function analyzeFrameworkInteraction(framework1, framework2, rec1, rec2, dilemma) {
  // Frameworks agree on action but may have different justifications
  const interaction = {
    type: 'framework_interaction',
    frameworks: [framework1, framework2],
    recommendedAction: rec1.recommendedAction,
    justifications: {
      [framework1]: rec1.justification,
      [framework2]: rec2.justification
    }
  };
  
  // Calculate interaction strength (inverse of distance)
  // Similar frameworks agreeing is less noteworthy than dissimilar ones
  const distance = calculateFrameworkDistance(framework1, framework2, dilemma);
  interaction.strength = 1 - (distance * 0.5); // Scale to range 0.5 to 1.0
  
  // Analyze justification similarity
  const justificationSimilarity = calculateJustificationSimilarity(rec1.justification, rec2.justification);
  interaction.justification_similarity = justificationSimilarity;
  
  // Determine interaction type based on justification similarity
  if (justificationSimilarity > 0.7) {
    interaction.interaction_type = 'strong_reinforcement';
    interaction.description = `${framework1} and ${framework2} strongly reinforce each other, arriving at the same conclusion through similar reasoning`;
  } else if (justificationSimilarity > 0.4) {
    interaction.interaction_type = 'moderate_reinforcement';
    interaction.description = `${framework1} and ${framework2} moderately reinforce each other, arriving at the same conclusion with partially aligned reasoning`;
  } else {
    interaction.interaction_type = 'complementary_perspectives';
    interaction.description = `${framework1} and ${framework2} provide complementary perspectives, arriving at the same conclusion through different reasoning paths`;
  }
  
  // Identify the ethical dimensions where frameworks agree
  interaction.shared_ethical_dimensions = identifySharedEthicalDimensions(framework1, framework2, rec1, rec2);
  
  return interaction;
}

/**
 * Calculate similarity between two justification texts
 * @param {string} justification1 - First justification text
 * @param {string} justification2 - Second justification text
 * @returns {number} Similarity score from 0 to 1
 */
function calculateJustificationSimilarity(justification1, justification2) {
  // Simple version: check for common keywords
  const keywords1 = extractKeywords(justification1);
  const keywords2 = extractKeywords(justification2);
  
  // Count shared keywords
  const sharedKeywords = keywords1.filter(keyword => keywords2.includes(keyword));
  const uniqueKeywords = [...new Set([...keywords1, ...keywords2])];
  
  // Calculate Jaccard similarity
  return sharedKeywords.length / uniqueKeywords.length;
}

/**
 * Extract keywords from text
 * @param {string} text - Text to extract keywords from
 * @returns {Array} Array of keywords
 */
function extractKeywords(text) {
  // Convert to lowercase and remove punctuation
  const cleanText = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  
  // Split into words
  const words = cleanText.split(/\s+/);
  
  // Remove common stop words
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
                    'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'against', 'between', 'into', 'through',
                    'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down', 'of', 'off', 'over', 'under',
                    'this', 'that', 'these', 'those', 'it', 'its', 'option', 'vs'];
  
  return words.filter(word => !stopWords.includes(word) && word.length > 2);
}

/**
 * Identify shared ethical dimensions between frameworks
 * @param {string} framework1 - First framework name
 * @param {string} framework2 - Second framework name
 * @param {Object} rec1 - Recommendation from first framework
 * @param {Object} rec2 - Recommendation from second framework
 * @returns {Array} Array of shared ethical dimensions
 */
function identifySharedEthicalDimensions(framework1, framework2, rec1, rec2) {
  // Define ethical dimensions for each framework
  const frameworkDimensions = {
    'utilitarian': ['consequences', 'benefit', 'harm', 'utility', 'welfare'],
    'deontology': ['duty', 'rights', 'autonomy', 'dignity', 'principles'],
    'virtue_ethics': ['character', 'virtue', 'excellence', 'flourishing', 'wisdom'],
    'care_ethics': ['care', 'relationships', 'vulnerability', 'context', 'needs'],
    'justice': ['fairness', 'equality', 'distribution', 'impartiality', 'desert']
  };
  
  // Get keywords from both justifications
  const keywords1 = extractKeywords(rec1.justification);
  const keywords2 = extractKeywords(rec2.justification);
  const allKeywords = [...new Set([...keywords1, ...keywords2])];
  
  // Initialize results
  const sharedDimensions = [];
  
  // Check each ethical dimension to see if it's shared
  const dimensions = [...new Set([...Object.keys(frameworkDimensions[framework1] || {}), 
                                 ...Object.keys(frameworkDimensions[framework2] || {})])];
  
  for (const dimension of dimensions) {
    // Check if keywords from both justifications include this dimension
    const dimensionKeywords = frameworkDimensions[dimension] || [];
    const hasSharedKeywords = dimensionKeywords.some(keyword => allKeywords.includes(keyword));
    
    if (hasSharedKeywords) {
      sharedDimensions.push(dimension);
    }
  }
  
  return sharedDimensions;
}

/**
 * Generate framework justification using templates
 * Replaces the previous formatFrameworkJustification function
 * @param {string} framework - The ethical framework
 * @param {string} action - The recommended action
 * @param {Object} comparisons - Key metrics used in the decision
 * @param {Object} dilemma - The dilemma context for richer templates
 * @returns {string} A standardized justification string
 */
function generateTemplatedJustification(framework, action, comparisons, dilemma = null) {
  // Template parameters
  const params = {
    action,
    metrics: comparisons,
    valueA: comparisons.valueA,
    valueB: comparisons.valueB,
    metricName: comparisons.metricName,
    ratio: calculateRatio(comparisons.valueA, comparisons.valueB),
    higher: comparisons.valueA > comparisons.valueB ? 'A' : 'B',
    dilemma
  };
  
  // Get template based on framework
  let template;
  switch (framework) {
    case 'utilitarian':
      template = getUtilitarianTemplate(action, params);
      break;
    case 'deontology':
      template = getDeontologicalTemplate(action, params);
      break;
    case 'virtue_ethics':
      template = getVirtueEthicsTemplate(action, params);
      break;
    case 'care_ethics':
      template = getCareEthicsTemplate(action, params);
      break;
    case 'justice':
      template = getJusticeTemplate(action, params);
      break;
    default:
      // Fallback to older formatting method
      return formatFrameworkJustification(framework, action, comparisons);
  }
  
  return template;
}

/**
 * Calculate ratio between two values, handling special cases
 * @param {number} a - First value
 * @param {number} b - Second value
 * @returns {number|Infinity} The ratio or Infinity for division by zero
 */
function calculateRatio(a, b) {
  if (a === undefined || b === undefined) return null;
  
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  
  return min > 0 ? max / min : Infinity;
}

/**
 * Generate reasoning for a resolution using templates
 * @param {string} strategy - The resolution strategy
 * @param {Object} conflict - The conflict being resolved
 * @param {Object} dilemma - The dilemma context
 * @returns {string} Generated reasoning
 */
function generateReasoningFromTemplate(strategy, conflict, dilemma) {
  // Template parameters
  const params = {
    strategy,
    conflict,
    dilemma,
    frameworks: conflict.between || [],
    conflictType: conflict.type,
    severity: conflict.severity
  };
  
  // For framework conflicts, add specific framework information
  if (conflict.type === 'framework_conflict' && conflict.between && conflict.between.length === 2) {
    params.framework1 = conflict.between[0];
    params.framework2 = conflict.between[1];
    params.recommendation1 = conflict.recommendations[conflict.between[0]];
    params.recommendation2 = conflict.recommendations[conflict.between[1]];
    params.justification1 = conflict.justifications[conflict.between[0]];
    params.justification2 = conflict.justifications[conflict.between[1]];
  }
  
  return getResolutionTemplate(strategy, params);
}

/**
 * Helper function to get a framework's recommendation for a dilemma
 * Enhanced with zero-value comparison validation
 * @param {Object} dilemma - The dilemma to analyze
 * @param {string} framework - The framework to use
 * @returns {Object} Framework recommendation with validation info
 */
function getFrameworkRecommendation(dilemma, framework) {
  let recommendedAction = 'no_action';
  let justification = 'Default justification';
  const validationInfo = {
    warnings: [],
    fixes: []
  };
  
  if (framework === 'utilitarian') {
    // Utilitarian calculation based on total benefit - using parameter access utility
    let populationA = getMappedParameterValue(dilemma, 'population_served_option_a', 0);
    let benefitA = getMappedParameterValue(dilemma, 'benefit_per_person_option_a', 0);
    let populationB = getMappedParameterValue(dilemma, 'population_served_option_b', 0);
    let benefitB = getMappedParameterValue(dilemma, 'benefit_per_person_option_b', 0);
    
    let totalBenefitA = populationA * benefitA;
    let totalBenefitB = populationB * benefitB;
    
    // Check for zero-value comparisons
    if (populationA === 0 && populationB === 0) {
      validationInfo.warnings.push('Zero-value comparison detected: both populations are zero');
      validationInfo.fixes.push({
        type: 'zero_comparison',
        suggestion: 'Set non-zero population values to enable meaningful utilitarian comparison'
      });
    }
    
    if (benefitA === 0 && benefitB === 0) {
      validationInfo.warnings.push('Zero-value comparison detected: both benefit values are zero');
      validationInfo.fixes.push({
        type: 'zero_comparison',
        suggestion: 'Set non-zero benefit values to enable meaningful utilitarian comparison'
      });
    }
    
    if (totalBenefitA === 0 && totalBenefitB === 0) {
      validationInfo.warnings.push('Meaningless comparison: both total benefits are zero');
      // Apply a default fix to at least differentiate the options
      if (validationInfo.fixes.length === 0) {
        validationInfo.fixes.push({
          type: 'default_resolution',
          suggestion: 'Using default resolution mechanism due to zero-value comparison'
        });
        // Default to option A when comparison is meaningless
        totalBenefitA = 1;
      }
    }
    
    if (totalBenefitA > totalBenefitB) {
      recommendedAction = 'approve_option_a';
    } else {
      recommendedAction = 'approve_option_b';
    }
    
    // Use templated justification instead of old formatting
    justification = generateTemplatedJustification(framework, recommendedAction, {
      metricName: 'total benefit',
      valueA: totalBenefitA,
      valueB: totalBenefitB
    }, dilemma);
  }
  
  // Similar enhancements for other frameworks...
  else if (framework === 'justice') {
    let populationA = getMappedParameterValue(dilemma, 'population_served_option_a', 0);
    let populationB = getMappedParameterValue(dilemma, 'population_served_option_b', 0);
    
    // Check for zero-value comparisons
    if (populationA === 0 && populationB === 0) {
      validationInfo.warnings.push('Zero-value comparison detected: both populations are zero');
      validationInfo.fixes.push({
        type: 'zero_comparison',
        suggestion: 'Set non-zero population values to enable meaningful justice comparison'
      });
      // Apply a default fix
      populationA = 1;
    }
    
    if (populationA > populationB) {
      recommendedAction = 'approve_option_a';
    } else {
      recommendedAction = 'approve_option_b';
    }
    
    // Use templated justification
    justification = generateTemplatedJustification(framework, recommendedAction, {
      metricName: 'population served',
      valueA: populationA,
      valueB: populationB
    }, dilemma);
  }
  
  else if (framework === 'deontology') {
    // Deontological calculation based on urgency and rights
    let urgencyA = getMappedParameterValue(dilemma, 'urgency_option_a', 0);
    let urgencyB = getMappedParameterValue(dilemma, 'urgency_option_b', 0);
    
    // Check for zero-value comparisons
    if (urgencyA === 0 && urgencyB === 0) {
      validationInfo.warnings.push('Zero-value comparison detected: both urgency values are zero');
      validationInfo.fixes.push({
        type: 'zero_comparison',
        suggestion: 'Set non-zero urgency values to enable meaningful deontological comparison'
      });
      // Apply a default fix
      urgencyA = 1;
    }
    
    // Decision based on which option has higher urgency for rights protection
    if (urgencyA > urgencyB) {
      recommendedAction = 'approve_option_a';
    } else if (urgencyB > urgencyA) {
      recommendedAction = 'approve_option_b';
    } else {
      // Equal urgency - default to negotiation when duties conflict equally
      recommendedAction = 'negotiate_compromises';
    }
    
    // Use templated justification
    justification = generateTemplatedJustification(framework, recommendedAction, {
      metricName: 'urgency',
      valueA: urgencyA,
      valueB: urgencyB
    }, dilemma);
  }
  
  else if (framework === 'care_ethics') {
    // Care ethics calculation based on deportation risk and specialized care
    const deportationRisk = getMappedParameterValue(dilemma, 'deportation_risk', 0);
      const specializedCareImportance = getMappedParameterValue(dilemma, 'specialized_care_importance', 0);
      
    // Check for zero-value parameters
    if (deportationRisk === 0 && specializedCareImportance === 0) {
      validationInfo.warnings.push('Zero-value parameters detected in care ethics evaluation');
      validationInfo.fixes.push({
        type: 'zero_comparison',
        suggestion: 'Set non-zero values for care parameters to enable meaningful care ethics evaluation'
      });
    }
    
    // Emphasize harm prevention and care relationships
    if (deportationRisk > 7) {
      // High deportation risk prioritizes harm prevention
      recommendedAction = 'negotiate_compromises';
    } else if (specializedCareImportance > 7) {
      // High care importance prioritizes support
        recommendedAction = 'approve_option_a';
      } else {
      // Default to negotiation when care considerations are mixed
      recommendedAction = 'negotiate_compromises';
    }
    
    // Use templated justification
    justification = generateTemplatedJustification(framework, recommendedAction, {
      metricName: 'care priority',
      valueA: specializedCareImportance,
      valueB: deportationRisk
    }, dilemma);
  }
  
  else if (framework === 'virtue_ethics') {
    // Virtue ethics calculation based on character virtues
    const publicOpinion = getMappedParameterValue(dilemma, 'public_opinion', 0);
    const specializedCareImportance = getMappedParameterValue(dilemma, 'specialized_care_importance', 0);
    const urgencyB = getMappedParameterValue(dilemma, 'urgency_option_b', 0);
    
    // Check for zero-value parameters
    if (publicOpinion === 0 && specializedCareImportance === 0 && urgencyB === 0) {
      validationInfo.warnings.push('Zero-value parameters detected in virtue ethics evaluation');
      validationInfo.fixes.push({
        type: 'zero_comparison',
        suggestion: 'Set non-zero values for virtue-related parameters to enable meaningful virtue ethics evaluation'
      });
    }
    
    // Calculate virtue balance - higher number means negotiate
    const virtueBalance = (specializedCareImportance + publicOpinion) / 2;
    
    if (virtueBalance > 7) {
      recommendedAction = 'negotiate_compromises';
      justification = `Character virtues of compassion and practical wisdom suggest negotiation`;
    } else if (urgencyB > 7) {
      recommendedAction = 'approve_option_b';
      justification = `Virtue of courage suggests taking decisive action in urgent situations`;
    } else {
      recommendedAction = 'negotiate_compromises';
      justification = `Balanced virtues suggest moderate approach`;
    }
    
    // Use templated justification
    justification = generateTemplatedJustification(framework, recommendedAction, {
      metricName: 'virtue balance',
      valueA: publicOpinion,
      valueB: specializedCareImportance,
      dilemma
    }, dilemma);
  }
  
  // Map the framework action ID to the dilemma action ID
  const mappedAction = mapActionIdToDilemmaAction(dilemma, recommendedAction);
  
  return {
    recommendedAction: mappedAction,
    justification,
    validationInfo
  };
}

/**
 * Calculate the ethical "distance" between two frameworks
 * Higher values indicate more fundamentally opposed ethical foundations
 * @param {string} framework1 - First framework
 * @param {string} framework2 - Second framework
 * @param {Object} dilemma - Dilemma context
 * @returns {number} Distance between 0 and 1
 */
function calculateFrameworkDistance(framework1, framework2, dilemma) {
  // Base distances between common ethical frameworks
  const baseDistances = {
    'utilitarian_deontology': 0.7,   // Very different foundations (consequences vs principles)
    'utilitarian_virtue_ethics': 0.5, // Moderately different
    'utilitarian_care_ethics': 0.6,   // Different but some overlap
    'utilitarian_justice': 0.3,       // Some overlap in welfare considerations
    'deontology_virtue_ethics': 0.4,  // Some overlap in character/duty
    'deontology_care_ethics': 0.6,    // Different approaches to moral reasoning
    'deontology_justice': 0.4,        // Some overlap in rights consideration
    'virtue_ethics_care_ethics': 0.3, // Significant overlap
    'virtue_ethics_justice': 0.5,     // Moderate differences
    'care_ethics_justice': 0.5        // Contextual vs universal approach
  };
  
  // Normalize framework names for lookup
  const fw1 = framework1.toLowerCase();
  const fw2 = framework2.toLowerCase();
  
  // Create lookup key (alphabetical order)
  const key1 = `${fw1}_${fw2}`;
  const key2 = `${fw2}_${fw1}`;
  
  // Get base distance (default to 0.5 if not found)
  let distance = baseDistances[key1] || baseDistances[key2] || 0.5;
  
  // Adjust distance based on dilemma context
  if (dilemma.contextual_factors) {
    // Example: In high-stakes scenarios with lives at risk, utilitarian and deontological approaches
    // often become more opposed
    const lifeAtStake = dilemma.parameters?.life_at_stake?.value > 0.5;
    if (lifeAtStake && ((fw1.includes('utilitarian') && fw2.includes('deontolog')) || 
                          (fw2.includes('utilitarian') && fw1.includes('deontolog')))) {
      distance += 0.1;
    }
    
    // In scenarios with vulnerable populations, care ethics and justice may have increased tensions
    const vulnerablePopulations = dilemma.contextual_factors.some(f => 
      f.factor?.toLowerCase().includes('vulnerable') || 
      f.explanation?.toLowerCase().includes('vulnerable')
    );
    
    if (vulnerablePopulations && ((fw1.includes('care') && fw2.includes('justice')) || 
                                 (fw2.includes('care') && fw1.includes('justice')))) {
      distance += 0.1;
    }
  }
  
  // Cap distance at 1.0
  return Math.min(distance, 1.0);
}

/**
 * Generate a descriptive explanation of the conflict between frameworks
 * @param {string} framework1 - First framework
 * @param {string} framework2 - Second framework
 * @param {Object} rec1 - Recommendation from first framework
 * @param {Object} rec2 - Recommendation from second framework
 * @returns {string} Conflict description
 */
function generateConflictDescription(framework1, framework2, rec1, rec2) {
  const frameworkDescriptions = {
    'utilitarian': 'maximizing overall benefit',
    'deontology': 'respecting individual rights and duties',
    'virtue_ethics': 'cultivating virtuous character',
    'care_ethics': 'maintaining caring relationships and contextual care',
    'justice': 'ensuring fair distribution and impartial treatment'
  };
  
  const desc1 = frameworkDescriptions[framework1] || framework1;
  const desc2 = frameworkDescriptions[framework2] || framework2;
  
  return `Conflict between ${desc1} and ${desc2}`;
}

/**
 * Select the most appropriate resolution strategy for a conflict
 * ENHANCED: Now considers hybrid resolution strategies from hybrid.js
 * @param {Object} conflict - The conflict to resolve
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Selected resolution strategy
 */
function selectHybridResolutionStrategy(conflict, dilemma) {
  // Check if this is a suitable conflict for hybrid resolution
  if (conflict.type !== 'framework_conflict') {
    return null; // Only apply hybrid strategies to framework conflicts
  }
  
  const frameworks = conflict.between;
  if (!frameworks || frameworks.length !== 2) {
    return null; // Need exactly two frameworks for hybrid resolution
  }
  
  // Check for specific framework combinations that match our hybrid strategies
  const hasUtilitarian = frameworks.some(fw => fw === 'utilitarian');
  const hasDeontology = frameworks.some(fw => fw === 'deontology');
  const hasVirtue = frameworks.some(fw => fw === 'virtue_ethics');
  const hasCare = frameworks.some(fw => fw === 'care_ethics');
  const hasJustice = frameworks.some(fw => fw === 'justice');
  
  // Check specific hybrid cases
  if (hasUtilitarian && hasDeontology) {
    return {
      name: 'duty_bounded_utilitarianism',
      description: 'Applying utilitarian analysis within deontological constraints',
      strategy: applyDutyBoundedUtilitarianism
    };
  }
  
  if (hasUtilitarian && hasVirtue) {
    return {
      name: 'virtue_guided_consequentialism',
      description: 'Evaluating consequences through the lens of virtuous character',
      strategy: applyVirtueGuidedConsequentialism
    };
  }
  
  if (hasCare && hasJustice) {
    return {
      name: 'care_based_justice',
      description: 'Integrating care ethics with justice principles',
      strategy: applyCareBasedJustice
    };
  }
  
  // For any complex multiframework conflict, consider reflective equilibrium
  if (conflict.type === 'multi_framework_conflict' && Object.keys(conflict.action_groups).length > 2) {
    return {
      name: 'reflective_equilibrium',
      description: 'Balancing competing intuitions and principles to reach a coherent position',
      strategy: applyReflectiveEquilibrium
    };
  }
  
  return null; // No suitable hybrid strategy found
}

/**
 * Resolve ethical conflicts in a dilemma - adapter for REA system
 * @param {Object} frameworkResults - Framework analysis results
 * @param {Object} conflicts - Detected conflicts and interactions
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Conflict resolutions
 */
export function resolveConflicts(frameworkResults, conflicts, dilemma) {
  console.log(`Resolving conflicts via adapter for: ${dilemma.id}`);
  
  const resolutions = [];
  const interactionInsights = []; // To store insights from interactions
  
  // Process each conflict
  conflicts.conflicts.forEach((conflict, index) => {
    let resolution;
    
    // NEW: Check if there's an applicable hybrid strategy
    let hybridStrategy = selectHybridResolutionStrategy(conflict, dilemma);
    
    if (hybridStrategy) {
      console.log(`Applying hybrid strategy: ${hybridStrategy.name}`);
      
      try {
        // Apply the hybrid strategy
        const hybridResult = hybridStrategy.strategy(conflict, dilemma, frameworkResults);
        
        // Create resolution object using the hybrid result
        resolution = {
          id: `resolution-${index}`,
          conflict_reference: conflict,
          resolution_strategy: hybridStrategy.name,
          description: hybridStrategy.description,
          hybrid_analysis: hybridResult,
          weights: hybridResult.weights || {},
          reasoning: hybridResult.reasoning || generateReasoningFromTemplate(hybridStrategy.name, conflict, dilemma),
          processing_mode: dilemma.processing_mode || "advanced",
          detail_level: "high" // Hybrid strategies provide more detailed analysis
        };
        
        // Add any hybrid-specific fields
        if (hybridResult.constraints) resolution.constraints = hybridResult.constraints;
        if (hybridResult.virtues) resolution.virtues = hybridResult.virtues;
        if (hybridResult.care_relations) resolution.care_relations = hybridResult.care_relations;
        if (hybridResult.justice_principles) resolution.justice_principles = hybridResult.justice_principles;
        if (hybridResult.hybrid_recommendation) resolution.hybrid_recommendation = hybridResult.hybrid_recommendation;
        
        // Add the strategy-specific fields
        if (hybridStrategy.name === 'duty_bounded_utilitarianism') {
          resolution.duty_constraints = hybridResult.duty_constraints;
          resolution.utility_analysis = hybridResult.utility_analysis;
        } else if (hybridStrategy.name === 'virtue_guided_consequentialism') {
          resolution.virtue_analysis = hybridResult.virtue_analysis;
          resolution.consequence_evaluation = hybridResult.consequence_evaluation;
        } else if (hybridStrategy.name === 'care_based_justice') {
          resolution.care_relationships = hybridResult.care_relationships;
          resolution.justice_evaluation = hybridResult.justice_evaluation;
        }
      } catch (error) {
        console.warn(`Error applying hybrid strategy ${hybridStrategy.name}: ${error.message}`);
        // Fall back to standard strategies if hybrid approach fails
        hybridStrategy = null;
      }
    }
    
    // If no hybrid strategy was applied or it failed, use standard strategies
    if (!hybridStrategy) {
      // Special handling for multi-framework conflicts
      if (conflict.type === 'multi_framework_conflict') {
        try {
          // Resolve multi-framework conflict
          const multiResult = resolveMultiFrameworkConflict(conflict, dilemma);
          
          resolution = {
            id: `resolution-${index}`,
            conflict_reference: conflict,
            resolution_strategy: 'multi_framework_integration',
            description: 'Integration of multiple ethical frameworks',
            weights: multiResult.weights || {},
            reasoning: multiResult.reasoning || 'Integration of multiple ethical frameworks to determine optimal recommendation.',
            meta_recommendation: multiResult.meta_recommendation, // Set meta_recommendation explicitly
            processing_mode: dilemma.processing_mode || "standard",
            detail_level: "high"
          };
        } catch (error) {
          console.warn(`Error resolving multi-framework conflict: ${error.message}`);
          // Create fallback resolution for multi-framework conflicts
          const actionGroups = conflict.action_groups || {};
          const fallbackAction = Object.keys(actionGroups)[0] || 'undetermined';
          
          resolution = {
            id: `resolution-${index}`,
            conflict_reference: conflict,
            resolution_strategy: 'multi_framework_integration',
            description: 'Fallback multi-framework integration',
            reasoning: 'A technical issue prevented detailed resolution. Using most common framework recommendation as fallback.',
            meta_recommendation: fallbackAction, // Set a fallback meta_recommendation
            processing_mode: "basic",
            detail_level: "low"
          };
        }
      } else {
        // Handle non-multi-framework conflicts with standard strategies
        const standardStrategy = selectResolutionStrategy(conflict, dilemma);
      
        if (standardStrategy) {
          try {
            // Apply the standard strategy
            const result = applyResolutionStrategy(standardStrategy, conflict, dilemma, frameworkResults);
          
            resolution = {
              id: `resolution-${index}`,
              conflict_reference: conflict,
              resolution_strategy: standardStrategy,
              description: `Standard ${typeof standardStrategy === 'object' ? standardStrategy.name || standardStrategy.id || 'resolution' : standardStrategy} resolution`,
              weights: result.weights || {},
              reasoning: result.reasoning || generateReasoningFromTemplate(standardStrategy, conflict, dilemma),
              processing_mode: dilemma.processing_mode || "standard",
              detail_level: getStrategyDetailLevel(standardStrategy)
            };
          } catch (error) {
            console.warn(`Error applying standard strategy ${standardStrategy}: ${error.message}`);
            // Create a basic fallback resolution to prevent null resolutions
            resolution = {
              id: `resolution-${index}`,
              conflict_reference: conflict,
              resolution_strategy: "fallback",
              description: "Fallback resolution due to strategy failure",
              reasoning: "A technical issue prevented applying resolution strategies. Consider this a preliminary result.",
              processing_mode: "basic",
              detail_level: "low"
            };
          }
        } else {
          // No applicable strategy, create a basic resolution
          resolution = {
            id: `resolution-${index}`,
            conflict_reference: conflict,
            resolution_strategy: "undetermined",
            description: "No applicable resolution strategy identified",
            reasoning: "This conflict type does not match any available resolution strategies.",
            processing_mode: "basic",
            detail_level: "low"
          };
        }
      }
    }
    
    // Ensure resolution is defined before standardizing
    if (resolution) {
      // Standardize the resolution detail level
      const standardizedResolution = standardizeResolutionDetail(resolution);
      resolutions.push(standardizedResolution);
    }
  });
  
  // Process framework interactions to generate insights
  if (conflicts.interactions && conflicts.interactions.length > 0) {
    conflicts.interactions.forEach(interaction => {
      if (interaction.type === 'framework_interaction') {
        const insight = deriveInsightFromInteraction(interaction, dilemma);
        interactionInsights.push({
          interaction_reference: interaction,
          insight_type: insight.type,
          description: insight.description,
          ethical_dimensions: insight.ethical_dimensions,
          strength: insight.strength
        });
      } else if (interaction.type === 'multi_framework_consensus') {
        const insight = deriveInsightFromConsensus(interaction, dilemma);
        interactionInsights.push({
          interaction_reference: interaction,
          insight_type: insight.type,
          description: insight.description,
          ethical_dimensions: insight.ethical_dimensions,
          strength: insight.strength
        });
      }
    });
  }
  
  // Generate a final recommendation
  const finalRecommendation = generateFinalRecommendation(
    dilemma, 
    frameworkResults, 
    conflicts, 
    {resolutions, interaction_insights: interactionInsights}
  );
  
  // FIXED: Return structure with nested resolutions array to match what process-dilemma-direct.js expects
  return {
    resolutions: resolutions,  // This provides the nested structure expected by process-dilemma-direct.js
    interaction_insights: interactionInsights,
    final_recommendation: finalRecommendation,
    finalRecommendation: finalRecommendation, // Add both formats for compatibility
    metadata: {
      resolution_count: resolutions.length,
      interaction_insights_count: interactionInsights.length,
      dilemma_id: dilemma.id,
      processing_mode: dilemma.processing_mode || "standard"
    }
  };
}

/**
 * Derive ethical insight from a framework interaction
 * @param {Object} interaction - The framework interaction
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Derived insight
 */
function deriveInsightFromInteraction(interaction, dilemma) {
  const framework1 = interaction.frameworks[0];
  const framework2 = interaction.frameworks[1];
  
  let insightType, description, ethical_dimensions;
  
  switch (interaction.interaction_type) {
    case 'strong_reinforcement':
      insightType = 'strong_ethical_convergence';
      description = `The strong agreement between ${framework1} and ${framework2} suggests a robust ethical foundation for the recommended action. When frameworks with different theoretical bases arrive at the same conclusion through similar reasoning, it provides particularly strong ethical justification.`;
      break;
      
    case 'moderate_reinforcement':
      insightType = 'moderate_ethical_convergence';
      description = `The moderate agreement between ${framework1} and ${framework2} provides meaningful ethical support for the recommended action. While their reasoning differs in some aspects, the convergence on key ethical considerations strengthens the case for this action.`;
      break;
      
    case 'complementary_perspectives':
      insightType = 'multi-dimensional_ethical_support';
      description = `While ${framework1} and ${framework2} approach ethics from different angles, they complement each other in supporting the same action. This suggests the action is ethically sound across multiple dimensions of moral reasoning, which is particularly valuable in complex ethical situations.`;
      break;
  }
  
  // Identify relevant ethical dimensions from the interaction
  ethical_dimensions = interaction.shared_ethical_dimensions || [];
  
  // If there are no shared dimensions, determine the primary dimension for each framework
  if (ethical_dimensions.length === 0) {
    if (framework1 === 'utilitarian') ethical_dimensions.push('consequences');
    else if (framework1 === 'deontology') ethical_dimensions.push('duty');
    else if (framework1 === 'virtue_ethics') ethical_dimensions.push('character');
    else if (framework1 === 'care_ethics') ethical_dimensions.push('care');
    else if (framework1 === 'justice') ethical_dimensions.push('fairness');
    
    if (framework2 === 'utilitarian' && !ethical_dimensions.includes('consequences')) ethical_dimensions.push('consequences');
    else if (framework2 === 'deontology' && !ethical_dimensions.includes('duty')) ethical_dimensions.push('duty');
    else if (framework2 === 'virtue_ethics' && !ethical_dimensions.includes('character')) ethical_dimensions.push('character');
    else if (framework2 === 'care_ethics' && !ethical_dimensions.includes('care')) ethical_dimensions.push('care');
    else if (framework2 === 'justice' && !ethical_dimensions.includes('fairness')) ethical_dimensions.push('fairness');
  }
  
  return {
    type: insightType,
    description,
    ethical_dimensions,
    strength: interaction.strength
  };
}

/**
 * Derive ethical insight from a multi-framework consensus
 * @param {Object} consensus - The multi-framework consensus
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Derived insight
 */
function deriveInsightFromConsensus(consensus, dilemma) {
  const frameworks = consensus.frameworks.join(', ');
  const frameworkCount = consensus.frameworks.length;
  
  const description = `
    There is a significant consensus among ${frameworkCount} different ethical frameworks (${frameworks}) 
    that the recommended action is appropriate. This level of agreement across diverse ethical perspectives 
    provides particularly strong ethical justification and suggests the action aligns with multiple moral principles 
    and values. Even though these frameworks emphasize different aspects of ethics, their convergence indicates 
    that the recommended action satisfies a broad range of ethical considerations.
  `.trim();
  
  // Determine the primary ethical dimensions represented in the consensus
  const ethical_dimensions = [];
  consensus.frameworks.forEach(framework => {
    if (framework === 'utilitarian' && !ethical_dimensions.includes('consequences')) 
      ethical_dimensions.push('consequences');
    else if (framework === 'deontology' && !ethical_dimensions.includes('duty')) 
      ethical_dimensions.push('duty');
    else if (framework === 'virtue_ethics' && !ethical_dimensions.includes('character')) 
      ethical_dimensions.push('character');
    else if (framework === 'care_ethics' && !ethical_dimensions.includes('care')) 
      ethical_dimensions.push('care');
    else if (framework === 'justice' && !ethical_dimensions.includes('fairness')) 
      ethical_dimensions.push('fairness');
  });
  
  return {
    type: 'multi_framework_consensus',
    description,
    ethical_dimensions,
    strength: consensus.strength
  };
}

/**
 * Generate a final recommendation based on framework results and resolutions
 * Enhanced with parameter proximity analysis for better stability insights
 * @param {Object} dilemma - The dilemma
 * @param {Object} frameworkResults - Framework analysis results
 * @param {Object} conflicts - Detected conflicts
 * @param {Object} resolutions - Generated resolutions and interaction insights
 * @returns {Object} Final recommendation with action, reasoning, and supporting data
 */
function generateFinalRecommendation(dilemma, frameworkResults, conflicts, resolutions) {
  // Extract all recommended actions across frameworks
  const allActions = Object.entries(frameworkResults.frameworks).map(
    ([framework, result]) => result.recommendedAction
  );
  
  // Count occurrences of each action
  const actionCounts = {};
  allActions.forEach(action => {
    actionCounts[action] = (actionCounts[action] || 0) + 1;
  });
  
  // Find the action with the most recommendations
  let recommendedAction = null;
  let maxCount = 0;
  
  for (const [action, count] of Object.entries(actionCounts)) {
    if (count > maxCount) {
      maxCount = count;
      recommendedAction = action;
    }
  }
  
  // Calculate weighted average of all similarities
  const confidence = calculateRefinedConfidence(frameworkResults);
  
  // Get proper action description for the dilemma
  const actionDescription = getActionDescription(dilemma, recommendedAction);
  
  // Extract all multi-framework integration resolutions
  const multiFrameworkResolutions = resolutions.resolutions.filter(
    resolution => resolution.resolution_strategy === 'multi_framework_integration'
  );
  
  // If we have multi-framework resolutions, prioritize their recommendations
  let justification = `Majority of frameworks (${maxCount} out of ${allActions.length}) recommend this action.`;
  
  if (multiFrameworkResolutions.length > 0) {
    // Sort by severity of the conflict being addressed
    const mostSevereResolution = multiFrameworkResolutions.sort((a, b) => {
      return (b.conflict_reference?.severity || 0) - (a.conflict_reference?.severity || 0)
    })[0];
    
    if (mostSevereResolution) {
      recommendedAction = mostSevereResolution.meta_recommendation || recommendedAction;
      justification = `Based on integration of multiple ethical perspectives (severity: ${mostSevereResolution.conflict_reference.severity}).`;
    }
  }
  
  // Identify supporting and opposing frameworks
  const supportingFrameworks = [];
  const opposingFrameworks = [];
  
  for (const [framework, result] of Object.entries(frameworkResults.frameworks)) {
    if (result.recommendedAction === recommendedAction) {
      supportingFrameworks.push(framework);
    } else {
      opposingFrameworks.push(framework);
    }
  }
  
  // Get framework interactions from insights
  const frameworkInteractions = [];
  if (resolutions.interaction_insights) {
    for (const insight of resolutions.interaction_insights) {
      if (insight.interaction_reference.recommendedAction === recommendedAction) {
        frameworkInteractions.push(insight.description);
      }
    }
  }
  
  // Get ethical considerations from resolutions
  const ethicalConsiderations = [];
  for (const resolution of resolutions.resolutions) {
    if (resolution.weights) {
      const frameworks = Object.keys(resolution.weights).filter(k => k !== '_originals');
      if (frameworks.length === 2) {
        let description = '';
        if (resolution.resolution_strategy === 'framework_balancing') {
          description = `Balancing ${frameworks[0]} (${Math.round(resolution.weights[frameworks[0]] * 100)}%) and ${frameworks[1]} (${Math.round(resolution.weights[frameworks[1]] * 100)}%)`;
        } else if (resolution.resolution_strategy === 'principled_priority') {
          const primaryFramework = resolution.priority_framework;
          const reason = resolution.priority_reason?.toLowerCase() || 'contextual factors';
          description = `Prioritizing ${primaryFramework} due to ${reason} (${Math.round(resolution.weights[frameworks[0]] * 100)}% vs ${Math.round(resolution.weights[frameworks[1]] * 100)}%)`;
        }
        if (description) {
          ethicalConsiderations.push(description);
        }
      }
    }
  }
  
  // Get stakeholder impact considerations
  const stakeholderConsiderations = [];
  if (frameworkResults.stakeholderImpacts) {
    // Sort by impact level
    const sortedImpacts = Object.entries(frameworkResults.stakeholderImpacts)
      .sort((a, b) => b[1].impact - a[1].impact);
    
    // Take top 3 impacts
    for (let i = 0; i < Math.min(3, sortedImpacts.length); i++) {
      const [stakeholder, data] = sortedImpacts[i];
      stakeholderConsiderations.push(`Impact on ${stakeholder}: ${(data.impact * 100).toFixed(0)}%`);
    }
  }
  
  // Generate list of critical parameters using improved proximity data
  const criticalParameters = [];
  
  // Use our enhanced parameter proximity data if available
  if (frameworkResults._parameter_proximities) {
    // Sort by proximity score (lowest = most critical)
    const sortedProximities = [...frameworkResults._parameter_proximities]
      .sort((a, b) => a.proximityScore - b.proximityScore)
      .slice(0, 6); // Take top 6 most critical parameters
    
    for (const proximity of sortedProximities) {
      const param = proximity.parameter;
      const framework = proximity.framework;
      const value = proximity.originalValue;
      
      const description = dilemma.parameters[param]?.description || param;
      
      // Determine which threshold is closer
      let thresholdValue, direction, newAction;
      if (proximity.increaseThreshold !== null && proximity.decreaseThreshold !== null) {
        // If both thresholds exist, use the closer one
        const increaseDist = Math.abs(value - proximity.increaseThreshold);
        const decreaseDist = Math.abs(value - proximity.decreaseThreshold);
        
        if (increaseDist <= decreaseDist) {
          thresholdValue = proximity.increaseThreshold;
          direction = "increased";
          newAction = frameworkResults.frameworks[framework].sensitivity_thresholds[param]?.action_changes?.increase;
        } else {
          thresholdValue = proximity.decreaseThreshold;
          direction = "decreased";
          newAction = frameworkResults.frameworks[framework].sensitivity_thresholds[param]?.action_changes?.decrease;
        }
      } else if (proximity.increaseThreshold !== null) {
        thresholdValue = proximity.increaseThreshold;
        direction = "increased";
        newAction = frameworkResults.frameworks[framework].sensitivity_thresholds[param]?.action_changes?.increase;
      } else if (proximity.decreaseThreshold !== null) {
        thresholdValue = proximity.decreaseThreshold;
        direction = "decreased";
        newAction = frameworkResults.frameworks[framework].sensitivity_thresholds[param]?.action_changes?.decrease;
      } else {
        continue; // Skip if no thresholds
      }
      
      // Get impact explanation (if available)
      let impactExplanation = '';
      const stakeholderId = param.split('_')[0]; // Try to extract stakeholder id from parameter name
      const stakeholder = frameworkResults.stakeholderImpacts?.[stakeholderId];
      
      if (stakeholder) {
        impactExplanation = ` This particularly affects ${stakeholderId} (${stakeholder.impact.toFixed(2)} impact).`;
      }
      
      // Add to critical parameters
      criticalParameters.push(
        `${param} (current: ${value}): If ${direction} to ${thresholdValue}, the ${framework} calculation would shift.${impactExplanation} This would change the recommendation from ${framework}.`
      );
    }
  } else {
    // Fallback to traditional critical parameters if enhanced data not available
    for (const [framework, result] of Object.entries(frameworkResults.frameworks)) {
      if (!result.parameter_sensitivities || !result.sensitivity_thresholds) continue;
      
      for (const param of result.parameter_sensitivities) {
        const threshold = result.sensitivity_thresholds[param];
        if (!threshold) continue;
        
        const sensitivity = parseFloat(threshold.sensitivity_score || '0');
        if (sensitivity < 0.7) continue; // Only include high sensitivity parameters
        
        // Format description
        const paramDesc = `${param} (current: ${threshold.original_value})`;
        let thresholdDesc = '';
        
        if (threshold.increase_threshold !== null) {
          thresholdDesc += `If increased to ${threshold.increase_threshold}, `;
          if (threshold.action_changes?.increase) {
            thresholdDesc += `the recommendation would change to "${threshold.action_changes.increase}". `;
          } else {
            thresholdDesc += 'the recommendation could change. ';
          }
        }
        
        if (threshold.decrease_threshold !== null) {
          thresholdDesc += `If decreased to ${threshold.decrease_threshold}, `;
          if (threshold.action_changes?.decrease) {
            thresholdDesc += `the recommendation would change to "${threshold.action_changes.decrease}". `;
          } else {
            thresholdDesc += 'the recommendation could change. ';
          }
        }
        
        criticalParameters.push(`${paramDesc}: ${thresholdDesc}`);
      }
    }
  }
  
  // Extract important contextual factors
  const contextualFactors = dilemma.contextual_factors?.map(cf => 
    `${cf.factor}: ${cf.value} (${cf.explanation})`
  ) || [];
  
  // Generate comprehensive reasoning that synthesizes all insights
  let reasoning = `
    This recommendation is to "${recommendedAction}" (${actionDescription}).
    
    ${justification}
  `.trim();
  
  // Add framework interactions section if there are any
  if (frameworkInteractions.length > 0) {
    reasoning += `\n    
    Framework interaction insights:
    ${frameworkInteractions.map(fi => '- ' + fi).join('\n')}`;
  }
  
  // Add the other sections
  reasoning += `\n    
    Key ethical considerations:
    ${ethicalConsiderations.map(ec => '- ' + ec).join('\n')}
    
    Key stakeholder impacts:
    ${stakeholderConsiderations.map(sc => '- ' + sc).join('\n')}
    
    Critical parameters affecting this recommendation:
    ${criticalParameters.map(cp => '- ' + cp).join('\n')}
    
    This recommendation acknowledges the tensions between different ethical frameworks
    but provides a justified path forward that best addresses the ethical complexity
    of this specific dilemma, considering its unique contextual factors and parameters.
  `;
  
  return {
    action: recommendedAction,
    reasoning: reasoning,
    justification: justification,
    confidence: confidence.confidence,
    confidence_factors: confidence.factors,
    supporting_frameworks: supportingFrameworks,
    opposing_frameworks: opposingFrameworks,
    framework_interactions: frameworkInteractions,
    ethical_considerations: ethicalConsiderations,
    stakeholder_impacts: stakeholderConsiderations,
    critical_parameters: criticalParameters,
    contextual_factors: contextualFactors
  };
}

/**
 * Collect critical parameters that might affect the recommended action with enhanced ethical reasoning
 * @param {Object} frameworkResults - Results from framework analysis
 * @param {string} recommendedAction - The recommended action
 * @returns {Array} List of critical parameter descriptions with ethical reasoning
 */
function collectCriticalParameters(frameworkResults, recommendedAction) {
  const criticalParameters = [];
  const parameterDetails = {};
  
  // Collect all sensitive parameters from all frameworks
  Object.entries(frameworkResults.frameworks).forEach(([framework, result]) => {
    if (result.parameter_sensitivities) {
      result.parameter_sensitivities.forEach(param => {
        const threshold = result.sensitivity_thresholds[param];
        if (!threshold) return;
        
        // Store parameter details
        if (!parameterDetails[param]) {
          parameterDetails[param] = {
            name: param,
            description: threshold.description,
            original_value: threshold.original_value,
            frameworks: [],
            thresholds: [],
            ethical_significance: {},
            stakeholder_impacts: {}
          };
        }
        
        // Add this framework's sensitivity info
        if (!parameterDetails[param].frameworks.includes(framework)) {
        parameterDetails[param].frameworks.push(framework);
        }
        
        // Record ethical significance for this framework
        parameterDetails[param].ethical_significance[framework] = getParameterEthicalSignificance(param, framework);
        
        if (threshold.decrease_threshold !== null) {
          parameterDetails[param].thresholds.push({
            direction: 'decrease',
            value: threshold.decrease_threshold,
            framework: framework,
            new_action: threshold.action_changes.decrease
          });
        }
        
        if (threshold.increase_threshold !== null) {
          parameterDetails[param].thresholds.push({
            direction: 'increase',
            value: threshold.increase_threshold,
            framework: framework,
            new_action: threshold.action_changes.increase
          });
        }
      });
    }
  });
  
  // Identify parameters that affect stakeholder impacts
  const stakeholderImpactParams = getStakeholderImpactParameters(frameworkResults);
  
  // Create enhanced descriptive text for each critical parameter
  Object.values(parameterDetails).forEach(param => {
    if (param.thresholds.length > 0) {
      // Sort thresholds by proximity to original value
      param.thresholds.sort((a, b) => {
        const distA = Math.abs(param.original_value - a.value);
        const distB = Math.abs(param.original_value - b.value);
        return distA - distB;
      });
      
      // Get the closest threshold
      const closestThreshold = param.thresholds[0];
      const direction = closestThreshold.direction === 'increase' ? 'increased' : 'decreased';
      const impactedFramework = closestThreshold.framework;
      
      // Generate ethical reasoning about this parameter
      let ethicalReasoning = '';
      
      // Add ethical significance based on the framework
      const significance = param.ethical_significance[impactedFramework];
      if (significance) {
        ethicalReasoning = significance;
      } else {
        // Generate default ethical reasoning based on parameter and framework
        ethicalReasoning = generateParameterEthicalReasoning(param.name, impactedFramework, direction);
      }
      
      // Add stakeholder impact information if relevant
      const stakeholderImpact = stakeholderImpactParams[param.name];
      if (stakeholderImpact) {
        ethicalReasoning += ` ${stakeholderImpact}`;
      }
      
      // Create the enhanced description with ethical reasoning
      criticalParameters.push(
        `${param.name} (current: ${param.original_value}): If ${direction} to ${closestThreshold.value}, ${ethicalReasoning}. This would change the recommendation from ${closestThreshold.framework}.`
      );
    }
  });
  
  return criticalParameters;
}

/**
 * Get ethical significance of a parameter for a specific framework
 * @param {string} param - Parameter name
 * @param {string} framework - Ethical framework
 * @returns {string} Description of ethical significance
 */
function getParameterEthicalSignificance(param, framework) {
  // Map parameters to their ethical significance in each framework
  const ethicalSignificanceMap = {
    'political_benefit': {
      'utilitarian': 'the utilitarian calculation would shift as the overall political benefit no longer outweighs potential harms',
      'virtue_ethics': 'the virtues of prudence and justice would no longer be balanced optimally',
      'care_ethics': 'the political considerations would outweigh care for vulnerable populations'
    },
    'humanitarian_benefit': {
      'utilitarian': 'the humanitarian benefit would no longer justify the ethical costs',
      'justice': 'the fair distribution of benefits would be compromised',
      'care_ethics': 'care for vulnerable populations would be significantly affected',
      'virtue_ethics': 'the virtue of compassion would be compromised'
    },
    'deportation_expansion': {
      'deontology': 'the duty to uphold rights would be compromised by expanded deportation',
      'care_ethics': 'the deportation expansion would undermine care for migrant communities',
      'virtue_ethics': 'the balance between justice and compassion would shift'
    },
    'base_alienation': {
      'deontology': 'the principle of fidelity to commitments would be violated',
      'virtue_ethics': 'the virtues of loyalty and integrity would be compromised'
    },
    'bipartisan_value': {
      'utilitarian': 'the overall utility from bipartisan cooperation would shift significantly',
      'virtue_ethics': 'the virtue of practical wisdom would suggest a different approach'
    },
    'public_opinion': {
      'utilitarian': 'the public consequences would significantly alter the utilitarian calculus',
      'justice': 'democratic representation would require respecting public values'
    }
  };
  
  // Return ethical significance if defined, otherwise generic message
  if (ethicalSignificanceMap[param] && ethicalSignificanceMap[param][framework]) {
    return ethicalSignificanceMap[param][framework];
  }
  
  // Generic fallback based on framework
  switch (framework) {
    case 'utilitarian':
      return 'the overall balance of benefits versus harms would shift significantly';
    case 'deontology':
      return 'duties and rights would be rebalanced in a way that changes ethical obligations';
    case 'virtue_ethics':
      return 'the virtuous approach would require a different action';
    case 'care_ethics':
      return 'care relationships would be affected in ways that change ethical priorities';
    case 'justice':
      return 'the fair distribution of benefits and burdens would significantly change';
    default:
      return 'the ethical calculus would shift significantly';
  }
}

/**
 * Generate ethical reasoning about parameter changes
 * @param {string} paramName - Parameter name
 * @param {string} framework - Ethical framework
 * @param {string} direction - Direction of change
 * @returns {string} Ethical reasoning
 */
function generateParameterEthicalReasoning(paramName, framework, direction) {
  // Default reasoning based on parameter name and framework
  return `the ${framework} principle would be affected in a way that changes the ethical recommendation`;
}

/**
 * Get parameters that significantly impact stakeholders
 * @param {Object} frameworkResults - Framework analysis results
 * @returns {Object} Mapping of parameters to stakeholder impact descriptions
 */
function getStakeholderImpactParameters(frameworkResults) {
  // Map parameters to their impact on stakeholders
  const stakeholderImpactMap = {
    'political_benefit': 'This particularly affects Democratic Party Leadership and vulnerable representatives who prioritize political viability.',
    'humanitarian_benefit': 'This directly impacts migrants and asylum seekers as well as the progressive base that advocates for their welfare.',
    'deportation_expansion': 'This has significant negative consequences for migrant communities and challenges core values of the progressive base.',
    'base_alienation': 'This represents a direct impact on the party\'s progressive base and their continued support.',
    'bipartisan_value': 'This affects swing voters who prioritize cooperation across party lines.',
    'public_opinion': 'This impacts all stakeholders but particularly benefits those responsive to public pressure (swing voters and vulnerable representatives).'
  };
  
  return stakeholderImpactMap;
}

/**
 * Calculate recommendation confidence based on agreement between frameworks
 * @param {Object} actionCounts - Count of frameworks recommending each action
 * @param {number} totalFrameworks - Total number of frameworks
 * @returns {number} Confidence value (0-1)
 */
function calculateRecommendationConfidence(actionCounts, totalFrameworks) {
  // Find the action with the most frameworks supporting it
  const maxCount = Math.max(...Object.values(actionCounts));
  
  // Calculate the proportion of frameworks that agree
  const agreementRatio = maxCount / totalFrameworks;
  
  // Scale the confidence to range from 0.5 to 1.0
  // Even with no agreement, we have at least 0.5 confidence as a baseline
  return 0.5 + (agreementRatio * 0.5);
}

/**
 * Calculate framework weights considering both the conflict and dilemma context
 * Now using the enhanced weight simplification and domain-specific considerations
 * @param {Object} conflict - The conflict to resolve
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Dynamic weights for the frameworks
 */
function calculateFrameworkWeights(conflict, dilemma) {
  const framework1 = conflict.between[0];
  const framework2 = conflict.between[1];
  
  // Base weights starting at 50/50
  let weight1 = 0.5;
  let weight2 = 0.5;
  
  // 1. Adjust based on conflict severity
  // Higher severity means more significant adjustment from baseline
  const severityAdjustment = (conflict.severity - 0.5) * 0.4; // Scale to max ±0.2 adjustment
  
  // 2. Framework-specific priority adjustments based on dilemma type
  let frameworkPriorityAdjustment = 0;
  
  // Adjust for life-at-stake scenarios
  const lifeAtStake = dilemma.parameters?.life_at_stake?.value;
  if (lifeAtStake) {
    // In life-at-stake scenarios, deontology often gets higher priority
    if (framework1 === 'deontology') frameworkPriorityAdjustment += 0.1;
    if (framework2 === 'deontology') frameworkPriorityAdjustment -= 0.1;
  }
  
  // Adjust for severe urgency
  const highestUrgency = Math.max(
    dilemma.parameters?.urgency_option_a?.value || 0,
    dilemma.parameters?.urgency_option_b?.value || 0
  );
  
  if (highestUrgency > 8) {
    // In high urgency, utilitarianism often gets priority
    if (framework1 === 'utilitarian') frameworkPriorityAdjustment += 0.1;
    if (framework2 === 'utilitarian') frameworkPriorityAdjustment -= 0.1;
  }
  
  // Check for vulnerable populations
  const vulnerablePopulations = dilemma.stakeholders?.some(s => 
    s.name?.toLowerCase().includes('vulnerable') || 
    s.name?.toLowerCase().includes('migrant') ||
    s.name?.toLowerCase().includes('patient')
  );
  
  if (vulnerablePopulations) {
    // With vulnerable populations, care ethics gets higher priority
    if (framework1 === 'care_ethics') frameworkPriorityAdjustment += 0.15;
    if (framework2 === 'care_ethics') frameworkPriorityAdjustment -= 0.15;
  }
  
  // 3. Contextual factor adjustments
  let contextualAdjustment = 0;
  
  // If migration crisis is mentioned in contextual factors
  const migrationCrisis = dilemma.contextual_factors?.some(f => 
    f.factor?.toLowerCase().includes('migra') || 
    f.explanation?.toLowerCase().includes('migra')
  );
  
  if (migrationCrisis) {
    // In migration crises, justice and care ethics often get higher priority
    if (framework1 === 'justice' || framework1 === 'care_ethics') contextualAdjustment += 0.1;
    if (framework2 === 'justice' || framework2 === 'care_ethics') contextualAdjustment -= 0.1;
  }
  
  // If resource scarcity is mentioned
  const resourceScarcity = dilemma.contextual_factors?.some(f => 
    f.factor?.toLowerCase().includes('resource') || 
    f.explanation?.toLowerCase().includes('resource')
  );
  
  if (resourceScarcity) {
    // In resource scarcity, utilitarianism often gets higher priority
    if (framework1 === 'utilitarian') contextualAdjustment += 0.1;
    if (framework2 === 'utilitarian') contextualAdjustment -= 0.1;
  }
  
  // Apply all adjustments to weight1
  weight1 += severityAdjustment + frameworkPriorityAdjustment + contextualAdjustment;
  
  // Ensure weight1 is between 0.15 and 0.85 to prevent extreme imbalance
  weight1 = Math.max(0.15, Math.min(0.85, weight1));
  
  // Weight2 is the complement of weight1
  weight2 = 1 - weight1;
  
  // Create raw weights
  const rawWeights = {
    [framework1]: weight1,
    [framework2]: weight2
  };
  
  // NEW: Use simplifyWeightsPreservingRatio for consistent formatting and domain-specific adjustments
  return simplifyWeightsPreservingRatio(rawWeights, dilemma, {
    preserveOriginalWeights: true,
    decimalPrecision: 2
  });
}

/**
 * Calculate weights for conflicting stakeholders based on:
 * - Stakeholder influence
 * - Concern relevance
 * - Contextual factors
 * 
 * @param {Object} conflict - The stakeholder conflict
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Weights for stakeholders
 */
function calculateStakeholderWeights(conflict, dilemma) {
  const stakeholder1Id = conflict.between[0];
  const stakeholder2Id = conflict.between[1];
  
  // Find stakeholder objects
  const stakeholder1 = dilemma.stakeholders.find(s => s.id === stakeholder1Id);
  const stakeholder2 = dilemma.stakeholders.find(s => s.id === stakeholder2Id);
  
  if (!stakeholder1 || !stakeholder2) {
    // Fallback to equal weights if stakeholders not found
    return {
      [stakeholder1Id]: 0.5,
      [stakeholder2Id]: 0.5
    };
  }
  
  // Base weights on influence if available
  let weight1 = stakeholder1.influence || 0.5;
  let weight2 = stakeholder2.influence || 0.5;
  
  // Adjust for vulnerability - give extra weight to vulnerable populations
  if (stakeholder1Id === 'migrants' || stakeholder1.name?.toLowerCase().includes('vulnerable')) {
    weight1 += 0.1;
  }
  if (stakeholder2Id === 'migrants' || stakeholder2.name?.toLowerCase().includes('vulnerable')) {
    weight2 += 0.1;
  }
  
  // Normalize weights to sum to 1
  const totalWeight = weight1 + weight2;
  weight1 = weight1 / totalWeight;
  weight2 = weight2 / totalWeight;
  
  return {
    [stakeholder1Id]: weight1,
    [stakeholder2Id]: weight2
  };
}

/**
 * Create a REA system adapter with the methods
 * @returns {Object} REA system adapter
 */
export function createREASystemAdapter() {
  return {
    processEthicalDilemma,
    detectConflicts,
    resolveConflicts
  };
} 

// Also export utility functions that might be used by other modules
export {
  simplifyWeightsPreservingRatio,
  WEIGHT_DISPLAY_CONFIG,
  formatFrameworkJustification,
  calculateRefinedConfidence
};

/**
 * Get standardized detail level for a strategy
 * @param {string} strategyName - The name of the resolution strategy
 * @returns {string} Detail level: "low", "medium", or "high"
 */
function getStrategyDetailLevel(strategyName) {
  const detailLevels = {
    casuistry: 'high',
    principled_priority: 'medium',
    multi_framework_integration: 'high',
    framework_balancing: 'medium',
    compromise: 'medium',
    procedural: 'low',
    meta_ethical: 'high',
    stakeholder_compromise: 'medium'
  };
  
  return detailLevels[strategyName] || 'medium';
}

/**
 * Standardize the format of framework justifications to improve comparability
 * Implements the Document 9 recommendation for consistent justification formatting
 * @param {string} framework - The ethical framework
 * @param {string} action - The recommended action
 * @param {Object} comparisons - Key metrics used in the decision
 * @returns {string} A standardized justification string
 */
function formatFrameworkJustification(framework, action, comparisons) {
  // Create a standardized justification format
  let justification = '';
  
  // Handle equal value interpretations consistently
  if (comparisons.valueA === comparisons.valueB && comparisons.valueA !== undefined) {
    justification = `Equal ${comparisons.metricName} values (${comparisons.valueA} vs ${comparisons.valueB}) `;
    
    switch (framework) {
      case 'utilitarian':
        justification += action === 'negotiate_compromises' 
          ? 'suggest seeking a compromise that maximizes overall benefit.'
          : 'lead to a default recommendation based on secondary considerations.';
        break;
      case 'justice':
        justification += action === 'negotiate_compromises'
          ? 'indicate that justice considerations require additional evaluation.'
          : 'shift the focus to fair process rather than outcomes.';
        break;
      case 'deontology':
        justification += 'require deliberation to fulfill competing moral duties.';
        break;
      case 'care_ethics':
        justification += 'suggest a balanced approach to care relationships.';
        break;
      case 'virtue_ethics':
        justification += 'call for balanced virtue expression.';
        break;
      default:
        justification += 'require further ethical analysis.';
    }
  } 
  // Handle non-equal comparisons
  else if (comparisons.valueA !== undefined && comparisons.valueB !== undefined) {
    const higher = comparisons.valueA > comparisons.valueB ? 'A' : 'B';
    const lowerValue = Math.min(comparisons.valueA, comparisons.valueB);
    const higherValue = Math.max(comparisons.valueA, comparisons.valueB);
    
    // Calculate the ratio for more meaningful comparisons
    const ratio = lowerValue > 0 ? 
      (higherValue / lowerValue).toFixed(1) : 
      ((higherValue > 0) ? "∞" : "?"); // Use infinity symbol when dividing by zero
    
    justification = `Option ${higher} has ${ratio}x higher ${comparisons.metricName} `;
    justification += `(${higherValue} vs ${lowerValue}) `;
    
    switch (framework) {
      case 'utilitarian':
        justification += 'indicating greater overall benefit.';
        break;
      case 'justice':
        justification += 'serving more people fairly.';
        break;
      case 'deontology':
        justification += 'presenting stronger moral obligation.';
        break;
      case 'care_ethics':
        justification += 'supporting critical care relationships.';
        break;
      case 'virtue_ethics':
        justification += 'better expressing moral virtues.';
        break;
      default:
        justification += 'making it ethically preferable.';
    }
  }
  // Handle cases with insufficient comparison metrics
  else {
    justification = `${framework} analysis based on qualitative assessment: `;
    
    switch (action) {
      case 'approve_option_a':
        justification += 'Option A is ethically preferable.';
        break;
      case 'approve_option_b':
        justification += 'Option B is ethically preferable.';
        break;
      case 'negotiate_compromises':
        justification += 'Negotiation is ethically preferable.';
        break;
      default:
        justification += 'Recommendation requires further context.';
    }
  }
  
  return justification;
}

/**
 * Calculate refined confidence based on framework agreement level
 * Implements the Document 9 recommendation for confidence calculation refinement
 * Enhanced with improved parameter stability metrics (proximity-based)
 * @param {Object} results - The framework results
 * @returns {Object} Confidence score and factors
 */
function calculateRefinedConfidence(results) {
  if (!results || !results.frameworks || Object.keys(results.frameworks).length === 0) {
    return { confidence: 0, factors: {} };
  }
  
  const frameworks = Object.values(results.frameworks);
  const allActions = frameworks.map(f => f.recommendedAction);
  
  // Count occurrences of each action
  const actionCounts = {};
  allActions.forEach(action => {
    actionCounts[action] = (actionCounts[action] || 0) + 1;
  });
  
  // Find most recommended action
  const mostRecommendedAction = Object.entries(actionCounts)
    .sort((a, b) => b[1] - a[1])[0][0];
  
  // Calculate agreement ratio (how many frameworks agree with the most common action)
  const agreementRatio = actionCounts[mostRecommendedAction] / allActions.length;
  
  // Calculate number of unique actions (more unique actions = more disagreement)
  const uniqueActionsCount = Object.keys(actionCounts).length;
  const uniqueActionPenalty = (uniqueActionsCount - 1) * 0.1; // More unique actions lower confidence
  
  // Create factors object to track different confidence components
  const factors = {
    framework_agreement: agreementRatio,
    framework_diversity: Math.max(0, 1 - uniqueActionPenalty)
  };
  
  // Check for validation issues
  if (results.validation) {
    const validationScore = calculateValidationScore(results.validation);
    factors.validation_quality = validationScore;
  }
  
  // Calculate parameter stability using enhanced proximity-based algorithm
  const sensitivityScore = calculateSensitivityScore(results);
  factors.parameter_stability = sensitivityScore;
  
  // Apply weighting to confidence factors
  // Parameter stability is now weighted more significantly based on enhanced algorithm
  const weights = {
    framework_agreement: 0.4,  // 40% weight to agreement
    framework_diversity: 0.1,  // 10% weight to diversity
    validation_quality: 0.2,   // 20% weight to validation
    parameter_stability: 0.3   // 30% weight to parameter stability (increased)
  };
  
  // Calculate weighted confidence
  let weightedConfidence = 0;
  let totalWeight = 0;
  
  for (const [factor, score] of Object.entries(factors)) {
    const weight = weights[factor] || 0.25; // Default equal weighting if not specified
    weightedConfidence += score * weight;
    totalWeight += weight;
  }
  
  // Normalize if weights don't sum to 1
  if (totalWeight > 0 && Math.abs(totalWeight - 1) > 0.001) {
    weightedConfidence /= totalWeight;
  }
  
  // Ensure confidence stays in 0-1 range
  const confidence = Math.max(0, Math.min(1, weightedConfidence));
  
  return {
    confidence,
    factors
  };
}

/**
 * Calculate a validation score based on validation results
 * @param {Object} validation - Validation results
 * @returns {number} Validation score between 0-1
 */
function calculateValidationScore(validation) {
  if (!validation) return 1.0; // No validation info means perfect score
  
  let score = 1.0;
  
  // Reduce score for each warning (less impact)
  if (validation.warnings && validation.warnings.length > 0) {
    score -= Math.min(0.3, validation.warnings.length * 0.05);
  }
  
  // Reduce score for each quality issue (more impact)
  if (validation.qualityIssues && validation.qualityIssues.length > 0) {
    score -= Math.min(0.5, validation.qualityIssues.length * 0.1);
  }
  
  return Math.max(0, score);
}

/**
 * Calculate parameter stability score based on proximity to threshold boundaries
 * Implements the Document 9 recommendation for enhanced parameter stability calculation
 * @param {Object} results - Analysis results containing framework data
 * @returns {number} Parameter stability score between 0-1
 */
function calculateSensitivityScore(results) {
  if (!results || !results.frameworks) return 0.8; // Default score
  
  let totalProximityScore = 0;
  let parameterCount = 0;
  
  // Track all parameters and their threshold proximity
  const parameterProximities = [];
  
  // Analyze each framework
  for (const [frameworkName, framework] of Object.entries(results.frameworks)) {
    if (!framework.parameter_sensitivities || !framework.sensitivity_thresholds) continue;
    
    for (const param of framework.parameter_sensitivities) {
      const threshold = framework.sensitivity_thresholds[param];
      if (!threshold) continue;
      
      // Get original parameter value
      const originalValue = threshold.original_value;
      if (originalValue === undefined) continue;
      
      // Calculate proximity to thresholds (if they exist)
      let increaseProximity = 1; // Default to max (1 = far from threshold)
      let decreaseProximity = 1;
      
      if (threshold.increase_threshold !== null) {
        // Calculate how close the current value is to the increase threshold
        // Scale from 0 (very close) to 1 (very far)
        const increaseDistance = Math.abs(originalValue - threshold.increase_threshold);
        const percentOfValue = increaseDistance / Math.max(0.1, Math.abs(originalValue));
        increaseProximity = Math.min(1, Math.max(0, Math.tanh(percentOfValue * 5)));
      }
      
      if (threshold.decrease_threshold !== null) {
        // Calculate how close the current value is to the decrease threshold
        const decreaseDistance = Math.abs(originalValue - threshold.decrease_threshold);
        const percentOfValue = decreaseDistance / Math.max(0.1, Math.abs(originalValue));
        decreaseProximity = Math.min(1, Math.max(0, Math.tanh(percentOfValue * 5)));
      }
      
      // Overall proximity is the minimum of the two distances (i.e., closest threshold)
      const proximityScore = Math.min(increaseProximity, decreaseProximity);
      
      // Track this parameter's proximity
      parameterProximities.push({
        parameter: param,
        framework: frameworkName,
        originalValue,
        increaseThreshold: threshold.increase_threshold,
        decreaseThreshold: threshold.decrease_threshold,
        proximityScore,
        sensitivity: threshold.sensitivity_score
      });
      
      // Add to total
      totalProximityScore += proximityScore;
      parameterCount++;
    }
  }
  
  // If no parameters, return default
  if (parameterCount === 0) return 0.8;
  
  // Store parameter proximities for reference
  results._parameter_proximities = parameterProximities;
  
  // Calculate overall stability score
  // - The average proximity to thresholds (higher = more stable)
  const stabilityScore = totalProximityScore / parameterCount;
  
  return stabilityScore;
}

/**
 * Configuration for weight display formatting
 * Provides options for decimal precision and display format
 */
const WEIGHT_DISPLAY_CONFIG = {
  decimalPrecision: 2,         // Default decimal places to show
  advancedPrecision: 4,        // Precision for advanced mode
  usePercentages: true,        // Display as percentages by default
  preserveRatio: true,         // Maintain ratio between weights when simplifying
  minSimplifiedWeight: 0.15,   // Minimum weight after simplification to ensure visibility
  applyDomainContextual: true  // Whether to apply domain-specific and contextual adjustments
};

/**
 * Simplify weights while preserving the ratio between them
 * Implements the Document 9 recommendation for weight simplification
 * ENHANCED: Now integrates with domain-specific weighting from weighting.js
 * @param {Object} weights - Object mapping keys to weight values
 * @param {Object} dilemma - Optional dilemma context for domain-specific adjustments
 * @param {Object} options - Configuration options
 * @returns {Object} Simplified weights preserving original ratios
 */
function simplifyWeightsPreservingRatio(weights, dilemma = null, options = {}) {
  // Use default config merged with provided options
  const config = { ...WEIGHT_DISPLAY_CONFIG, ...options };
  
  // If no weights or only one weight, return as is
  if (!weights || typeof weights !== 'object' || Object.keys(weights).length <= 1) {
    return weights;
  }
  
  // Store original weights for reference in advanced mode
  const originalWeights = { ...weights };
  
  // Step 1: Apply domain-specific adjustments if dilemma is provided and feature is enabled
  let adjustedWeights = { ...weights };
  if (dilemma && config.applyDomainContextual) {
    // Extract the framework names from the weights object
    const frameworkNames = Object.keys(weights).filter(key => key !== '_originals');
    
    try {
      // Get domain-specific ethical weights from weighting.js
      const domainWeights = calculateEthicalWeights(dilemma, frameworkNames);
      
      // Apply domain weights as modifiers to the original weights
      if (domainWeights) {
        Object.keys(adjustedWeights).forEach(framework => {
          if (framework === '_originals') return;
          
          // Find the corresponding ethical weight for this framework
          const frameworkType = getFrameworkType(framework);
          
          // Apply multipliers based on framework type
          if (frameworkType === 'utilitarian' && domainWeights.beneficence) {
            adjustedWeights[framework] *= (1 + (domainWeights.beneficence - 0.5) * 0.4);
          } else if (frameworkType === 'deontology' && domainWeights.duties) {
            adjustedWeights[framework] *= (1 + (domainWeights.duties - 0.5) * 0.4);
          } else if (frameworkType === 'virtue' && domainWeights.virtues) {
            adjustedWeights[framework] *= (1 + (domainWeights.virtues - 0.5) * 0.4);
          } else if (frameworkType === 'care' && domainWeights.care) {
            adjustedWeights[framework] *= (1 + (domainWeights.care - 0.5) * 0.4);
          } else if (frameworkType === 'justice' && domainWeights.justice) {
            adjustedWeights[framework] *= (1 + (domainWeights.justice - 0.5) * 0.4);
          }
        });
      }
    } catch (error) {
      console.warn(`Error applying domain-specific weights: ${error.message}`);
    }
  }
  
  // Calculate sum of all weights
  const sum = Object.values(adjustedWeights).reduce((acc, val) => acc + val, 0);
  
  // If sum is zero or not a number, return equal weights
  if (!sum || isNaN(sum)) {
    const equalWeight = 1 / Object.keys(adjustedWeights).length;
    return Object.keys(adjustedWeights).reduce((acc, key) => {
      acc[key] = equalWeight;
      return acc;
    }, {});
  }
  
  // First normalize to ensure sum = 1
  const normalizedWeights = {};
  Object.keys(adjustedWeights).forEach(key => {
    normalizedWeights[key] = adjustedWeights[key] / sum;
  });
  
  // Apply minimum weight threshold while preserving ratios
  let hasSmallWeights = false;
  let totalAdjustment = 0;
  
  // Check if any weights are below minimum threshold
  Object.values(normalizedWeights).forEach(weight => {
    if (weight < config.minSimplifiedWeight) {
      hasSmallWeights = true;
    }
  });
  
  // If we have weights below threshold, apply adjustment
  if (hasSmallWeights && config.preserveRatio) {
    const simplifiedWeights = {};
    const keysToAdjust = [];
    let remainingWeight = 1;
    
    // First pass: identify weights below threshold
    Object.keys(normalizedWeights).forEach(key => {
      if (normalizedWeights[key] < config.minSimplifiedWeight) {
        simplifiedWeights[key] = config.minSimplifiedWeight;
        remainingWeight -= config.minSimplifiedWeight;
        totalAdjustment += (config.minSimplifiedWeight - normalizedWeights[key]);
      } else {
        keysToAdjust.push(key);
      }
    });
    
    // Second pass: proportionally reduce other weights
    if (keysToAdjust.length > 0 && remainingWeight > 0) {
      // Calculate sum of weights to adjust
      const sumToAdjust = keysToAdjust.reduce((acc, key) => acc + normalizedWeights[key], 0);
      
      // Distribute remaining weight proportionally
      keysToAdjust.forEach(key => {
        const proportion = normalizedWeights[key] / sumToAdjust;
        simplifiedWeights[key] = remainingWeight * proportion;
      });
    }
    
    // Add original weights for reference in advanced mode
    if (config.preserveOriginalWeights) {
      simplifiedWeights._originals = originalWeights;
    }
    
    // Format to specified decimal precision
    Object.keys(simplifiedWeights).forEach(key => {
      if (key !== '_originals') {
        simplifiedWeights[key] = parseFloat(simplifiedWeights[key].toFixed(config.decimalPrecision));
      }
    });
    
    return simplifiedWeights;
  }
  
  // If no small weights or not preserving ratio, just format to specified precision
  const formattedWeights = {};
  Object.keys(normalizedWeights).forEach(key => {
    formattedWeights[key] = parseFloat(normalizedWeights[key].toFixed(config.decimalPrecision));
  });
  
  // Add original weights for reference in advanced mode
  if (config.preserveOriginalWeights) {
    formattedWeights._originals = originalWeights;
  }
  
  return formattedWeights;
}

/**
 * Get the standardized framework type from a framework name
 * Helper function for weight categorization
 * @param {string} framework - The framework name
 * @returns {string} Standardized framework type
 */
function getFrameworkType(framework) {
  const fw = framework.toLowerCase();
  
  if (fw.includes('utilitarian') || fw.includes('consequential')) {
    return 'utilitarian';
  } else if (fw.includes('deontolog') || fw.includes('kant') || fw.includes('duty')) {
    return 'deontology';
  } else if (fw.includes('virtue') || fw.includes('character')) {
    return 'virtue';
  } else if (fw.includes('care') || fw.includes('feminist')) {
    return 'care';
  } else if (fw.includes('justice') || fw.includes('fair') || fw.includes('rights')) {
    return 'justice';
  } else {
    return 'other';
  }
}

/**
 * Calculate weights for different types of ethical frameworks based on context
 * Used as a fallback when calculateEthicalWeights from weighting.js fails
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Weights for each framework type
 */
function calculateFrameworkTypeWeights(dilemma) {
  const weights = {
    utilitarian: 1.0,
    deontology: 1.0,
    virtue: 1.0,
    care: 1.0,
    justice: 1.0
  };
  
  // Adjust weights based on contextual factors
  
  // Check for vulnerable populations
  const vulnerablePopulations = dilemma.stakeholders?.some(s => 
    s.name?.toLowerCase().includes('vulnerable') || 
    s.name?.toLowerCase().includes('migrant') ||
    s.name?.toLowerCase().includes('patient')
  );
  
  if (vulnerablePopulations) {
    weights.care += 0.5;  // Care ethics gets higher weight
    weights.justice += 0.3; // Justice gets somewhat higher weight
  }
  
  // Check for life-at-stake scenarios
  const lifeAtStake = dilemma.parameters?.life_at_stake?.value > 0.5;
  
  if (lifeAtStake) {
    weights.deontology += 0.4;  // Deontology gets higher weight
    weights.utilitarian += 0.3; // Utilitarianism gets somewhat higher weight
  }
  
  // Check for community impact
  const communityImpact = dilemma.stakeholders?.some(s => 
    s.name?.toLowerCase().includes('community') || 
    s.name?.toLowerCase().includes('residents')
  );
  
  if (communityImpact) {
    weights.virtue += 0.4;  // Virtue ethics gets higher weight
    weights.care += 0.2;    // Care ethics gets somewhat higher weight
  }
  
  // Check for resource allocation
  const resourceAllocation = dilemma.contextual_factors?.some(f => 
    f.factor?.toLowerCase().includes('resource') || 
    f.explanation?.toLowerCase().includes('allocation')
  );
  
  if (resourceAllocation) {
    weights.utilitarian += 0.4; // Utilitarianism gets higher weight
    weights.justice += 0.3;     // Justice gets somewhat higher weight
  }
  
  return weights;
}

/**
 * Resolve a multi-framework conflict involving 3+ frameworks
 * ENHANCED: Now uses the domain-specific weight calculations
 * @param {Object} conflict - The multi-framework conflict
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Resolution with meta-recommendation and reasoning
 */
function resolveMultiFrameworkConflict(conflict, dilemma) {
  // Extract action groups and their frameworks
  const actionGroups = conflict.action_groups;
  
  // Count how many frameworks recommend each action
  const actionCounts = {};
  for (const [action, frameworks] of Object.entries(actionGroups)) {
    actionCounts[action] = frameworks.length;
  }
  
  // Find majority and minority actions
  let majorityAction = null;
  let majorityCount = 0;
  
  for (const [action, count] of Object.entries(actionCounts)) {
    if (count > majorityCount) {
      majorityAction = action;
      majorityCount = count;
    }
  }
  
  // Get the frameworks that support the majority action
  const majorityFrameworks = actionGroups[majorityAction];
  
  // Get the minority frameworks
  const minorityFrameworks = [];
  for (const [action, frameworks] of Object.entries(actionGroups)) {
    if (action !== majorityAction) {
      minorityFrameworks.push(...frameworks);
    }
  }
  
  // ENHANCED: Get domain-specific ethical weights based on context
  let domainAdjustedWeights = {};
  try {
    // Create a list of all frameworks involved
    const allFrameworks = [];
    Object.values(actionGroups).forEach(frameworks => {
      allFrameworks.push(...frameworks);
    });
    
    // Get domain-specific ethical weights
    domainAdjustedWeights = calculateEthicalWeights(dilemma, allFrameworks);
  } catch (error) {
    console.warn(`Error calculating domain weights: ${error.message}`);
    // Use fallback weights if there's an error
    domainAdjustedWeights = calculateFrameworkTypeWeights(dilemma);
  }
  
  // Calculate weighted scores for each action
  const actionScores = {};
  const actionWeights = {}; // To track which frameworks contribute to each action
  
  for (const [action, frameworks] of Object.entries(actionGroups)) {
    let score = 0;
    const weights = {};
    
    for (const framework of frameworks) {
      // Get the framework type
      const frameworkType = getFrameworkType(framework);
      
      // Get the weight for this framework type (from domain weights if available)
      let weight = 1.0; // Default weight
      
      if (frameworkType === 'utilitarian' && domainAdjustedWeights.beneficence) {
        weight = domainAdjustedWeights.beneficence;
      } else if (frameworkType === 'deontology' && domainAdjustedWeights.duties) {
        weight = domainAdjustedWeights.duties;
      } else if (frameworkType === 'virtue' && domainAdjustedWeights.virtues) {
        weight = domainAdjustedWeights.virtues;
      } else if (frameworkType === 'care' && domainAdjustedWeights.care) {
        weight = domainAdjustedWeights.care;
      } else if (frameworkType === 'justice' && domainAdjustedWeights.justice) {
        weight = domainAdjustedWeights.justice;
      }
      
      // Add the framework's weight to the action score
      score += weight;
      weights[framework] = weight;
    }
    
    actionScores[action] = score;
    actionWeights[action] = weights;
  }
  
  // Find the action with the highest weighted score
  let recommendedAction = null;
  let highestScore = 0;
  
  for (const [action, score] of Object.entries(actionScores)) {
    if (score > highestScore) {
      highestScore = score;
      recommendedAction = action;
    }
  }
  
  // Simplify the weights for the recommended action
  const simplifiedWeights = actionWeights[recommendedAction] 
    ? simplifyWeightsPreservingRatio(actionWeights[recommendedAction], dilemma, {
        preserveOriginalWeights: true
      }) 
    : {};
  
  // Generate reasoning for the multi-framework resolution
  const reasoning = `
    This ethical dilemma involves multiple frameworks with differing recommendations. 
    
    ${majorityCount} out of ${majorityCount + minorityFrameworks.length} frameworks (${majorityFrameworks.join(', ')}) 
    recommend "${majorityAction}". 
    
    The minority frameworks (${minorityFrameworks.join(', ')}) recommend different actions.
    
    Taking into account the relative weights of different framework types in this context,
    and considering both the numerical majority and the ethical weight of each perspective,
    the recommended action is "${recommendedAction}".
    
    This multi-framework integration acknowledges the insights from all ethical perspectives
    while recognizing that in this specific context, certain ethical considerations from
    ${actionGroups[recommendedAction].join(', ')} carry more weight given the specific parameters
    of this dilemma.
  `.trim();
  
  return {
    reasoning,
    meta_recommendation: recommendedAction, // Ensure this is correctly set
    hybrid_recommendation: recommendedAction, // Add for redundancy
    action_scores: actionScores,
    majority_action: majorityAction,
    majority_frameworks: majorityFrameworks,
    minority_frameworks: minorityFrameworks,
    weights: simplifiedWeights,
    action_weights: actionWeights // Return all action weights for advanced analysis
  };
}
