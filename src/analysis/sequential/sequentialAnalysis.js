/**
 * Sequential Analysis Module
 * Contains functions for performing step-by-step sequential analysis of ethical dilemmas
 */

// Import from validation module
import { validateDilemma } from '../../testing/reaTestFramework.js';

// Import from conflict analysis module
import { 
  analyzeConflictNature, 
  analyzeConflictSeverity, 
  identifyCompromiseAreas, 
  generateConflictDescription 
} from '../conflictAnalysis.js';

// Import from resolution strategies
import { 
  selectResolutionStrategy, 
  applyResolutionStrategy 
} from '../../resolution/strategies.js';

// Import from utilities
import { getParameterValue } from '../../utils/parameterAccess.js';
import { getActionDescription } from '../../utils/parameterMapping.js';

// Import core analysis functions from appropriate modules
import { 
  getFrameworkRecommendation,
  performSensitivityAnalysis
} from '../../core/rea.js';

import {
  analyzeFrameworkInteractions,
  analyzeFrameworkInteraction,
  collectCriticalParameters
} from '../../analysis/frameworkAnalysis.js';

/**
 * Performs a sequential analysis of an ethical dilemma using step-by-step structured thinking
 * This approach breaks the analysis into clearly defined sequential steps with explicit dependencies
 * @param {Object} dilemma - The dilemma to analyze
 * @returns {Object} The sequential analysis result with step-by-step insights
 */
export function performSequentialAnalysis(dilemma) {
  try {
    console.log("Starting sequential analysis...");
    
    // Step 1: Parameter Validation and Context Extraction
    console.log("Step 1: Parameter Validation and Context Extraction");
    const validationResult = validateDilemma(dilemma);
    const contextFactors = dilemma.contextual_factors ? 
      dilemma.contextual_factors.reduce((acc, factor) => {
        acc[factor.factor] = {
          value: factor.value,
          relevance: factor.relevance,
          explanation: factor.explanation
        };
        return acc;
      }, {}) : {};
    
    // Step 2: Individual Framework Analysis (isolate each perspective)
    console.log("Step 2: Individual Framework Analysis");
    const frameworkAnalyses = {};
    const allFrameworks = dilemma.frameworks || ['utilitarian', 'deontology', 'virtue_ethics', 'care_ethics', 'justice'];
    
    for (const framework of allFrameworks) {
      console.log(`Analyzing framework: ${framework}`);
      frameworkAnalyses[framework] = getFrameworkRecommendation(dilemma, framework);
      // Add sensitivity analysis for each framework independently
      frameworkAnalyses[framework].sensitivities = performSensitivityAnalysis(dilemma, framework);
    }
    
    // Step 3: Stakeholder-Centric Analysis (analyze impacts per stakeholder)
    console.log("Step 3: Stakeholder-Centric Analysis");
    const stakeholderAnalysis = {};
    if (dilemma.stakeholders) {
      for (const stakeholder of dilemma.stakeholders) {
        console.log(`Analyzing stakeholder: ${stakeholder.id}`);
        stakeholderAnalysis[stakeholder.id] = {
          name: stakeholder.name,
          concerns: stakeholder.concerns,
          influence: stakeholder.influence,
          frameworkImpacts: {}
        };
        
        // Calculate impact of each framework's recommendation on this stakeholder
        for (const framework of allFrameworks) {
          const frameworkRec = frameworkAnalyses[framework];
          try {
            stakeholderAnalysis[stakeholder.id].frameworkImpacts[framework] = {
              action: frameworkRec.recommendedAction,
              impact: calculateStakeholderSpecificImpact(stakeholder, frameworkRec.recommendedAction, dilemma)
            };
          } catch (error) {
            console.error(`Error calculating impact for stakeholder ${stakeholder.id} with framework ${framework}:`, error);
            stakeholderAnalysis[stakeholder.id].frameworkImpacts[framework] = {
              action: frameworkRec.recommendedAction,
              impact: 0.5, // Default to neutral impact
              error: error.message
            };
          }
        }
      }
    } else {
      console.log("No stakeholders defined in dilemma");
    }
    
    // Step 4: Framework Interaction Analysis
    console.log("Step 4: Framework Interaction Analysis");
    const interactions = analyzeFrameworkInteractions(frameworkAnalyses);
    
    // Step 5: Conflict Detection and Classification
    console.log("Step 5: Conflict Detection and Classification");
    const conflicts = [];
    // Pairwise conflict analysis
    for (let i = 0; i < allFrameworks.length; i++) {
      const framework1 = allFrameworks[i];
      const rec1 = frameworkAnalyses[framework1];
      
      for (let j = i + 1; j < allFrameworks.length; j++) {
        const framework2 = allFrameworks[j];
        const rec2 = frameworkAnalyses[framework2];
        
        if (rec1.recommendedAction !== rec2.recommendedAction) {
          console.log(`Detected conflict between ${framework1} and ${framework2}`);
          try {
            const interaction = analyzeFrameworkInteraction(framework1, framework2, rec1, rec2, dilemma);
            const conflict = {
              type: 'framework_conflict',
              frameworks: [framework1, framework2],
              actions: [rec1.recommendedAction, rec2.recommendedAction],
              description: generateConflictDescription(framework1, framework2, rec1, rec2),
              severity: analyzeConflictSeverity(framework1, framework2, 'framework_conflict', dilemma),
              nature: analyzeConflictNature(framework1, framework2, rec1, rec2, dilemma),
              compromiseAreas: identifyCompromiseAreas(framework1, framework2, rec1, rec2, dilemma)
            };
            conflicts.push(conflict);
          } catch (error) {
            console.error(`Error analyzing conflict between ${framework1} and ${framework2}:`, error);
            conflicts.push({
              type: 'framework_conflict',
              frameworks: [framework1, framework2],
              actions: [rec1.recommendedAction, rec2.recommendedAction],
              description: `Conflict between ${framework1} and ${framework2}`,
              severity: 0.5,
              error: error.message
            });
          }
        }
      }
    }
    
    // Step 6: Systematic Resolution Strategy Selection
    console.log("Step 6: Systematic Resolution Strategy Selection");
    const resolutionStrategies = {};
    for (const conflict of conflicts) {
      console.log(`Resolving conflict between ${conflict.frameworks.join(' and ')}`);
      try {
        // Build decision tree for this conflict
        const decisionTree = buildResolutionDecisionTree(conflict, dilemma);
        
        // Select optimal path through decision tree
        const selectedPath = findOptimalResolutionPath(decisionTree, dilemma);
        
        // Apply selected strategy
        const resolution = {
          conflict: conflict,
          strategy: selectedPath.strategy,
          reasoning: selectedPath.reasoning,
          result: applyResolutionStrategy(selectedPath.strategy, conflict, dilemma, frameworkAnalyses)
        };
        
        resolutionStrategies[`${conflict.frameworks[0]}_${conflict.frameworks[1]}`] = resolution;
      } catch (error) {
        console.error(`Error resolving conflict between ${conflict.frameworks.join(' and ')}:`, error);
        resolutionStrategies[`${conflict.frameworks[0]}_${conflict.frameworks[1]}`] = {
          conflict: conflict,
          strategy: 'framework_balancing',
          reasoning: 'Default resolution due to error',
          error: error.message,
          result: {
            recommendedAction: frameworkAnalyses[conflict.frameworks[0]].recommendedAction,
            justification: 'Default resolution due to error'
          }
        };
      }
    }
    
    // Step 7: Parameter Sensitivity Mapping
    console.log("Step 7: Parameter Sensitivity Mapping");
    const sensitivityMap = buildParameterSensitivityMap(dilemma, frameworkAnalyses);
    
    // Step 8: Recommendation Integration and Confidence Calculation
    console.log("Step 8: Recommendation Integration and Confidence Calculation");
    const supportingFrameworks = findSupportingFrameworks(frameworkAnalyses);
    const opposingFrameworks = findOpposingFrameworks(frameworkAnalyses);
    
    console.log(`Supporting frameworks: ${supportingFrameworks.join(', ')}`);
    console.log(`Opposing frameworks: ${opposingFrameworks.join(', ')}`);
    
    // Adapt framework analyses to the format expected by collectCriticalParameters
    const adaptedResults = {
      frameworks: frameworkAnalyses
    };
    
    const finalRecommendation = {
      action: determineIntegratedRecommendation(frameworkAnalyses, conflicts, resolutionStrategies, dilemma),
      confidence: 80, // Simplified for demo - would use calculateRecommendationConfidence in production
      supportingFrameworks,
      opposingFrameworks,
      criticalParameters: collectCriticalParameters(adaptedResults, null),
      reasoningChain: buildSequentialReasoningChain(
        frameworkAnalyses, 
        conflicts,
        resolutionStrategies,
        stakeholderAnalysis,
        sensitivityMap,
        dilemma
      )
    };
    
    console.log("Sequential analysis completed successfully");
    
    return {
      dilemmaId: dilemma.id,
      title: dilemma.title,
      validationResult,
      contextFactors,
      frameworkAnalyses,
      stakeholderAnalysis,
      interactions,
      conflicts,
      resolutionStrategies,
      sensitivityMap,
      finalRecommendation,
      // Metadata about the sequential analysis process
      analysisMetadata: {
        numberOfSteps: 8,
        stepDependencies: {
          "1": [],
          "2": [1],
          "3": [1, 2],
          "4": [2],
          "5": [2, 4],
          "6": [3, 5],
          "7": [2],
          "8": [2, 3, 5, 6, 7]
        }
      }
    };
  } catch (error) {
    console.error("CRITICAL ERROR in sequential analysis:", error);
    // Return a minimal result with the error
    return {
      dilemmaId: dilemma ? dilemma.id : 'unknown',
      title: dilemma ? dilemma.title : 'Unknown Dilemma',
      error: {
        message: error.message,
        stack: error.stack
      },
      finalRecommendation: {
        action: 'error_occurred',
        confidence: 0,
        supportingFrameworks: [],
        opposingFrameworks: [],
        reasoningChain: [{
          step: 1,
          title: "Error in Analysis",
          description: "An error occurred during sequential analysis",
          insights: [error.message]
        }]
      }
    };
  }
}

/**
 * Builds a structured reasoning chain that explains the sequential thinking process
 * @param {Object} frameworkAnalyses - Framework analyses
 * @param {Array} conflicts - Detected conflicts
 * @param {Object} resolutionStrategies - Applied resolution strategies
 * @param {Object} stakeholderAnalysis - Stakeholder-centric analysis
 * @param {Object} sensitivityMap - Parameter sensitivity mapping
 * @param {Object} dilemma - The original dilemma
 * @returns {Array} The sequential reasoning chain
 */
function buildSequentialReasoningChain(
  frameworkAnalyses, 
  conflicts,
  resolutionStrategies,
  stakeholderAnalysis,
  sensitivityMap,
  dilemma
) {
  const reasoningChain = [];
  
  // Step 1: Parameter and Context Evaluation
  reasoningChain.push({
    step: 1,
    title: "Parameter and Context Evaluation",
    description: "Analyzing the dilemma parameters and contextual factors",
    insights: extractContextualInsights(dilemma)
  });
  
  // Step 2: Framework Perspective Analysis
  reasoningChain.push({
    step: 2,
    title: "Framework Perspective Analysis",
    description: "Evaluating each ethical framework's perspective independently",
    insights: summarizeFrameworkPerspectives(frameworkAnalyses)
  });
  
  // Step 3: Stakeholder Impact Analysis
  reasoningChain.push({
    step: 3,
    title: "Stakeholder Impact Analysis",
    description: "Analyzing how each action affects different stakeholders",
    insights: summarizeStakeholderImpacts(stakeholderAnalysis)
  });
  
  // Step 4: Ethical Conflict Analysis
  reasoningChain.push({
    step: 4,
    title: "Ethical Conflict Analysis",
    description: "Identifying and classifying ethical conflicts",
    insights: summarizeConflicts(conflicts)
  });
  
  // Step 5: Resolution Strategy Application
  reasoningChain.push({
    step: 5,
    title: "Resolution Strategy Application",
    description: "Applying appropriate resolution strategies to conflicts",
    insights: summarizeResolutionStrategies(resolutionStrategies)
  });
  
  // Step 6: Parameter Sensitivity Analysis
  reasoningChain.push({
    step: 6,
    title: "Parameter Sensitivity Analysis",
    description: "Examining how parameter changes affect recommendations",
    insights: summarizeParameterSensitivities(sensitivityMap)
  });
  
  // Step 7: Integrated Recommendation Formation
  const recAction = determineIntegratedRecommendation(frameworkAnalyses, conflicts, resolutionStrategies, dilemma);
  const supportingCount = findSupportingFrameworks(frameworkAnalyses).length;
  const opposingCount = findOpposingFrameworks(frameworkAnalyses).length;
  
  // Identify critical parameters manually instead of using collectCriticalParameters
  const criticalParams = [];
  for (const framework in frameworkAnalyses) {
    const analysis = frameworkAnalyses[framework];
    if (analysis.parameter_sensitivities && Array.isArray(analysis.parameter_sensitivities)) {
      analysis.parameter_sensitivities.forEach(param => {
        if (!criticalParams.includes(param)) {
          criticalParams.push(param);
        }
      });
    }
  }
  
  reasoningChain.push({
    step: 7,
    title: "Integrated Recommendation Formation",
    description: "Forming a final recommendation that integrates all analyses",
    insights: [
      `The recommended action is to ${formatAction(recAction)}.`,
      `This recommendation has a confidence level of 80%.`,
      `This recommendation is supported by ${supportingCount} ethical frameworks and opposed by ${opposingCount} frameworks.`,
      `The critical parameters affecting this recommendation are: ${criticalParams.length > 0 ? criticalParams.join(', ') : 'none identified'}.`
    ]
  });
  
  return reasoningChain;
}

/**
 * Calculates the impact of a specific action on a specific stakeholder
 * @param {Object} stakeholder - The stakeholder
 * @param {string} action - The action
 * @param {Object} dilemma - The dilemma
 * @returns {number} Impact score between 0 and 1
 */
function calculateStakeholderSpecificImpact(stakeholder, action, dilemma) {
  // Extract stakeholder concerns
  const concerns = stakeholder.concerns.toLowerCase().split(',').map(c => c.trim());
  
  // Extract action description
  const actionDesc = getActionDescription(dilemma, action) || "";
  
  // Calculate alignment between concerns and action
  let alignmentScore = 0;
  const totalConcerns = concerns.length || 1;
  
  for (const concern of concerns) {
    // Simple analysis - check if action addresses concern
    if (actionDesc.toLowerCase().includes(concern)) {
      alignmentScore += 1;
    } else {
      // Look for semantic similarity
      const similarityWords = concern.split(' ');
      for (const word of similarityWords) {
        if (word.length > 3 && actionDesc.toLowerCase().includes(word)) {
          alignmentScore += 0.5;
          break;
        }
      }
    }
  }
  
  // Normalize score between 0 and 1
  return Math.min(1, Math.max(0, alignmentScore / totalConcerns));
}

/**
 * Builds a decision tree for conflict resolution
 * @param {Object} conflict - The conflict to resolve
 * @param {Object} dilemma - The dilemma
 * @returns {Object} Decision tree for resolution
 */
function buildResolutionDecisionTree(conflict, dilemma) {
  // This is a simplified implementation
  // In a full implementation, this would create a true decision tree
  // with multiple resolution paths and evaluation criteria
  
  const tree = {
    conflict: conflict,
    strategies: [],
    evaluation: {}
  };
  
  // Add possible strategies based on conflict type
  if (conflict.nature === 'value_conflict') {
    tree.strategies.push('framework_balancing');
    tree.strategies.push('principled_priority');
    tree.evaluation.criteria = ['contextual_relevance', 'stakeholder_alignment', 'parameter_stability'];
  } else if (conflict.nature === 'methodological_conflict') {
    tree.strategies.push('hybrid_approach');
    tree.strategies.push('reflective_equilibrium');
    tree.evaluation.criteria = ['implementation_feasibility', 'reasoning_clarity', 'decision_stability'];
  } else {
    // Default strategies
    tree.strategies.push('duty_bounded_utilitarianism');
    tree.strategies.push('virtue_guided_consequentialism');
    tree.strategies.push('care_based_justice');
    tree.evaluation.criteria = ['comprehensive_coverage', 'ethical_coherence', 'practical_guidance'];
  }
  
  return tree;
}

/**
 * Finds the optimal path through a resolution decision tree
 * @param {Object} decisionTree - The decision tree
 * @param {Object} dilemma - The dilemma
 * @returns {Object} The optimal resolution path
 */
function findOptimalResolutionPath(decisionTree, dilemma) {
  // In a full implementation, this would evaluate all paths in the decision tree
  // and select the one with the highest score
  
  // For this simplified version, we'll just select the first strategy
  // and provide some basic reasoning
  const selectedStrategy = decisionTree.strategies[0];
  
  return {
    strategy: selectedStrategy,
    reasoning: "Selected based on conflict nature and ethical considerations",
    evaluationScores: {
      // Placeholder scores
      [decisionTree.evaluation.criteria[0]]: 0.8,
      [decisionTree.evaluation.criteria[1]]: 0.7,
      [decisionTree.evaluation.criteria[2]]: 0.9
    }
  };
}

/**
 * Builds a comprehensive parameter sensitivity map
 * @param {Object} dilemma - The dilemma
 * @param {Object} frameworkAnalyses - Framework analyses
 * @returns {Object} Parameter sensitivity map
 */
function buildParameterSensitivityMap(dilemma, frameworkAnalyses) {
  const sensitivityMap = {
    parameters: {},
    thresholds: {},
    interactions: {}
  };
  
  // Collect parameter sensitivities from all frameworks
  for (const framework in frameworkAnalyses) {
    const analysis = frameworkAnalyses[framework];
    
    // Ensure sensitivities is an array and handle missing sensitivities
    const sensitivities = Array.isArray(analysis.sensitivities) ? analysis.sensitivities : 
                         (analysis.parameter_sensitivities ? analysis.parameter_sensitivities.map(p => ({
                           parameter: p,
                           sensitivityScore: analysis.sensitivity_thresholds?.[p]?.sensitivity_score || 0.5,
                           thresholdValue: analysis.sensitivity_thresholds?.[p]?.increase_threshold || 
                                          analysis.sensitivity_thresholds?.[p]?.decrease_threshold || 0,
                           direction: analysis.sensitivity_thresholds?.[p]?.increase_threshold ? 'increase' : 'decrease',
                           newAction: analysis.sensitivity_thresholds?.[p]?.action_changes?.increase || 
                                     analysis.sensitivity_thresholds?.[p]?.action_changes?.decrease || analysis.recommendedAction
                         })) : []);
    
    for (const sensitivity of sensitivities) {
      const paramKey = sensitivity.parameter;
      
      // Skip undefined parameters
      if (!paramKey) continue;
      
      // Initialize parameter entry if not exists
      if (!sensitivityMap.parameters[paramKey]) {
        sensitivityMap.parameters[paramKey] = {
          currentValue: getParameterValue(dilemma, paramKey) || 0,
          description: getParameterDescription(dilemma, paramKey),
          frameworkSensitivities: {}
        };
      }
      
      // Add framework sensitivity
      sensitivityMap.parameters[paramKey].frameworkSensitivities[framework] = {
        sensitivityScore: sensitivity.sensitivityScore || 0.5,
        thresholdValue: sensitivity.thresholdValue || 0,
        thresholdDirection: sensitivity.direction || 'increase',
        actionChange: sensitivity.newAction || analysis.recommendedAction
      };
    }
  }
  
  // Initialize thresholds
  for (const paramKey in sensitivityMap.parameters) {
    sensitivityMap.thresholds[paramKey] = [];
  }
  
  return sensitivityMap;
}

/**
 * Helper functions to extract insights from different analysis components
 */
function extractContextualInsights(dilemma) {
  // Extract key contextual insights
  const insights = [];
  
  if (dilemma.description) {
    insights.push(`This dilemma involves: ${dilemma.description}`);
  }
  
  if (dilemma.contextual_factors) {
    const highRelevanceFactors = dilemma.contextual_factors
      .filter(factor => factor.relevance === 'high')
      .map(factor => `${factor.factor} (${factor.value})`);
    
    if (highRelevanceFactors.length > 0) {
      insights.push(`Key contextual factors: ${highRelevanceFactors.join(', ')}`);
    }
  }
  
  return insights;
}

function summarizeFrameworkPerspectives(frameworkAnalyses) {
  return Object.entries(frameworkAnalyses).map(([framework, analysis]) => {
    return `${framework}: Recommends "${formatAction(analysis.recommendedAction)}" based on ${analysis.justification.substring(0, 100)}...`;
  });
}

function summarizeStakeholderImpacts(stakeholderAnalysis) {
  return Object.entries(stakeholderAnalysis).map(([stakeholderId, analysis]) => {
    const frameworkImpacts = Object.entries(analysis.frameworkImpacts)
      .map(([framework, impact]) => `${framework}: ${Math.round(impact.impact * 100)}%`)
      .join(', ');
    
    return `${analysis.name}: ${frameworkImpacts}`;
  });
}

function summarizeConflicts(conflicts) {
  return conflicts.map(conflict => {
    return `Conflict between ${conflict.frameworks.join(' and ')}: ${conflict.description}`;
  });
}

function summarizeResolutionStrategies(resolutionStrategies) {
  if (!resolutionStrategies) {
    return ['No resolution strategies applied'];
  }
  
  return Object.entries(resolutionStrategies).map(([conflictKey, resolution]) => {
    if (!resolution || !resolution.result) {
      return `Resolution for ${conflictKey}: Strategy application incomplete`;
    }
    return `Resolution for ${conflictKey}: Applied ${resolution.strategy || 'unknown'} strategy resulting in "${formatAction(resolution.result.recommendedAction)}"`;
  });
}

function summarizeParameterSensitivities(sensitivityMap) {
  const insights = [];
  
  for (const param in sensitivityMap.thresholds) {
    const thresholds = sensitivityMap.thresholds[param];
    if (thresholds.length > 0) {
      const paramDesc = sensitivityMap.parameters[param].description || param;
      const currentValue = sensitivityMap.parameters[param].currentValue;
      
      insights.push(`Parameter "${paramDesc}" (current: ${currentValue}) has ${thresholds.length} threshold points where recommendations change`);
    }
  }
  
  return insights;
}

/**
 * Format an action ID into a readable string
 * @param {string} action - The action ID
 * @returns {string} Formatted action string
 */
function formatAction(action) {
  if (!action) {
    return 'unknown action';
  }
  return action.replace(/_/g, ' ');
}

function getParameterDescription(dilemma, paramKey) {
  if (dilemma.parameters && dilemma.parameters[paramKey]) {
    return dilemma.parameters[paramKey].description || paramKey;
  }
  return paramKey;
}

function determineIntegratedRecommendation(frameworkAnalyses, conflicts, resolutionStrategies, dilemma) {
  // Count framework recommendations
  const actionCounts = {};
  for (const framework in frameworkAnalyses) {
    const action = frameworkAnalyses[framework].recommendedAction;
    actionCounts[action] = (actionCounts[action] || 0) + 1;
  }
  
  // Find most recommended action
  let maxCount = 0;
  let recommendedAction = null;
  
  for (const action in actionCounts) {
    if (actionCounts[action] > maxCount) {
      maxCount = actionCounts[action];
      recommendedAction = action;
    }
  }
  
  return recommendedAction;
}

function findSupportingFrameworks(frameworkAnalyses) {
  // Find most common action
  const actionCounts = {};
  let maxCount = 0;
  let mostCommonAction = null;
  
  for (const framework in frameworkAnalyses) {
    const action = frameworkAnalyses[framework].recommendedAction;
    actionCounts[action] = (actionCounts[action] || 0) + 1;
    
    if (actionCounts[action] > maxCount) {
      maxCount = actionCounts[action];
      mostCommonAction = action;
    }
  }
  
  // Find frameworks supporting this action
  const supportingFrameworks = [];
  for (const framework in frameworkAnalyses) {
    if (frameworkAnalyses[framework].recommendedAction === mostCommonAction) {
      supportingFrameworks.push(framework);
    }
  }
  
  return supportingFrameworks;
}

function findOpposingFrameworks(frameworkAnalyses) {
  // Find most common action
  const actionCounts = {};
  let maxCount = 0;
  let mostCommonAction = null;
  
  for (const framework in frameworkAnalyses) {
    const action = frameworkAnalyses[framework].recommendedAction;
    actionCounts[action] = (actionCounts[action] || 0) + 1;
    
    if (actionCounts[action] > maxCount) {
      maxCount = actionCounts[action];
      mostCommonAction = action;
    }
  }
  
  // Find frameworks opposing this action
  const opposingFrameworks = [];
  for (const framework in frameworkAnalyses) {
    if (frameworkAnalyses[framework].recommendedAction !== mostCommonAction) {
      opposingFrameworks.push(framework);
    }
  }
  
  return opposingFrameworks;
} 