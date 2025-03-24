/**
 * Parameter Access Utility
 * 
 * Provides standardized access to parameters across the REA system,
 * handling various parameter representations consistently.
 */

/**
 * @typedef {Object} DilemmaParameter
 * @property {*} [value] - The value of the parameter if using object format
 */

/**
 * @typedef {Object} DilemmaParameters
 * @property {*} [key] - Parameter values with arbitrary keys
 */

/**
 * @typedef {Object} ContextualFactor
 * @property {string} factor - The name of the factor
 * @property {*} value - The value of the factor
 */

/**
 * @typedef {Object} DilemmaContext
 * @property {DilemmaParameters} [parameters] - Parameters of the dilemma
 * @property {Object} [situation] - Nested situation object
 * @property {DilemmaParameters} [situation.parameters] - Parameters in nested structure
 * @property {Array<ContextualFactor>|Object} [contextual_factors] - Contextual factors affecting the dilemma
 */

/**
 * Extract a parameter value from a situation, handling different parameter formats
 * 
 * @param {DilemmaContext|null} situation - The situation object containing parameters
 * @param {string} paramName - The name of the parameter to extract
 * @param {*} defaultValue - Default value to return if parameter is not found
 * @returns {*} The parameter value or default value if not found
 */
export function getParameterValue(situation, paramName, defaultValue = undefined) {
  if (!situation) return defaultValue;
  
  // Try to find the parameter in the expected locations
  
  // 1. Check situation.parameters.{paramName}
  if (situation.parameters) {
    const param = situation.parameters[paramName];
    
    // Handle value object format: { value: X }
    if (param && param.value !== undefined) {
      return param.value;
    }
    
    // Handle direct value format
    if (param !== undefined) {
      return param;
    }
  }
  
  // 2. Check in situation.situation.parameters (nested structure)
  if (situation.situation && situation.situation.parameters) {
    const param = situation.situation.parameters[paramName];
    
    // Handle value object format: { value: X }
    if (param && param.value !== undefined) {
      return param.value;
    }
    
    // Handle direct value format
    if (param !== undefined) {
      return param;
    }
  }
  
  // 3. Check in primary situation object
  if (situation[paramName] !== undefined) {
    // Handle value object format in direct properties
    if (situation[paramName] && situation[paramName].value !== undefined) {
      return situation[paramName].value;
    }
    
    return situation[paramName];
  }
  
  // 4. Check in contextual_factors array
  if (situation.contextual_factors && Array.isArray(situation.contextual_factors)) {
    const factor = situation.contextual_factors.find(f => f.factor === paramName);
    if (factor && factor.value !== undefined) {
      return factor.value;
    }
  }
  
  // 5. Check in contextual_factors object
  if (situation.contextual_factors && typeof situation.contextual_factors === 'object') {
    if (situation.contextual_factors[paramName] !== undefined) {
      // Handle value object format
      if (situation.contextual_factors[paramName].value !== undefined) {
        return situation.contextual_factors[paramName].value;
      }
      
      return situation.contextual_factors[paramName];
    }
  }
  
  // Return default if parameter not found
  return defaultValue;
}

/**
 * Set a parameter value in a situation object
 * 
 * @param {DilemmaContext|null} situation - The situation object to modify
 * @param {string} paramName - The name of the parameter to set
 * @param {*} value - The value to set
 * @param {boolean} preserveFormat - Whether to preserve the existing format (default: true)
 * @returns {DilemmaContext} The modified situation object
 */
export function setParameterValue(situation, paramName, value, preserveFormat = true) {
  if (!situation) return { parameters: { [paramName]: value } };
  
  // Create a copy to avoid modifying the original
  const result = { ...situation };
  
  // Ensure parameters object exists
  if (!result.parameters) {
    result.parameters = {};
  } else {
    result.parameters = { ...result.parameters };
  }
  
  // Determine the existing format of the parameter
  const existingParam = result.parameters[paramName];
  
  // If parameter exists and has a 'value' property, maintain that format
  if (preserveFormat && existingParam && typeof existingParam === 'object' && existingParam.value !== undefined) {
    result.parameters[paramName] = {
      ...existingParam,
      value: value
    };
  } else {
    // Otherwise set directly
    result.parameters[paramName] = value;
  }
  
  return result;
}

/**
 * Compare parameter values between two situations
 * 
 * @param {DilemmaContext|null} originalSituation - The original situation
 * @param {DilemmaContext|null} newSituation - The new situation
 * @param {string} paramName - The name of the parameter to compare
 * @returns {Object|null} Change object or null if no change
 */
export function compareParameterValues(originalSituation, newSituation, paramName) {
  const originalValue = getParameterValue(originalSituation, paramName);
  const newValue = getParameterValue(newSituation, paramName);
  
  // If both values are undefined, there's no change
  if (originalValue === undefined && newValue === undefined) {
    return null;
  }
  
  // If only one value exists, it's been added or removed
  if (originalValue === undefined) {
    return { added: true, value: newValue };
  }
  
  if (newValue === undefined) {
    return { removed: true, value: originalValue };
  }
  
  // If values are the same, there's no change
  if (originalValue === newValue) {
    return null;
  }
  
  // Otherwise, return the change
  const change = {
    from: originalValue,
    to: newValue
  };
  
  // Include delta for numeric values
  if (typeof originalValue === 'number' && typeof newValue === 'number') {
    change.delta = newValue - originalValue;
  } else {
    change.delta = null;
  }
  
  return change;
}

/**
 * Detect changes in all parameters between two situations
 * 
 * @param {DilemmaContext|null} originalSituation - The original situation
 * @param {DilemmaContext|null} newSituation - The new situation
 * @returns {Object.<string, Object>} An object mapping parameter names to change information
 */
export function detectParameterChanges(originalSituation, newSituation) {
  if (!originalSituation || !newSituation) {
    return {};
  }
  
  const changes = {};
  
  // Extract parameters from both situations
  const originalParams = extractAllParameters(originalSituation);
  const newParams = extractAllParameters(newSituation);
  
  // Find all parameters present in either situation
  const allParameters = new Set([
    ...Object.keys(originalParams),
    ...Object.keys(newParams)
  ]);
  
  // Check for changes in each parameter
  allParameters.forEach(param => {
    const change = compareParameterValues(originalSituation, newSituation, param);
    
    if (change) {
      changes[param] = change;
    }
  });
  
  return changes;
}

/**
 * Extract all parameters from a situation into a flat object
 * 
 * @param {DilemmaContext|null} situation - The situation to extract parameters from
 * @returns {Object.<string, *>} Flat object mapping parameter names to values
 */
export function extractAllParameters(situation) {
  if (!situation) {
    return {};
  }
  
  const params = {};
  
  // Extract from situation.parameters
  if (situation.parameters && typeof situation.parameters === 'object') {
    Object.keys(situation.parameters).forEach(param => {
      params[param] = getParameterValue(situation, param);
    });
  }
  
  // Extract from situation.situation.parameters (nested structure)
  if (situation.situation && situation.situation.parameters) {
    Object.keys(situation.situation.parameters).forEach(param => {
      // Only add if not already extracted to avoid duplicates
      if (!params[param]) {
        params[param] = getParameterValue(situation, param);
      }
    });
  }
  
  // Extract from top-level parameters that might match known parameter names
  // This helps with handling direct parameter access
  if (situation) {
    // Common parameter names to check for direct access
    const commonParams = [
      'num_people_affected', 'certainty_of_outcome', 'life_at_stake',
      'property_value', 'time_pressure', 'population_affected'
    ];
    
    commonParams.forEach(param => {
      if (situation[param] !== undefined && !params[param]) {
        params[param] = situation[param];
        if (typeof params[param] === 'object' && params[param]?.value !== undefined) {
          params[param] = params[param].value;
        }
      }
    });
  }
  
  // Extract from contextual_factors if present
  if (situation.contextual_factors) {
    if (Array.isArray(situation.contextual_factors)) {
      situation.contextual_factors.forEach(factor => {
        if (factor && factor.factor && factor.value !== undefined) {
          // Only add if not already extracted
          if (!params[factor.factor]) {
            params[factor.factor] = factor.value;
          }
        }
      });
    } else if (typeof situation.contextual_factors === 'object') {
      Object.keys(situation.contextual_factors).forEach(factorKey => {
        const factor = situation.contextual_factors[factorKey];
        // Handle both direct value and object with value property
        if (!params[factorKey]) {
          if (factor && typeof factor === 'object' && factor.value !== undefined) {
            params[factorKey] = factor.value;
          } else {
            params[factorKey] = factor;
          }
        }
      });
    }
  }
  
  return params;
} 