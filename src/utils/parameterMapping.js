/**
 * Parameter Mapping Utility
 * 
 * Provides a standardized interface for mapping parameters between different dilemma formats.
 * Integrates with existing DilemmaAdapter and parameterAccess utilities.
 */

import { getParameterValue, setParameterValue } from './parameterAccess.js';
import { dilemmaAdapter } from '../adaptation/registry/dilemmaAdapter.js';

/**
 * @typedef {Object.<string, string>} ParameterMapping
 * A mapping of expected parameter names to actual parameter names in a specific dilemma
 */

/**
 * Registry of parameter mappings for different dilemma types
 * @type {Object.<string, ParameterMapping>}
 */
const parameterMappingRegistry = {
  // Trump Border Security Dilemma
  'trump_border_security_dilemma_2025': {
    // Utilitarian parameters
    'population_served_option_a': 'humanitarian_benefit',
    'benefit_per_person_option_a': 'bipartisan_value',
    'population_served_option_b': 'public_opinion',
    'benefit_per_person_option_b': 'political_benefit',
    
    // Deontology parameters
    'urgency_option_a': 'base_alienation',
    'urgency_option_b': 'deportation_expansion',
    
    // Care ethics parameters
    'deportation_risk': 'deportation_expansion',
    'specialized_care_importance': 'humanitarian_benefit'
  },
  
  // Add more dilemma-specific mappings here
  // 'other_dilemma_id': { ... }
};

/**
 * Registry of action mappings for different dilemma types
 * @type {Object.<string, Object>}
 */
const actionMappingRegistry = {
  // Trump Border Security Dilemma
  'trump_border_security_dilemma_2025': {
    // Framework action to dilemma action
    'framework_to_dilemma': {
      'approve_option_a': 'oppose_bill',
      'approve_option_b': 'support_bill',
      'no_action': 'negotiate_compromises'
    },
    // Dilemma action to framework action
    'dilemma_to_framework': {
      'oppose_bill': 'approve_option_a',
      'support_bill': 'approve_option_b',
      'negotiate_compromises': 'no_action'
    }
  },
  
  // Add more dilemma-specific action mappings here
  // 'other_dilemma_id': { ... }
};

/**
 * Get a mapped parameter value using the parameter mapping registry
 * @param {Object} dilemma - The dilemma object
 * @param {string} paramName - The expected parameter name
 * @param {*} defaultValue - Default value if parameter not found
 * @returns {*} The parameter value
 */
export function getMappedParameterValue(dilemma, paramName, defaultValue = 0) {
  if (!dilemma || !dilemma.id) {
    return getParameterValue(dilemma, paramName, defaultValue);
  }
  
  // Get mapping for this dilemma type
  const mapping = parameterMappingRegistry[dilemma.id];
  
  // If no mapping exists, use standard parameter access
  if (!mapping) {
    return getParameterValue(dilemma, paramName, defaultValue);
  }
  
  // Get mapped parameter name
  const mappedParamName = mapping[paramName] || paramName;
  
  // Get parameter value using the mapped name
  return getParameterValue(dilemma, mappedParamName, defaultValue);
}

/**
 * Map a framework action ID to a dilemma-specific action ID
 * @param {Object} dilemma - The dilemma object
 * @param {string} actionId - The framework action ID
 * @returns {string} The dilemma-specific action ID
 */
export function mapActionIdToDilemmaAction(dilemma, actionId) {
  if (!dilemma || !dilemma.id) {
    return actionId;
  }
  
  // Get action mapping for this dilemma type
  const mapping = actionMappingRegistry[dilemma.id];
  
  // If no mapping exists, return the original action ID
  if (!mapping || !mapping.framework_to_dilemma) {
    return actionId;
  }
  
  // Return mapped action ID or original if not found
  return mapping.framework_to_dilemma[actionId] || actionId;
}

/**
 * Map a dilemma-specific action ID to a framework action ID
 * @param {Object} dilemma - The dilemma object
 * @param {string} actionId - The dilemma-specific action ID
 * @returns {string} The framework action ID
 */
export function mapDilemmaActionToFrameworkAction(dilemma, actionId) {
  if (!dilemma || !dilemma.id) {
    return actionId;
  }
  
  // Get action mapping for this dilemma type
  const mapping = actionMappingRegistry[dilemma.id];
  
  // If no mapping exists, return the original action ID
  if (!mapping || !mapping.dilemma_to_framework) {
    return actionId;
  }
  
  // Return mapped action ID or original if not found
  return mapping.dilemma_to_framework[actionId] || actionId;
}

/**
 * Register a new parameter mapping for a dilemma type
 * @param {string} dilemmaId - The dilemma ID to register mapping for
 * @param {ParameterMapping} mapping - The parameter mapping
 * @returns {boolean} Success status
 */
export function registerParameterMapping(dilemmaId, mapping) {
  if (!dilemmaId || typeof dilemmaId !== 'string') {
    console.error('Invalid dilemma ID');
    return false;
  }
  
  if (!mapping || typeof mapping !== 'object') {
    console.error('Invalid mapping object');
    return false;
  }
  
  // Store the mapping
  parameterMappingRegistry[dilemmaId] = mapping;
  return true;
}

/**
 * Register a new action mapping for a dilemma type
 * @param {string} dilemmaId - The dilemma ID to register mapping for
 * @param {Object} mapping - The action mapping with framework_to_dilemma and dilemma_to_framework
 * @returns {boolean} Success status
 */
export function registerActionMapping(dilemmaId, mapping) {
  if (!dilemmaId || typeof dilemmaId !== 'string') {
    console.error('Invalid dilemma ID');
    return false;
  }
  
  if (!mapping || typeof mapping !== 'object') {
    console.error('Invalid mapping object');
    return false;
  }
  
  // Ensure both mappings exist
  if (!mapping.framework_to_dilemma || !mapping.dilemma_to_framework) {
    console.error('Mapping must include both framework_to_dilemma and dilemma_to_framework properties');
    return false;
  }
  
  // Store the mapping
  actionMappingRegistry[dilemmaId] = mapping;
  return true;
}

/**
 * Get the action description from a dilemma for a given action ID
 * @param {Object} dilemma - The dilemma object
 * @param {string} actionId - The action ID
 * @returns {string} The action description or the action ID if not found
 */
export function getActionDescription(dilemma, actionId) {
  if (!dilemma || !dilemma.possible_actions) {
    return actionId;
  }
  
  const action = dilemma.possible_actions.find(a => a.id === actionId);
  if (action && action.description) {
    return action.description;
  }
  
  return actionId;
}

/**
 * Validate if all required framework parameters are available after mapping
 * Also checks for potentially problematic zero-value comparisons
 * @param {Object} dilemma - The dilemma object
 * @returns {Object} Validation result with errors, warnings, and suggested fixes
 */
export function validateParameterMapping(dilemma) {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    fixes: []
  };
  
  // Required parameters for different frameworks
  const requiredParameters = {
    utilitarian: ['population_served_option_a', 'benefit_per_person_option_a', 
                 'population_served_option_b', 'benefit_per_person_option_b'],
    justice: ['population_served_option_a', 'population_served_option_b'],
    deontology: ['urgency_option_a', 'urgency_option_b'],
    care_ethics: ['deportation_risk', 'specialized_care_importance'],
    virtue_ethics: ['population_served_option_b', 'specialized_care_importance', 'urgency_option_b']
  };
  
  // Check each framework's required parameters
  for (const [framework, params] of Object.entries(requiredParameters)) {
    // Skip frameworks not used in this dilemma
    if (dilemma.frameworks && !dilemma.frameworks.includes(framework)) {
      continue;
    }
    
    for (const param of params) {
      const value = getMappedParameterValue(dilemma, param, null);
      if (value === null) {
        result.isValid = false;
        result.errors.push(`Missing required parameter for ${framework}: ${param}`);
      } else if (value === 0) {
        // Flag zero-value parameters that might lead to meaningless comparisons
        result.warnings.push(`Parameter '${param}' has value 0 for ${framework} (contextually acceptable but noted for analysis purposes)`);
        
        // Suggest potential fix
        result.fixes.push({
          type: 'zero_value',
          parameter: param,
          framework: framework,
          suggestion: `If '${param}' is contextually relevant, consider setting a non-zero value to improve comparison accuracy`
        });
      }
    }
  }
  
  // Check for zero-value comparison pairs that would result in "0 vs 0" comparisons
  if (dilemma.frameworks?.includes('utilitarian')) {
    const popA = getMappedParameterValue(dilemma, 'population_served_option_a', null);
    const popB = getMappedParameterValue(dilemma, 'population_served_option_b', null);
    
    if (popA === 0 && popB === 0) {
      result.warnings.push(`Zero-value comparison detected in utilitarian framework: population served A=0 vs B=0`);
      result.fixes.push({
        type: 'zero_comparison',
        parameters: ['population_served_option_a', 'population_served_option_b'],
        framework: 'utilitarian',
        suggestion: 'Set non-zero population values to enable meaningful utilitarian comparison'
      });
    }
    
    const benA = getMappedParameterValue(dilemma, 'benefit_per_person_option_a', null);
    const benB = getMappedParameterValue(dilemma, 'benefit_per_person_option_b', null);
    
    if (benA === 0 && benB === 0) {
      result.warnings.push(`Zero-value comparison detected in utilitarian framework: benefit per person A=0 vs B=0`);
      result.fixes.push({
        type: 'zero_comparison',
        parameters: ['benefit_per_person_option_a', 'benefit_per_person_option_b'],
        framework: 'utilitarian',
        suggestion: 'Set non-zero benefit values to enable meaningful utilitarian comparison'
      });
    }
  }
  
  if (dilemma.frameworks?.includes('justice')) {
    const popA = getMappedParameterValue(dilemma, 'population_served_option_a', null);
    const popB = getMappedParameterValue(dilemma, 'population_served_option_b', null);
    
    if (popA === 0 && popB === 0) {
      result.warnings.push(`Zero-value comparison detected in justice framework: population served A=0 vs B=0`);
      result.fixes.push({
        type: 'zero_comparison',
        parameters: ['population_served_option_a', 'population_served_option_b'],
        framework: 'justice',
        suggestion: 'Set non-zero population values to enable meaningful justice comparison'
      });
    }
  }
  
  if (dilemma.frameworks?.includes('deontology')) {
    const urgA = getMappedParameterValue(dilemma, 'urgency_option_a', null);
    const urgB = getMappedParameterValue(dilemma, 'urgency_option_b', null);
    
    if (urgA === 0 && urgB === 0) {
      result.warnings.push(`Zero-value comparison detected in deontology framework: urgency A=0 vs B=0`);
      result.fixes.push({
        type: 'zero_comparison',
        parameters: ['urgency_option_a', 'urgency_option_b'],
        framework: 'deontology',
        suggestion: 'Set non-zero urgency values to enable meaningful deontological comparison'
      });
    }
  }
  
  return result;
}

/**
 * Standardize a dilemma using the dilemma adapter and add parameter mappings
 * @param {Object} dilemma - The dilemma to standardize
 * @returns {Object} Standardized dilemma with parameter mappings
 */
export function standardizeWithMapping(dilemma) {
  // First standardize using the adapter
  const standardized = dilemmaAdapter.standardizeDilemma(dilemma);
  
  // Check if we need to add parameter mappings
  if (standardized.id && parameterMappingRegistry[standardized.id]) {
    standardized.parameterMappings = parameterMappingRegistry[standardized.id];
  }
  
  // Check if we need to add action mappings
  if (standardized.id && actionMappingRegistry[standardized.id]) {
    standardized.actionMappings = actionMappingRegistry[standardized.id];
  }
  
  return standardized;
}

/**
 * Enhanced action description retrieval that ensures consistent reference resolution
 * @param {Object} dilemma - The dilemma object
 * @param {string} actionId - The action ID
 * @param {boolean} includeOriginalId - Whether to include the original ID in the description
 * @returns {string} The action description with consistent formatting
 */
export function getEnhancedActionDescription(dilemma, actionId, includeOriginalId = false) {
  if (!actionId) return 'No action';
  
  // First try to get from dilemma's possible_actions
  let description = null;
  if (dilemma && dilemma.possible_actions) {
    const action = dilemma.possible_actions.find(a => a.id === actionId);
    if (action && action.description) {
      description = action.description;
    }
  }
  
  // If not found, try standard mappings
  if (!description) {
    const standardActions = {
      'approve_option_a': 'Approve Option A',
      'approve_option_b': 'Approve Option B', 
      'reject': 'Reject the proposal',
      'defer': 'Defer the decision',
      'support_bill': 'Support the bill for pragmatic reasons',
      'oppose_bill': 'Oppose the bill on principle',
      'negotiate_compromises': 'Negotiate additional compromises',
      'no_action': 'Take no action'
    };
    
    description = standardActions[actionId] || actionId;
  }
  
  // Optionally include the original ID for reference
  if (includeOriginalId && description !== actionId) {
    return `${description} (${actionId})`;
  }
  
  return description;
}

/**
 * Post-process results to ensure consistent action references
 * @param {Object} results - Analysis results to process
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Processed results with consistent action references
 */
export function postProcessActionReferences(results, dilemma) {
  // Create a deep copy to avoid modifying the original
  const processedResults = JSON.parse(JSON.stringify(results));
  
  // Process framework recommendations
  if (processedResults.frameworks) {
    Object.entries(processedResults.frameworks).forEach(([framework, result]) => {
      if (result.recommendedAction) {
        // Store the original ID for reference
        result.actionId = result.recommendedAction;
        // Add the description
        result.actionDescription = getEnhancedActionDescription(dilemma, result.recommendedAction);
      }
    });
  }
  
  // Process resolutions if present
  if (processedResults.resolutions && processedResults.resolutions.resolutions) {
    processedResults.resolutions.resolutions.forEach(resolution => {
      // Process meta_recommendation
      if (resolution.meta_recommendation) {
        resolution.meta_recommendation_id = resolution.meta_recommendation;
        resolution.meta_recommendation_description = getEnhancedActionDescription(
          dilemma, 
          resolution.meta_recommendation
        );
      }
      
      // Process recommendations in conflict references if present
      if (resolution.conflict_reference && resolution.conflict_reference.recommendations) {
        const enhancedRecommendations = {};
        
        Object.entries(resolution.conflict_reference.recommendations).forEach(([fw, action]) => {
          enhancedRecommendations[fw] = {
            actionId: action,
            description: getEnhancedActionDescription(dilemma, action)
          };
        });
        
        resolution.conflict_reference.enhanced_recommendations = enhancedRecommendations;
      }
    });
  }
  
  // Process final recommendation
  if (processedResults.finalRecommendation && processedResults.finalRecommendation.action) {
    processedResults.finalRecommendation.actionId = processedResults.finalRecommendation.action;
    processedResults.finalRecommendation.actionDescription = getEnhancedActionDescription(
      dilemma, 
      processedResults.finalRecommendation.action
    );
  }
  
  return processedResults;
}

export default {
  getMappedParameterValue,
  mapActionIdToDilemmaAction,
  mapDilemmaActionToFrameworkAction,
  registerParameterMapping,
  registerActionMapping,
  getActionDescription,
  validateParameterMapping,
  standardizeWithMapping,
  getEnhancedActionDescription,
  postProcessActionReferences
}; 