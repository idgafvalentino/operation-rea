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

// Import template functions from frameworks module
import {
  getUtilitarianTemplate,
  getDeontologicalTemplate,
  getVirtueEthicsTemplate,
  getCareEthicsTemplate,
  getJusticeTemplate,
  getResolutionTemplate
} from '../frameworks/templates.js';

// Import conflict analysis functions from dedicated module
import {
  analyzeConflictNature,
  isFrameworkConflict,
  isValueConflict,
  isFactualConflict,
  isMethodologicalConflict,
  analyzeConflictSeverity,
  identifyCompromiseAreas,
  calculateFrameworkDistance,
  identifySharedEthicalDimensions,
  generateConflictDescription
} from '../analysis/conflictAnalysis.js';

// Constants for display formatting
export const WEIGHT_DISPLAY_CONFIG = {
  decimalPlaces: 2,
  showAsPercentage: true
};

/**
 * Simplifies weights while preserving their ratio
 * @param {Object} weights - Object with weights to simplify 
 * @param {Object} options - Configuration options
 * @returns {Object} Simplified weights
 */
export function simplifyWeightsPreservingRatio(weights, options = {}) {
  // Default options
  const defaults = {
    decimalPlaces: WEIGHT_DISPLAY_CONFIG.decimalPlaces,
    preserveOriginals: true,
    roundingMethod: 'round', // 'round', 'ceil', or 'floor'
  };
  
  const config = { ...defaults, ...options };
  const result = {};
  
  // If weights is empty or not an object, return empty object
  if (!weights || typeof weights !== 'object') {
    return {};
  }
  
  // Save originals if requested
  if (config.preserveOriginals) {
    result._originals = { ...weights };
  }
  
  // Get the keys excluding any special keys like '_originals'
  const keys = Object.keys(weights).filter(k => !k.startsWith('_'));
  
  // If there are no valid keys, return just the _originals if present
  if (keys.length === 0) {
    return result;
  }
  
  // Copy the weights to the result, rounded to the specified decimal places
  keys.forEach(key => {
    const value = weights[key];
    const factor = Math.pow(10, config.decimalPlaces);
    let rounded;
    
    switch(config.roundingMethod) {
      case 'ceil':
        rounded = Math.ceil(value * factor) / factor;
        break;
      case 'floor':
        rounded = Math.floor(value * factor) / factor;
        break;
      case 'round':
      default:
        rounded = Math.round(value * factor) / factor;
    }
    
    result[key] = rounded;
  });
  
  return result;
}

/**
 * Applies a hybrid duty-bounded utilitarian approach to resolve conflicts
 * @param {Object} conflict - The conflict to resolve
 * @param {Object} dilemma - The dilemma being analyzed
 * @param {Object} frameworkResults - Results from all frameworks
 * @returns {Object} The hybrid resolution
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
