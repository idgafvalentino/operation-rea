/**
 * REA Testing Framework
 * A comprehensive testing framework for dilemma-based ethical reasoning
 */

import { deepCopy, extractKeywords } from '../utils/general.js';

/**
 * Validates a dilemma against the standardized template
 * @param {Object} dilemma - The dilemma to validate
 * @returns {Object} Validation results with errors and warnings
 */
export function validateDilemma(dilemma) {
  // Initialize validation result with severity tracking
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    fixed: false,
    fixes: [],
    // Track error severity counts
    severityCounts: {
      critical: 0,
      moderate: 0, 
      minor: 0
    },
    // Auto-correction stats
    autoCorrections: {
      applied: 0,
      failed: 0,
      details: []
    }
  };
  
  // Function to add an error with severity level
  const addError = (message, severity = 'moderate', autoCorrect = null) => {
    // Add error with severity level
    const error = { 
      message, 
      severity, 
      timestamp: new Date().toISOString(),
      code: `ERR_${severity.toUpperCase()}_${result.errors.length + 1}`
    };
    
    result.errors.push(error);
    result.isValid = false;
    result.severityCounts[severity]++;
    
    // If auto-correction function is provided, attempt to apply it
    if (autoCorrect && typeof autoCorrect === 'function') {
      try {
        const correction = autoCorrect(dilemma);
        if (correction.success) {
          // Update the dilemma with the correction
          Object.assign(dilemma, correction.updates);
          
          // Record the auto-correction
          result.autoCorrections.applied++;
          result.autoCorrections.details.push({
            error: message,
            correction: correction.description,
            success: true
          });
          
          // Mark that fixes were applied
          result.fixed = true;
          result.fixes.push({
            field: correction.field,
            description: correction.description,
            automatic: true
          });
          
          // Downgrade severity since it was auto-fixed
          result.severityCounts[severity]--;
          if (severity === 'critical') {
            result.severityCounts.moderate++;
            error.severity = 'moderate (auto-fixed)';
          } else if (severity === 'moderate') {
            result.severityCounts.minor++;
            error.severity = 'minor (auto-fixed)';
          } else {
            error.severity = 'minor (auto-fixed)';
          }
        } else {
          // Record failed auto-correction
          result.autoCorrections.failed++;
          result.autoCorrections.details.push({
            error: message,
            correction: correction.description || "Auto-correction failed",
            success: false
          });
        }
      } catch (e) {
        // Record auto-correction error
        result.autoCorrections.failed++;
        result.autoCorrections.details.push({
          error: message,
          correction: `Auto-correction failed: ${e.message}`,
          success: false
        });
      }
    }
  };
  
  // Function to add a warning
  const addWarning = (message) => {
    result.warnings.push({ 
      message, 
      timestamp: new Date().toISOString(),
      code: `WARN_${result.warnings.length + 1}`
    });
  };
  
  // Check required fields
  if (!dilemma) {
    addError('Dilemma is null or undefined', 'critical');
    return result;
  }
  
  // Check dilemma ID
  if (!dilemma.id) {
    addError('Dilemma is missing an ID', 'critical', (d) => {
      return {
        success: true,
        field: 'id',
        description: 'Generated random ID',
        updates: { id: `dilemma-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` }
      };
    });
  }
  
  // Check dilemma title
  if (!dilemma.title) {
    addError('Dilemma is missing a title', 'moderate', (d) => {
      // Try to generate a title from the ID
      let title = '';
      if (d.id) {
        title = d.id.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      } else {
        title = 'Untitled Ethical Dilemma';
      }
      
      return {
        success: true,
        field: 'title',
        description: 'Generated title from ID or used default',
        updates: { title }
      };
    });
  }
  
  // Check dilemma description
  if (!dilemma.description) {
    addError('Dilemma is missing a description', 'moderate', (d) => {
      // Generate a simple description if possible
      let description = '';
      if (d.title) {
        description = `Ethical analysis of the "${d.title}" dilemma.`;
      } else {
        description = 'An ethical dilemma requiring analysis.';
      }
      
      return {
        success: true,
        field: 'description',
        description: 'Generated basic description',
        updates: { description }
      };
    });
  }
  
  // Check for parameters object
  if (!dilemma.parameters) {
    addError('Dilemma is missing parameters object', 'critical', (d) => {
      return {
        success: true,
        field: 'parameters',
        description: 'Created empty parameters object',
        updates: { parameters: {} }
      };
    });
  } else if (typeof dilemma.parameters !== 'object') {
    addError('Dilemma parameters must be an object', 'critical');
  } else if (Object.keys(dilemma.parameters).length === 0) {
    addWarning('Dilemma parameters object is empty');
  }
  
  // Check for frameworks array
  if (!dilemma.frameworks) {
    addError('Dilemma is missing frameworks array', 'critical', (d) => {
      return {
        success: true,
        field: 'frameworks',
        description: 'Added default frameworks array',
        updates: { frameworks: ['utilitarian', 'deontology', 'virtue_ethics', 'care_ethics', 'justice'] }
      };
    });
  } else if (!Array.isArray(dilemma.frameworks)) {
    addError('Dilemma frameworks must be an array', 'critical', (d) => {
      // If it's a string, try to split it
      if (typeof d.frameworks === 'string') {
        return {
          success: true,
          field: 'frameworks',
          description: 'Converted frameworks string to array',
          updates: { frameworks: d.frameworks.split(/[,\s]+/).filter(Boolean) }
        };
      }
      return {
        success: true,
        field: 'frameworks',
        description: 'Replaced invalid frameworks with default array',
        updates: { frameworks: ['utilitarian', 'deontology', 'virtue_ethics', 'care_ethics', 'justice'] }
      };
    });
  } else if (dilemma.frameworks.length === 0) {
    addError('Dilemma frameworks array is empty', 'moderate', (d) => {
      return {
        success: true,
        field: 'frameworks',
        description: 'Added default frameworks to empty array',
        updates: { frameworks: ['utilitarian', 'deontology', 'virtue_ethics', 'care_ethics', 'justice'] }
      };
    });
  }
  
  // Check for possible actions array
  if (!dilemma.possible_actions) {
    addError('Dilemma is missing possible_actions array', 'critical', (d) => {
      // Try to generate default actions
      return {
        success: true,
        field: 'possible_actions',
        description: 'Added default possible actions',
        updates: { 
          possible_actions: [
            { id: 'approve_option_a', description: 'Approve Option A' },
            { id: 'approve_option_b', description: 'Approve Option B' },
            { id: 'negotiate_compromises', description: 'Negotiate compromises' }
          ] 
        }
      };
    });
  } else if (!Array.isArray(dilemma.possible_actions)) {
    addError('Dilemma possible_actions must be an array', 'critical');
  } else if (dilemma.possible_actions.length === 0) {
    addError('Dilemma possible_actions array is empty', 'moderate');
  } else {
    // Check that each action has id and description
    dilemma.possible_actions.forEach((action, index) => {
      if (!action.id) {
        addError(`Action at index ${index} is missing an id`, 'moderate', (d) => {
          // Generate an ID based on the description if available
          if (action.description) {
            const id = action.description
              .toLowerCase()
              .replace(/[^\w\s]/g, '')
              .replace(/\s+/g, '_')
              .substring(0, 30);
            
            d.possible_actions[index].id = id;
            
            return {
              success: true,
              field: `possible_actions[${index}].id`,
              description: 'Generated ID from description',
              updates: {} // We've already modified the dilemma object directly
            };
          }
          return {
            success: false,
            description: 'Cannot generate ID without description'
          };
        });
      }
      
      if (!action.description) {
        addError(`Action at index ${index} is missing a description`, 'minor', (d) => {
          // Generate a description from the ID if available
          if (action.id) {
            const description = action.id
              .replace(/_/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());
            
            d.possible_actions[index].description = description;
            
            return {
              success: true,
              field: `possible_actions[${index}].description`,
              description: 'Generated description from ID',
              updates: {} // We've already modified the dilemma object directly
            };
          }
          return {
            success: false,
            description: 'Cannot generate description without ID'
          };
        });
      }
    });
  }
  
  // Check stakeholders
  if (dilemma.stakeholders) {
    if (!Array.isArray(dilemma.stakeholders)) {
      addError('Dilemma stakeholders must be an array', 'moderate');
    } else {
      // Check that each stakeholder has id and name
      dilemma.stakeholders.forEach((stakeholder, index) => {
        if (!stakeholder.id) {
          addError(`Stakeholder at index ${index} is missing an id`, 'moderate', (d) => {
            // Generate an ID based on the name if available
            if (stakeholder.name) {
              const id = stakeholder.name
                .toLowerCase()
                .replace(/[^\w\s]/g, '')
                .replace(/\s+/g, '_')
                .substring(0, 30);
              
              d.stakeholders[index].id = id;
              
              return {
                success: true,
                field: `stakeholders[${index}].id`,
                description: 'Generated ID from name',
                updates: {} // We've already modified the dilemma object directly
              };
            }
            return {
              success: false,
              description: 'Cannot generate ID without name'
            };
          });
        }
        
        if (!stakeholder.name) {
          addError(`Stakeholder at index ${index} is missing a name`, 'minor', (d) => {
            // Generate a name from the ID if available
            if (stakeholder.id) {
              const name = stakeholder.id
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
              
              d.stakeholders[index].name = name;
              
              return {
                success: true,
                field: `stakeholders[${index}].name`,
                description: 'Generated name from ID',
                updates: {} // We've already modified the dilemma object directly
              };
            }
            return {
              success: false,
              description: 'Cannot generate name without ID'
            };
          });
        }
      });
    }
  }
  
  // Check processing_mode
  if (dilemma.processing_mode && !['standard', 'advanced', 'simple'].includes(dilemma.processing_mode)) {
    addError(`Invalid processing_mode: ${dilemma.processing_mode}`, 'minor', (d) => {
      // Default to standard mode
      return {
        success: true,
        field: 'processing_mode',
        description: 'Set processing_mode to standard',
        updates: { processing_mode: 'standard' }
      };
    });
  }
  
  // Generate summary of validation result
  if (result.errors.length > 0) {
    result.summary = `Validation failed with ${result.errors.length} errors (${result.severityCounts.critical} critical, ${result.severityCounts.moderate} moderate, ${result.severityCounts.minor} minor)`;
    if (result.autoCorrections.applied > 0) {
      result.summary += `, ${result.autoCorrections.applied} automatically fixed`;
    }
  } else {
    result.summary = 'Validation successful';
  }
  
  return result;
}

/**
 * Creates a diagnostic wrapper around a dilemma to track parameter access
 * @param {Object} dilemma - The dilemma to wrap
 * @returns {Object} Wrapped dilemma with access tracking
 */
export function createDiagnosticWrapper(dilemma) {
  const accessLog = {
    parameters: {},
    contextual_factors: {},
    stakeholders: {},
    accessed_by_rules: {}
  };
  
  // Create wrapper for parameters
  const parametersProxy = new Proxy(dilemma.parameters || {}, {
    get(target, prop) {
      if (typeof prop === 'symbol' || prop === 'toJSON') {
        return target[prop];
      }
      
      if (!accessLog.parameters[prop]) {
        accessLog.parameters[prop] = { count: 0, rules: [] };
      }
      
      accessLog.parameters[prop].count++;
      
      // Capture which rule is accessing this parameter
      const stack = new Error().stack;
      const callerMatch = stack.match(/at (\w+Rule)/);
      if (callerMatch && callerMatch[1]) {
        const ruleName = callerMatch[1];
        accessLog.parameters[prop].rules.push(ruleName);
        
        if (!accessLog.accessed_by_rules[ruleName]) {
          accessLog.accessed_by_rules[ruleName] = [];
        }
        if (!accessLog.accessed_by_rules[ruleName].includes(prop)) {
          accessLog.accessed_by_rules[ruleName].push(prop);
        }
      }
      
      return target[prop];
    }
  });
  
  // Create proxy for contextual factors
  const contextualFactorsProxy = new Proxy(dilemma.contextual_factors || {}, {
    get(target, prop) {
      if (typeof prop === 'symbol' || prop === 'toJSON') {
        return target[prop];
      }
      
      if (!accessLog.contextual_factors[prop]) {
        accessLog.contextual_factors[prop] = { count: 0, rules: [] };
      }
      
      accessLog.contextual_factors[prop].count++;
      
      // Capture which rule is accessing this factor
      const stack = new Error().stack;
      const callerMatch = stack.match(/at (\w+Rule)/);
      if (callerMatch && callerMatch[1]) {
        const ruleName = callerMatch[1];
        accessLog.contextual_factors[prop].rules.push(ruleName);
        
        if (!accessLog.accessed_by_rules[ruleName]) {
          accessLog.accessed_by_rules[ruleName] = [];
        }
        if (!accessLog.accessed_by_rules[ruleName].includes(`contextual:${prop}`)) {
          accessLog.accessed_by_rules[ruleName].push(`contextual:${prop}`);
        }
      }
      
      return target[prop];
    }
  });
  
  // Create proxy for stakeholders array
  const stakeholdersProxy = new Proxy(dilemma.stakeholders || [], {
    get(target, prop) {
      if (typeof prop === 'symbol' || prop === 'toJSON' || isNaN(Number(prop))) {
        return target[prop];
      }
      
      const stakeholder = target[prop];
      if (!stakeholder) return stakeholder;
      
      if (!accessLog.stakeholders[stakeholder.id]) {
        accessLog.stakeholders[stakeholder.id] = { count: 0, rules: [] };
      }
      
      accessLog.stakeholders[stakeholder.id].count++;
      
      // Capture which rule is accessing this stakeholder
      const stack = new Error().stack;
      const callerMatch = stack.match(/at (\w+Rule)/);
      if (callerMatch && callerMatch[1]) {
        const ruleName = callerMatch[1];
        accessLog.stakeholders[stakeholder.id].rules.push(ruleName);
        
        if (!accessLog.accessed_by_rules[ruleName]) {
          accessLog.accessed_by_rules[ruleName] = [];
        }
        if (!accessLog.accessed_by_rules[ruleName].includes(`stakeholder:${stakeholder.id}`)) {
          accessLog.accessed_by_rules[ruleName].push(`stakeholder:${stakeholder.id}`);
        }
      }
      
      return stakeholder;
    }
  });
  
  // Create a wrapped dilemma with proxies
  const wrappedDilemma = {
    ...dilemma,
    parameters: parametersProxy,
    contextual_factors: contextualFactorsProxy,
    stakeholders: stakeholdersProxy,
    
    // Method to get access logs
    getAccessLog() {
      return accessLog;
    },
    
    // Method to analyze access patterns
    analyzeAccessPatterns() {
      const unusedParameters = Object.keys(dilemma.parameters || {})
        .filter(param => !accessLog.parameters[param] || accessLog.parameters[param].count === 0);
      
      const mostAccessedParameters = Object.entries(accessLog.parameters)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([param, data]) => ({ param, count: data.count }));
      
      const parametersByRule = Object.entries(accessLog.accessed_by_rules)
        .map(([rule, params]) => ({ rule, params }));
      
      return {
        unusedParameters,
        mostAccessedParameters,
        parametersByRule
      };
    }
  };
  
  return wrappedDilemma;
}

/**
 * Run basic parameter tests on a dilemma
 * @param {Object} dilemma - Original dilemma to test
 * @param {Function} testREASWithDilemma - Function to test the REA system with dilemmas
 * @returns {Object} Test results
 */
export function runBasicParameterTest(dilemma, testREASWithDilemma) {
  // Create a modified dilemma with only parameter changes
  const modifiedDilemma = deepCopy(dilemma);
  
  // Modify 1-2 key parameters by small amounts
  Object.keys(modifiedDilemma.parameters).slice(0, 2).forEach(key => {
    const param = modifiedDilemma.parameters[key];
    // Increase or decrease by 10%
    param.value = typeof param.value === 'number' ? 
      param.value * (Math.random() > 0.5 ? 1.1 : 0.9) : 
      param.value;
  });
  
  return testREASWithDilemma(dilemma, modifiedDilemma, {
    level: 'basic',
    focusOn: 'parameter_changes_only'
  });
}

/**
 * Run stakeholder influence tests on a dilemma
 * @param {Object} dilemma - Original dilemma to test
 * @param {Function} testREASWithDilemma - Function to test the REA system with dilemmas
 * @returns {Object} Test results
 */
export function runStakeholderInfluenceTest(dilemma, testREASWithDilemma) {
  // Start with basic parameter changes
  const result = runBasicParameterTest(dilemma, testREASWithDilemma);
  const modifiedDilemma = deepCopy(result.modifiedDilemma);
  
  // Modify stakeholder influences
  if (modifiedDilemma.stakeholders && modifiedDilemma.stakeholders.length > 0) {
    // Increase influence of one stakeholder
    const stakeholderIndex = Math.floor(Math.random() * modifiedDilemma.stakeholders.length);
    const stakeholder = modifiedDilemma.stakeholders[stakeholderIndex];
    stakeholder.influence = Math.min(1.0, stakeholder.influence * 1.3);
  }
  
  return testREASWithDilemma(dilemma, modifiedDilemma, {
    level: 'intermediate',
    focusOn: 'stakeholder_influence'
  });
}

/**
 * Run contextual factors tests on a dilemma
 * @param {Object} dilemma - Original dilemma to test
 * @param {Function} testREASWithDilemma - Function to test the REA system with dilemmas
 * @returns {Object} Test results
 */
export function runContextualFactorsTest(dilemma, testREASWithDilemma) {
  // Start with stakeholder influences
  const result = runStakeholderInfluenceTest(dilemma, testREASWithDilemma);
  const modifiedDilemma = deepCopy(result.modifiedDilemma);
  
  // Modify contextual factors
  if (modifiedDilemma.contextual_factors) {
    const factorKeys = Object.keys(modifiedDilemma.contextual_factors);
    if (factorKeys.length > 0) {
      // Change one contextual factor
      const randomFactor = factorKeys[Math.floor(Math.random() * factorKeys.length)];
      const factor = modifiedDilemma.contextual_factors[randomFactor];
      
      // For qualitative factors, choose a different value
      if (typeof factor.value === 'string') {
        const possibleValues = ['low', 'moderate', 'high', 'very_high', 'critical', 
                              'established', 'emerging', 'contested', 'strengthened'];
        const currentIndex = possibleValues.indexOf(factor.value);
        const newIndex = (currentIndex + 1) % possibleValues.length;
        factor.value = possibleValues[newIndex];
      }
    }
  }
  
  return testREASWithDilemma(dilemma, modifiedDilemma, {
    level: 'advanced',
    focusOn: 'contextual_factors'
  });
}

/**
 * Run rule conflict tests on a dilemma
 * @param {Object} dilemma - Original dilemma to test
 * @param {Function} testREASWithDilemma - Function to test the REA system with dilemmas
 * @returns {Object} Test results
 */
export function runRuleConflictTest(dilemma, testREASWithDilemma) {
  // Create a dilemma designed to trigger multiple rules
  const modifiedDilemma = deepCopy(dilemma);
  
  // Modify parameters to trigger multiple rules
  // Use insights from diagnostic mode to identify parameters used by multiple rules
  const diagnosticDilemma = createDiagnosticWrapper(dilemma);
  
  // Run a test to gather access information
  const testResult = testREASWithDilemma(diagnosticDilemma, diagnosticDilemma, {
    level: 'diagnostic',
    focusOn: 'parameter_access'
  });
  
  const accessAnalysis = diagnosticDilemma.analyzeAccessPatterns();
  
  // Find parameters accessed by multiple rules
  const sharedParameters = {};
  accessAnalysis.parametersByRule.forEach(({rule, params}) => {
    params.forEach(param => {
      // Only consider actual parameters (not contextual factors or stakeholders)
      if (!param.startsWith('contextual:') && !param.startsWith('stakeholder:')) {
        sharedParameters[param] = (sharedParameters[param] || 0) + 1;
      }
    });
  });
  
  // Modify the top 3 most shared parameters
  Object.entries(sharedParameters)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .forEach(([param]) => {
      if (modifiedDilemma.parameters[param]) {
        if (typeof modifiedDilemma.parameters[param].value === 'number') {
          // Significant change to trigger multiple rules
          modifiedDilemma.parameters[param].value *= 0.5;
        }
      }
    });
  
  return testREASWithDilemma(dilemma, modifiedDilemma, {
    level: 'expert',
    focusOn: 'rule_conflicts'
  });
}

/**
 * Compare expected outcomes with actual outcomes from REA system
 * @param {Object} dilemma - The dilemma with expected outcomes
 * @param {Object} results - The actual results from REA system
 * @returns {Object} Comparison results
 */
export function compareOutcomes(dilemma, results) {
  if (!dilemma.expected_outcomes || !results) {
    return {
      passed: false,
      mismatches: ["No expected outcomes or results to compare"]
    };
  }
  
  const comparison = {
    passed: true,
    mismatches: [],
    matches: []
  };
  
  Object.entries(dilemma.expected_outcomes).forEach(([framework, expectedOutcome]) => {
    const actualOutcome = results[framework];
    
    if (!actualOutcome) {
      comparison.passed = false;
      comparison.mismatches.push(`No results found for framework: ${framework}`);
      return;
    }
    
    // Compare original action
    if (expectedOutcome.original_action && 
        expectedOutcome.original_action !== actualOutcome.original_action) {
      comparison.passed = false;
      comparison.mismatches.push(
        `Framework ${framework}: Expected original action "${expectedOutcome.original_action}" but got "${actualOutcome.original_action}"`
      );
    } else if (expectedOutcome.original_action) {
      comparison.matches.push(
        `Framework ${framework}: Original action matched "${expectedOutcome.original_action}"`
      );
    }
    
    // Compare adapted action
    if (expectedOutcome.adapted_action && 
        expectedOutcome.adapted_action !== actualOutcome.adapted_action) {
      comparison.passed = false;
      comparison.mismatches.push(
        `Framework ${framework}: Expected adapted action "${expectedOutcome.adapted_action}" but got "${actualOutcome.adapted_action}"`
      );
    } else if (expectedOutcome.adapted_action) {
      comparison.matches.push(
        `Framework ${framework}: Adapted action matched "${expectedOutcome.adapted_action}"`
      );
    }
    
    // Check if expected sensitive parameters were considered
    if (expectedOutcome.parameter_sensitivities && 
        actualOutcome.parameter_sensitivities) {
      const missingSensitivities = expectedOutcome.parameter_sensitivities.filter(
        param => !actualOutcome.parameter_sensitivities.includes(param)
      );
      
      if (missingSensitivities.length > 0) {
        comparison.passed = false;
        comparison.mismatches.push(
          `Framework ${framework}: Expected sensitive parameters not considered: ${missingSensitivities.join(', ')}`
        );
      }
    }
  });
  
  return comparison;
}

/**
 * Run a comprehensive test suite on a dilemma
 * @param {Object} dilemma - The dilemma to test
 * @param {Function} testREASWithDilemma - Function to test the REA system
 * @returns {Object} Comprehensive test results
 */
export function runComprehensiveTest(dilemma, testREASWithDilemma) {
  // First, validate the dilemma
  const validationResults = validateDilemma(dilemma);
  if (!validationResults.isValid) {
    return {
      passed: false,
      stage: 'validation',
      errors: validationResults.errors,
      warnings: validationResults.warnings
    };
  }
  
  // Run progressive tests
  const testResults = {
    validation: validationResults,
    basic: runBasicParameterTest(dilemma, testREASWithDilemma),
    intermediate: runStakeholderInfluenceTest(dilemma, testREASWithDilemma),
    advanced: runContextualFactorsTest(dilemma, testREASWithDilemma),
    expert: runRuleConflictTest(dilemma, testREASWithDilemma)
  };
  
  // Check if any tests failed
  const failedTests = Object.entries(testResults)
    .filter(([stage, result]) => 
      stage !== 'validation' && 
      result && 
      result.passed === false
    )
    .map(([stage]) => stage);
  
  return {
    passed: failedTests.length === 0,
    failedStages: failedTests,
    results: testResults
  };
}

// Export a default test function that can be used directly
export default function testDilemma(dilemma, reaSystem) {
  // Create a wrapper function that tests with REA
  const testREASWithDilemma = (original, modified, options) => {
    // Process both dilemmas with REA system
    const originalResults = reaSystem.process(original);
    const modifiedResults = reaSystem.process(modified);
    
    // Compare results
    return {
      passed: true, // Default to passed, would need actual comparison logic
      originalDilemma: original,
      modifiedDilemma: modified,
      originalResults,
      modifiedResults,
      options
    };
  };
  
  // Run the comprehensive test
  return runComprehensiveTest(dilemma, testREASWithDilemma);
}

/**
 * Component Structure Schema Definitions
 * Provides explicit schemas for different component types with required and optional fields
 */
export const DETAIL_LEVEL_SPECIFICATIONS = {
  low: {
    required: ['description', 'resolution_strategy'],
    optional: ['weights', 'reasoning'],
    detailScore: 1
  },
  medium: {
    required: ['description', 'resolution_strategy', 'reasoning', 'weights'],
    optional: ['priority_framework', 'priority_reason', 'compromise_proposal', 'procedural_proposal'],
    detailScore: 2
  },
  high: {
    required: ['description', 'resolution_strategy', 'reasoning', 'weights', 'priority_framework', 'priority_reason'],
    optional: ['detailed_precedent_analysis', 'casuistry_resolution', 'meta_analysis', 'initial_judgments', 'revised_principles'],
    detailScore: 3
  }
};

/**
 * Standardize detail level for a resolution
 * @param {Object} resolution - The resolution to standardize
 * @param {string} [detailLevel] - The target detail level (low, medium, high)
 * @returns {Object} Standardized resolution
 */
export function standardizeResolutionDetail(resolution, detailLevel = null) {
  if (!resolution) return resolution;
  
  // If detail level is not specified, use the one from the resolution or default to medium
  const strategyDetailLevel = detailLevel || resolution.detail_level || 'medium';
  
  // Get the specification for this detail level
  const specs = DETAIL_LEVEL_SPECIFICATIONS[strategyDetailLevel] || DETAIL_LEVEL_SPECIFICATIONS.medium;
  
  // Create a new resolution object with the same properties
  const standardized = { ...resolution };
  
  // Add the detail level property if not present
  if (!standardized.detail_level) {
    standardized.detail_level = strategyDetailLevel;
  }
  
  // Check for missing required components
  const missingRequired = [];
  
  for (const required of specs.required) {
    if (!standardized[required]) {
      missingRequired.push(required);
    }
  }
  
  // Add validation information
  if (!standardized.validation) {
    standardized.validation = {
      detailLevel: strategyDetailLevel,
      schemaVersion: '1.0',
      timestamp: new Date().toISOString(),
      valid: missingRequired.length === 0
    };
  }
  
  if (missingRequired.length > 0) {
    standardized.validation.missingRequired = missingRequired;
    standardized.validation.message = `Resolution missing required components for ${strategyDetailLevel} detail level: ${missingRequired.join(', ')}`;
  }
  
  return standardized;
}

/**
 * Validate component structure against its schema
 * @param {Object} component - The component to validate
 * @param {string} componentType - The type of component (resolution, framework, etc.)
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export function validateComponentStructure(component, componentType, options = {}) {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    componentType,
    missingRequired: [],
    unexpectedFields: []
  };
  
  // Define schemas for different component types
  const schemas = {
    resolution: {
      required: ['id', 'resolution_strategy', 'description'],
      optional: ['weights', 'reasoning', 'priority_framework', 'priority_reason', 
                'compromise_proposal', 'procedural_proposal', 'meta_analysis',
                'casuistry_resolution', 'precedent_cases', 'detailed_precedent_analysis'],
      validStrategies: ['framework_balancing', 'principled_priority', 'compromise', 
                       'procedural', 'meta_ethical', 'casuistry', 'stakeholder_compromise',
                       'multi_framework_integration', 'reflective_equilibrium', 'pluralistic_integration']
    },
    framework: {
      required: ['recommendedAction', 'justification'],
      optional: ['parameter_sensitivities', 'sensitivity_thresholds', 'confidence', 'explanations']
    },
    conflict: {
      required: ['type', 'description', 'severity'],
      optional: ['between', 'action_groups', 'recommendations', 'justifications', 'concerns']
    },
    interaction: {
      required: ['type', 'description', 'strength'],
      optional: ['frameworks', 'interaction_type', 'justification_similarity', 'shared_ethical_dimensions']
    },
    stakeholder: {
      required: ['id', 'name'],
      optional: ['concerns', 'influence', 'impact', 'explanation']
    }
  };
  
  // Get schema for this component type
  const schema = schemas[componentType];
  if (!schema) {
    result.isValid = false;
    result.errors.push({
      code: 'UNKNOWN_COMPONENT_TYPE',
      message: `Unknown component type: ${componentType}`
    });
    return result;
  }
  
  // Check if component is null or undefined
  if (!component) {
    result.isValid = false;
    result.errors.push({
      code: 'NULL_COMPONENT',
      message: `${componentType} component is null or undefined`
    });
    return result;
  }
  
  // Check for missing required fields
  for (const required of schema.required) {
    if (component[required] === undefined) {
      result.isValid = false;
      result.missingRequired.push(required);
      result.errors.push({
        code: 'MISSING_REQUIRED_FIELD',
        field: required,
        message: `Missing required field: ${required}`
      });
    }
  }
  
  // Check for strategy-specific validations
  if (componentType === 'resolution' && component.resolution_strategy) {
    // Check that strategy is valid
    if (!schema.validStrategies.includes(component.resolution_strategy)) {
      result.warnings.push({
        code: 'UNKNOWN_STRATEGY',
        strategy: component.resolution_strategy,
        message: `Unknown resolution strategy: ${component.resolution_strategy}`
      });
    }
    
    // Check for strategy-specific required fields
    const strategyFields = {
      'principled_priority': ['priority_framework', 'priority_reason'],
      'compromise': ['compromise_proposal'],
      'procedural': ['procedural_proposal'],
      'meta_ethical': ['meta_analysis'],
      'casuistry': ['precedent_cases', 'casuistry_resolution'],
      'multi_framework_integration': ['meta_recommendation', 'action_groups']
    };
    
    const requiredForStrategy = strategyFields[component.resolution_strategy] || [];
    
    for (const field of requiredForStrategy) {
      if (component[field] === undefined) {
        result.warnings.push({
          code: 'MISSING_STRATEGY_FIELD',
          strategy: component.resolution_strategy,
          field,
          message: `Strategy ${component.resolution_strategy} should include ${field}`
        });
      }
    }
  }
  
  // Check for unexpected fields if strict validation is enabled
  if (options.strict) {
    const allowedFields = [...schema.required, ...schema.optional];
    
    for (const field in component) {
      if (!allowedFields.includes(field)) {
        result.unexpectedFields.push(field);
        result.warnings.push({
          code: 'UNEXPECTED_FIELD',
          field,
          message: `Unexpected field for ${componentType}: ${field}`
        });
      }
    }
  }
  
  // Generate summary
  if (result.errors.length > 0) {
    result.summary = `${componentType} validation failed with ${result.errors.length} errors`;
    if (result.missingRequired.length > 0) {
      result.summary += `: missing required fields [${result.missingRequired.join(', ')}]`;
    }
  } else if (result.warnings.length > 0) {
    result.summary = `${componentType} validation passed with ${result.warnings.length} warnings`;
  } else {
    result.summary = `${componentType} validation successful`;
  }
  
  return result;
}

/**
 * Verify the overall quality of processing output
 * @param {Object} results - The processing results to verify
 * @returns {Object} Quality verification result
 */
export function verifyOutputQuality(results) {
  const qualityResult = {
    isValid: true,
    issues: [],
    recommendations: []
  };
  
  if (!results) {
    qualityResult.isValid = false;
    qualityResult.issues.push('Results object is null or undefined');
    return qualityResult;
  }
  
  // Check for framework recommendations
  if (!results.frameworks || Object.keys(results.frameworks).length === 0) {
    qualityResult.isValid = false;
    qualityResult.issues.push('Results are missing framework recommendations');
    qualityResult.recommendations.push('Ensure all framework analyses are completed');
  }
  
  // Check that all frameworks have recommendations and justifications
  if (results.frameworks) {
    for (const [framework, analysis] of Object.entries(results.frameworks)) {
      // Validate framework component structure
      const frameworkValidation = validateComponentStructure(analysis, 'framework');
      
      if (!frameworkValidation.isValid) {
        qualityResult.isValid = false;
        for (const error of frameworkValidation.errors) {
          qualityResult.issues.push(`Framework ${framework}: ${error.message}`);
        }
      }
    }
  }
  
  // Check for stakeholder impacts
  if (!results.stakeholderImpacts || Object.keys(results.stakeholderImpacts).length === 0) {
    qualityResult.isValid = false;
    qualityResult.issues.push('Results are missing stakeholder impacts');
    qualityResult.recommendations.push('Calculate impacts for each stakeholder');
  }
  
  // Check for final recommendation
  if (results.finalRecommendation || results.final_recommendation) {
    // Use whichever property is available, with preference for final_recommendation
    const recommendation = results.final_recommendation || results.finalRecommendation;
    
    if (!recommendation.action) {
      qualityResult.isValid = false;
      qualityResult.issues.push('Final recommendation is missing an action');
    }
    
    if (!recommendation.reasoning) {
      qualityResult.isValid = false;
      qualityResult.issues.push('Final recommendation is missing reasoning');
    }
    
    if (recommendation.confidence === undefined) {
      qualityResult.isValid = false;
      qualityResult.issues.push('Final recommendation is missing a confidence score');
    }
  } else {
    qualityResult.isValid = false;
    qualityResult.issues.push('Final recommendation not yet generated (will be created in subsequent processing steps)');
    qualityResult.recommendations.push('Generating final recommendation with action, reasoning, and confidence in final processing phase');
  }
  
  // Check resolutions if conflicts exist
  if (results.conflicts && results.conflicts.conflicts && results.conflicts.conflicts.length > 0) {
    if (!results.resolutions || !results.resolutions.resolutions || results.resolutions.resolutions.length === 0) {
      qualityResult.isValid = false;
      qualityResult.issues.push('Conflicts detected but no resolutions generated');
      qualityResult.recommendations.push('Generate resolutions for each detected conflict');
    } else {
      // Check that we have at least one resolution per conflict
      if (results.resolutions.resolutions.length < results.conflicts.conflicts.length) {
        qualityResult.issues.push(`Not all conflicts resolved: ${results.resolutions.resolutions.length} resolutions for ${results.conflicts.conflicts.length} conflicts`);
      }
      
      // Validate each resolution
      results.resolutions.resolutions.forEach((resolution, index) => {
        const resolutionValidation = validateComponentStructure(resolution, 'resolution');
        
        if (!resolutionValidation.isValid) {
          qualityResult.isValid = false;
          for (const error of resolutionValidation.errors) {
            qualityResult.issues.push(`Resolution #${index + 1}: ${error.message}`);
          }
        }
        
        // Check detail level standardization
        if (resolution.resolution_strategy) {
          const detailLevel = resolution.detail_level || 'medium';
          const specs = DETAIL_LEVEL_SPECIFICATIONS[detailLevel];
          
          if (specs) {
            const missingRequired = [];
            
            for (const required of specs.required) {
              if (resolution[required] === undefined) {
                missingRequired.push(required);
              }
            }
            
            if (missingRequired.length > 0) {
              qualityResult.issues.push(`Resolution missing required components for ${detailLevel} detail level: ${missingRequired.join(', ')}`);
            }
          }
        }
      });
    }
  }
  
  return qualityResult;
}

/**
 * Standardize processing mode for a dilemma
 * @param {Object} dilemma - The dilemma to standardize
 * @param {string} mode - The processing mode to use
 * @returns {Object} Standardized dilemma with processing mode
 */
export function standardizeProcessingMode(dilemma, mode = 'standard') {
  if (!dilemma) return { isValid: false, issues: ['Dilemma is null or undefined'] };
  
  const validModes = ['simple', 'standard', 'advanced'];
  const result = {
    isValid: true,
    issues: [],
    standardizedDilemma: { ...dilemma }
  };
  
  // Validate processing mode
  if (!validModes.includes(mode)) {
    result.issues.push(`Invalid processing_mode: ${mode}, defaulting to 'standard'`);
    result.standardizedDilemma.processing_mode = 'standard';
  } else {
    result.standardizedDilemma.processing_mode = mode;
  }
  
  // Apply mode-specific standardization
  switch (result.standardizedDilemma.processing_mode) {
    case 'simple':
      // For simple mode, ensure minimum required components
      if (!result.standardizedDilemma.frameworks || !Array.isArray(result.standardizedDilemma.frameworks)) {
        result.standardizedDilemma.frameworks = ['utilitarian', 'deontology'];
        result.issues.push('Added default frameworks for simple mode');
      }
      break;
      
    case 'advanced':
      // For advanced mode, ensure additional components are present
      if (!result.standardizedDilemma.frameworks || !Array.isArray(result.standardizedDilemma.frameworks) || 
          result.standardizedDilemma.frameworks.length < 3) {
        result.standardizedDilemma.frameworks = [
          'utilitarian', 'deontology', 'virtue_ethics', 'care_ethics', 'justice'
        ];
        result.issues.push('Added comprehensive frameworks for advanced mode');
      }
      
      // Ensure stakeholders are present
      if (!result.standardizedDilemma.stakeholders || !Array.isArray(result.standardizedDilemma.stakeholders)) {
        result.standardizedDilemma.stakeholders = [];
        result.issues.push('Added empty stakeholders array for advanced mode');
      }
      
      // Ensure contextual factors are present
      if (!result.standardizedDilemma.contextual_factors || !Array.isArray(result.standardizedDilemma.contextual_factors)) {
        result.standardizedDilemma.contextual_factors = [];
        result.issues.push('Added empty contextual_factors array for advanced mode');
      }
      break;
      
    case 'standard':
    default:
      // For standard mode, ensure minimum components
      if (!result.standardizedDilemma.frameworks || !Array.isArray(result.standardizedDilemma.frameworks)) {
        result.standardizedDilemma.frameworks = ['utilitarian', 'deontology', 'virtue_ethics'];
        result.issues.push('Added default frameworks for standard mode');
      }
      break;
  }
  
  // Check for advanced features
  if (!result.standardizedDilemma.advancedFeatures) {
    result.standardizedDilemma.advancedFeatures = {
      useAdvancedFrameworkModeling: result.standardizedDilemma.processing_mode === 'advanced',
      enableDetailedSensitivityAnalysis: result.standardizedDilemma.processing_mode === 'advanced',
      useDynamicCaseDatabase: false
    };
  }
  
  return result;
} 