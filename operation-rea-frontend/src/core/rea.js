/**
 * Core REA Module
 * Contains the primary REA system functionality for ethical analysis and conflict resolution
 */

// Import from validation module
import {
  validateDilemma,
  standardizeResolutionDetail,
  standardizeProcessingMode
} from '../testing/reaTestFramework.js';

// Import analysis functions
import {
  analyzeConflictNature,
  analyzeConflictSeverity,
  identifyCompromiseAreas,
  generateConflictDescription
} from '../analysis/conflictAnalysis.js';

// Import sequential analysis
import { performSequentialAnalysis } from '../analysis/sequential/sequentialAnalysis.js';

// Import framework analysis functions
import {
  analyzeFrameworkInteractions,
  analyzeFrameworkInteraction
} from '../analysis/frameworkAnalysis.js';

// Import multi-framework analysis
import {
  analyzeMultiFrameworkConflict,
  resolveMultiFrameworkConflict,
  generateReasoningFromTemplate
} from '../analysis/multiFrameworkAnalysis.js';

// Import resolution strategies
import {
  selectResolutionStrategy,
  applyResolutionStrategy
} from '../resolution/strategies.js';

// Import parameter mapping utilities
import {
  getMappedParameterValue,
  validateParameterMapping,
  postProcessActionReferences
} from '../utils/parameterMapping.js';

/**
 * Gets a framework's recommendation for a dilemma
 * @param {Object} dilemma - The dilemma to analyze
 * @param {string} framework - The ethical framework to use
 * @returns {Object} Framework recommendation
 */
export function getFrameworkRecommendation(dilemma, framework) {
  // This is a simplified implementation migrated from the testing adapter
  console.log(`Getting ${framework} recommendation for dilemma ${dilemma.id}`);

  // Default values if not found
  const available_actions = dilemma.available_actions || ['action_a', 'action_b', 'action_c'];
  const actions = [...available_actions]; // Clone to avoid modifying original

  // For demonstration, use a deterministic but framework-specific selection
  let recommendedAction;
  let justification;

  switch (framework.toLowerCase()) {
    case 'utilitarian':
      // Utilitarians focus on greatest good for greatest number
      recommendedAction = actions[0]; // First action
      justification = "This action maximizes overall utility by producing the greatest amount of good for the greatest number of people.";
      break;

    case 'deontology':
      // Deontology focuses on duties and rules
      recommendedAction = actions[actions.length > 1 ? 1 : 0]; // Second action or first if only one exists
      justification = "This action aligns with universal moral duties and respects the autonomy of all persons involved.";
      break;

    case 'virtue_ethics':
      // Virtue ethics focuses on character and virtues
      recommendedAction = actions[actions.length > 2 ? 2 : 0]; // Third action or first if less than 3 exist
      justification = "This action exemplifies the virtues of wisdom, courage, and justice that a virtuous person would demonstrate.";
      break;

    case 'care_ethics':
      // Care ethics focuses on relationships and care
      recommendedAction = actions[actions.length > 1 ? 1 : 0]; // Second action or first if only one exists
      justification = "This action prioritizes relationships and caring for the vulnerable stakeholders in this situation.";
      break;

    case 'justice':
      // Justice focuses on fairness and equality
      recommendedAction = actions[actions.length > 2 ? 2 : 0]; // Third action or first if less than 3 exist
      justification = "This action ensures a fair distribution of benefits and burdens among all stakeholders.";
      break;

    default:
      // Default case
      recommendedAction = actions[0]; // Default to first action
      justification = "This action represents a balance of ethical considerations.";
  }

  return {
    recommendedAction,
    justification,
    framework,
    confidence: 0.8, // Default confidence level
    values_emphasized: getFrameworkValues(framework),
    methodology: getFrameworkMethodology(framework)
  };
}

/**
 * Performs sensitivity analysis for a dilemma using a specific framework
 * @param {Object} dilemma - The dilemma to analyze
 * @param {string} framework - The ethical framework to use
 * @returns {Object} Sensitivity analysis results
 */
export function performSensitivityAnalysis(dilemma, framework) {
  // This is a simplified implementation migrated from the testing adapter
  console.log(`Performing sensitivity analysis for ${framework} on dilemma ${dilemma.id}`);

  // Get the current recommendation
  const baseRecommendation = getFrameworkRecommendation(dilemma, framework);

  // Identify parameters that might be sensitive
  const sensitivities = [];
  const thresholds = {};

  // Sample parameters for different frameworks
  if (framework === 'utilitarian') {
    sensitivities.push('harm_level', 'benefit_distribution');

    thresholds['harm_level'] = {
      sensitivity_score: 0.8,
      increase_threshold: 8,
      decrease_threshold: 2,
      action_changes: {
        increase: dilemma.available_actions?.[1] || 'fallback_action',
        decrease: baseRecommendation.recommendedAction
      }
    };
  }
  else if (framework === 'deontology') {
    sensitivities.push('rights_violation', 'duty_fulfillment');

    thresholds['rights_violation'] = {
      sensitivity_score: 0.9,
      increase_threshold: 7,
      action_changes: {
        increase: dilemma.available_actions?.[0] || 'fallback_action'
      }
    };
  }
  else if (framework === 'virtue_ethics') {
    sensitivities.push('integrity_impact', 'character_development');
  }
  else if (framework === 'care_ethics') {
    sensitivities.push('relationship_impact', 'vulnerability_factor');

    thresholds['vulnerability_factor'] = {
      sensitivity_score: 0.7,
      increase_threshold: 8,
      action_changes: {
        increase: dilemma.available_actions?.[2] || 'fallback_action'
      }
    };
  }
  else if (framework === 'justice') {
    sensitivities.push('fairness_perception', 'equality_impact');
  }

  return {
    sensitivities,
    thresholds
  };
}

/**
 * Process an ethical dilemma through the REA system
 * Enhanced with validation and action reference resolution
 * @param {Object} dilemma - The dilemma to analyze
 * @returns {Object} Framework analysis results
 */
export function processEthicalDilemma(dilemma) {
  console.log(`Processing dilemma via core REA module: ${dilemma.id}`);

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
        ...recommendation.validationInfo.fixes.map(f => ({ ...f, framework }))
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

  // Perform framework interaction analysis
  const frameworkInteractions = analyzeFrameworkInteractions(results);
  results.frameworkInteractions = frameworkInteractions;

  // Post-process action references to ensure consistency
  postProcessActionReferences(results, standardizedDilemma);

  return results;
}

/**
 * Detect conflicts in a dilemma - enhanced with improved analysis
 * @param {Object} dilemma - The dilemma to analyze
 * @returns {Object} Detected conflicts with enhanced analysis
 */
export function detectConflicts(dilemma) {
  console.log(`Detecting conflicts via core REA module for: ${dilemma.id}`);

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
        // Use enhanced conflict analysis
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
    // Analyze the multi-framework conflict more thoroughly
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

  return {
    dilemma_id: dilemma.id,
    conflicts: conflicts,
    interactions: interactions,
    action_groups: actionGroups
  };
}

/**
 * Resolve conflicts between frameworks using appropriate resolution strategies
 * Enhanced with hybrid strategies for complex cases
 * @param {Object} frameworkResults - Results from framework analysis
 * @param {Object} conflicts - Detected conflicts
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Conflict resolutions
 */
export function resolveConflicts(frameworkResults, conflicts, dilemma) {
  console.log(`Resolving conflicts via core REA module for: ${dilemma.id}`);

  const resolutions = [];

  // Process each conflict
  conflicts.conflicts.forEach((conflict, index) => {
    let resolution;

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
          meta_recommendation: multiResult.meta_recommendation,
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
          meta_recommendation: fallbackAction,
          processing_mode: "basic",
          detail_level: "low"
        };
      }
    } else {
      // Handle standard framework conflicts
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

    // Ensure resolution is defined before standardizing
    if (resolution) {
      // Standardize the resolution detail level
      const standardizedResolution = standardizeResolutionDetail(resolution);
      resolutions.push(standardizedResolution);
    }
  });

  return {
    dilemma_id: dilemma.id,
    resolutions: resolutions
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
    resolveConflicts,
    performSequentialAnalysis
  };
}

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
 * Helper functions for framework recommendation
 */
function getFrameworkValues(framework) {
  switch (framework.toLowerCase()) {
    case 'utilitarian':
      return ['utility', 'happiness', 'well-being'];
    case 'deontology':
      return ['duty', 'respect', 'autonomy'];
    case 'virtue_ethics':
      return ['wisdom', 'courage', 'justice'];
    case 'care_ethics':
      return ['care', 'relationships', 'empathy'];
    case 'justice':
      return ['fairness', 'equality', 'rights'];
    default:
      return ['balance', 'moderation'];
  }
}

function getFrameworkMethodology(framework) {
  switch (framework.toLowerCase()) {
    case 'utilitarian':
      return 'consequentialist';
    case 'deontology':
      return 'rule-based';
    case 'virtue_ethics':
      return 'character-based';
    case 'care_ethics':
      return 'relationship-based';
    case 'justice':
      return 'fairness-based';
    default:
      return 'balanced';
  }
} 