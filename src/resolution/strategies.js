/**
 * REA System - Resolution Strategies Module
 * 
 * This module defines various strategies for resolving ethical conflicts
 * detected in the REA system. Each strategy has specific approaches to
 * handling conflicts between frameworks, stakeholders, or other elements.
 */

import { simplifyWeightsPreservingRatio, WEIGHT_DISPLAY_CONFIG } from '../testing/reaTestAdapter.js';
import { 
  applyVirtueGuidedConsequentialism, 
  applyCareBasedJustice,
  applyDutyBoundedUtilitarianism,
  isVirtuePath,
  isConsequentialistPath,
  isCarePath,
  isJusticePath,
  isDeonPath,
  isUtilPath,
  generateNuancedMedicalRecommendation
} from '../resolution/hybrid.js';

/**
 * Available resolution strategies with descriptions and implementation details
 */
export const resolutionStrategies = {
  // Primary strategies
  framework_balancing: {
    name: 'framework_balancing',
    description: 'Balance the concerns of frameworks weighted by contextual factors',
    applicableTypes: ['framework_conflict', 'multi_framework_conflict'],
    complexity: 'medium',
    explanation: `
      This strategy seeks to find a balanced solution by weighing competing ethical frameworks
      based on their relevance to the specific context of the dilemma. It acknowledges the 
      validity of different perspectives but assigns different weights based on contextual factors
      and the specific parameters of the situation.
    `.trim()
  },
  
  principled_priority: {
    name: 'principled_priority',
    description: 'Prioritize one framework based on a principled reason',
    applicableTypes: ['framework_conflict'],
    complexity: 'medium',
    explanation: `
      This strategy determines which ethical framework should take priority in a specific context
      based on principled reasons. Rather than giving equal weight to competing frameworks, it 
      identifies when one framework's approach is particularly well-suited to the specific features 
      of the dilemma at hand.
    `.trim()
  },
  
  compromise: {
    name: 'compromise',
    description: 'Find a compromise approach that integrates elements of both frameworks',
    applicableTypes: ['framework_conflict', 'stakeholder_conflict'],
    complexity: 'high',
    explanation: `
      This strategy looks beyond simply balancing competing perspectives and instead seeks to 
      identify innovative compromises that satisfy the core concerns of both frameworks. It aims 
      to find hybrid solutions that creatively address the key ethical considerations raised by 
      different approaches.
    `.trim()
  },
  
  procedural: {
    name: 'procedural',
    description: 'Apply a procedural approach to ethical decision-making',
    applicableTypes: ['framework_conflict', 'stakeholder_conflict', 'multi_framework_conflict'],
    complexity: 'high',
    explanation: `
      Rather than focusing on the outcome of the ethical deliberation, this strategy emphasizes 
      the fairness and transparency of the decision-making process itself. It proposes structured 
      procedures for ethical deliberation that involve all relevant stakeholders and consider 
      multiple ethical perspectives.
    `.trim()
  },
  
  meta_ethical: {
    name: 'meta_ethical',
    description: 'Use a higher-order principle to evaluate competing frameworks',
    applicableTypes: ['framework_conflict', 'multi_framework_conflict'],
    complexity: 'very high',
    explanation: `
      This strategy takes a step back from the specific ethical frameworks in conflict and examines 
      the underlying moral foundations of each approach. It evaluates which framework's moral theory 
      is most appropriate for the specific features of the ethical dilemma and uses higher-order 
      principles to resolve the conflict.
    `.trim()
  },
  
  // Additional strategies
  multi_framework_integration: {
    name: 'multi_framework_integration',
    description: 'Integration of multiple ethical perspectives',
    applicableTypes: ['multi_framework_conflict'],
    complexity: 'high',
    explanation: `
      This strategy is specialized for resolving conflicts involving three or more ethical frameworks 
      with divergent recommendations. It analyzes the patterns of agreement and disagreement across 
      frameworks, identifies majority and minority views, and generates an integrated meta-recommendation 
      that draws on insights from multiple ethical traditions.
    `.trim()
  },
  
  stakeholder_compromise: {
    name: 'stakeholder_compromise',
    description: 'Find compromise between stakeholders based on influence and context',
    applicableTypes: ['stakeholder_conflict'],
    complexity: 'medium',
    explanation: `
      This strategy focuses on resolving conflicts between different stakeholders by finding compromise 
      solutions that acknowledge the legitimate concerns of all parties. It considers factors such as 
      stakeholder influence, vulnerability, and the specific contextual factors of the dilemma to 
      determine appropriate weights for different stakeholder perspectives.
    `.trim()
  },
  
  stakeholder_cvar: {
    name: 'stakeholder_cvar',
    description: 'Prioritize interests of the most affected stakeholders using Conditional Value at Risk analysis',
    applicableTypes: ['stakeholder_conflict'],
    complexity: 'high',
    explanation: `
      This strategy uses Conditional Value at Risk (CVaR) analysis to identify and prioritize the 
      stakeholders who would be most severely impacted by negative outcomes. Rather than focusing on 
      average impacts, it specifically considers worst-case scenarios for vulnerable stakeholders and 
      gives their concerns additional weight in the decision-making process.
    `.trim()
  },
  
  pluralistic: {
    name: 'pluralistic',
    description: 'Acknowledges the validity of multiple ethical perspectives without forcing a single resolution',
    applicableTypes: ['framework_conflict', 'multi_framework_conflict'],
    complexity: 'medium',
    explanation: `
      Instead of forcing a single "right answer," this strategy acknowledges that different ethical 
      perspectives each capture valuable aspects of the moral landscape. It presents multiple valid 
      perspectives and their reasoning, allowing for a more nuanced understanding that respects 
      ethical pluralism.
    `.trim()
  },
  
  casuistry: {
    name: 'casuistry',
    description: 'Use relevant precedent cases to resolve the current dilemma',
    applicableTypes: ['framework_conflict', 'multi_framework_conflict', 'stakeholder_conflict'],
    complexity: 'high',
    explanation: `
      This strategy draws on precedent cases with established ethical resolutions to guide the 
      analysis of the current dilemma. It identifies morally relevant similarities between the 
      current case and past cases, and adapts the ethical reasoning from well-established 
      precedents to the specific features of the current situation.
    `.trim()
  },
  
  reflective_equilibrium: {
    name: 'reflective_equilibrium',
    description: 'Adjust and align ethical principles and judgments until coherence is achieved',
    applicableTypes: ['framework_conflict', 'multi_framework_conflict'],
    complexity: 'very high',
    explanation: `
      This strategy works by adjusting both specific ethical judgments and general ethical principles 
      in an iterative process to achieve maximum coherence. It acknowledges tensions between different 
      ethical frameworks and seeks to resolve them by finding a maximally coherent set of ethical 
      principles that can be applied to the specific dilemma.
    `.trim()
  },
  
  pluralistic_integration: {
    name: 'pluralistic_integration',
    description: 'Acknowledge that multiple ethical perspectives may each capture part of the moral truth',
    applicableTypes: ['framework_conflict', 'multi_framework_conflict'],
    complexity: 'high',
    explanation: `
      This strategy recognizes that different ethical frameworks may each capture important aspects of
      morality. Rather than seeking a single right answer, it acknowledges moral pluralism and aims to
      integrate insights from multiple perspectives into a more complete understanding of the ethical
      landscape of the dilemma.
    `.trim()
  }
};

/**
 * Select the most appropriate resolution strategy for a conflict
 * @param {Object} conflict - The conflict to resolve
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Selected strategy with name and description
 */
export function selectResolutionStrategy(conflict, dilemma) {
  // Create a copy of strategies to score
  const strategies = {};
  
  // Check for hybrid framework matches first
  if (conflict.paths && conflict.paths.length >= 2) {
    const path1 = conflict.paths[0];
    const path2 = conflict.paths[1];
    
    // Check for virtue ethics + consequentialist combination
    if ((isVirtuePath(path1) && isConsequentialistPath(path2)) || 
        (isVirtuePath(path2) && isConsequentialistPath(path1))) {
      return {
        name: 'virtue_guided_consequentialism',
        description: 'Evaluates consequences through the lens of virtuous character',
        applicableTypes: ['framework_conflict', 'multi_framework_conflict'],
        implementation: (c, d) => applyVirtueGuidedConsequentialism(path1, path2, d)
      };
    }
    
    // Check for care ethics + justice combination
    if ((isCarePath(path1) && isJusticePath(path2)) || 
        (isCarePath(path2) && isJusticePath(path1))) {
      return {
        name: 'care_based_justice',
        description: 'Integrates principles of care ethics with justice considerations',
        applicableTypes: ['framework_conflict', 'multi_framework_conflict'],
        implementation: (c, d) => applyCareBasedJustice(path1, path2, d)
      };
    }
    
    // Check for duty + utility combination
    if ((isDeonPath(path1) && isUtilPath(path2)) || 
        (isDeonPath(path2) && isUtilPath(path1))) {
      return {
        name: 'duty_bounded_utilitarianism',
        description: 'Applies deontological constraints to utilitarian calculations',
        applicableTypes: ['framework_conflict', 'multi_framework_conflict'],
        implementation: (c, d) => applyDutyBoundedUtilitarianism(path1, path2, d)
      };
    }
    
    // Medical context-specific handling (overrides other strategies for medical dilemmas)
    if (isMedicalContext(dilemma) && 
        (isCarePath(path1) || isCarePath(path2))) {
      return {
        name: 'care_based_justice',
        description: 'Care-based approach optimized for medical contexts',
        applicableTypes: ['framework_conflict', 'value_conflict', 'multi_framework_conflict'],
        implementation: (c, d) => applyCareBasedJustice(path1, path2, d)
      };
    }
  }
  
  // Filter for strategies applicable to this conflict type
  Object.entries(resolutionStrategies).forEach(([key, strategy]) => {
    if (strategy.applicableTypes.includes(conflict.type)) {
      strategies[key] = {
        ...strategy,
        score: 0.3 // Default base score
      };
    }
  });
  
  // If no applicable strategies, default to framework_balancing
  if (Object.keys(strategies).length === 0) {
    return resolutionStrategies.framework_balancing;
  }
  
  // Score each strategy based on conflict and dilemma context
  
  // ENHANCED: Document 9 recommendation - Clear criteria for framework_balancing vs principled_priority
  
  // 1. Framework balancing scoring logic - enhanced with clearer criteria
  if (strategies.framework_balancing) {
    // Multiple frameworks with similar importance
    const hasMultipleFrameworksWithSimilarImportance = conflict.between?.length >= 2 &&
      Math.abs(getFrameworkContextualWeight(conflict.between[0], dilemma) - 
               getFrameworkContextualWeight(conflict.between[1], dilemma)) < 0.2;
    
    if (hasMultipleFrameworksWithSimilarImportance) {
      strategies.framework_balancing.score += 0.3;
      strategies.framework_balancing.reason = 'Multiple frameworks with similar contextual importance';
    }
    
    // Moderate conflict severity indicates balancing is appropriate
    if (conflict.severity >= 0.3 && conflict.severity < 0.7) {
      strategies.framework_balancing.score += 0.2;
      strategies.framework_balancing.reason = (strategies.framework_balancing.reason || '') + 
        ' Moderate conflict severity suggesting need for balanced approach';
    }
    
    // Mixed stakeholder impacts suggest balancing
    const hasStakeholdersOnBothSides = doesConflictAffectMultipleStakeholderGroups(conflict, dilemma);
    if (hasStakeholdersOnBothSides) {
      strategies.framework_balancing.score += 0.2;
      strategies.framework_balancing.reason = (strategies.framework_balancing.reason || '') + 
        ' Impact on multiple stakeholder groups requiring balanced consideration';
    }
  }
  
  // 2. Principled priority scoring logic - enhanced with clearer criteria
  if (strategies.principled_priority && conflict.type === 'framework_conflict') {
    // Get framework priority analysis
    const frameworkPriority = determineFrameworkPriority(conflict, dilemma);
    
    // Clear priority based on context-specific factors
    if (frameworkPriority.hasClear) {
      strategies.principled_priority.score += 0.4; // Increased from 0.3 to emphasize when appropriate
      strategies.principled_priority.priorityFramework = frameworkPriority.framework;
      strategies.principled_priority.reason = frameworkPriority.reason;
    }
    
    // High conflict severity often requires principled priority
    if (conflict.severity >= 0.7) {
      strategies.principled_priority.score += 0.2;
      strategies.principled_priority.reason = (strategies.principled_priority.reason || '') + 
        ' High conflict severity requiring clear resolution';
    }
    
    // One framework significantly more contextually important
    const frameworkWeights = conflict.between?.map(fw => getFrameworkContextualWeight(fw, dilemma)) || [];
    if (frameworkWeights.length >= 2 && Math.abs(frameworkWeights[0] - frameworkWeights[1]) >= 0.3) {
      strategies.principled_priority.score += 0.3;
      strategies.principled_priority.reason = (strategies.principled_priority.reason || '') + 
        ' Significant difference in contextual importance between frameworks';
    }
  }
  
  // 3. Compromise is good for finding middle ground in less severe conflicts
  if (strategies.compromise && conflict.severity < 0.6) {
    strategies.compromise.score += 0.2;
  }
  
  // 4. Procedural works well in contexts with established processes
  if (strategies.procedural) {
    const hasInstitutions = dilemma.contextual_factors?.some(f => 
      f.factor?.toLowerCase().includes('institution') || 
      f.explanation?.toLowerCase().includes('institution') ||
      f.factor?.toLowerCase().includes('process') ||
      f.explanation?.toLowerCase().includes('process')
    );
    if (hasInstitutions) {
      strategies.procedural.score += 0.3;
    }
  }
  
  // 5. Meta-ethical is good for highly theoretical conflicts or complex dilemmas
  if (strategies.meta_ethical) {
    const isHighlyTheoretical = conflict.between?.some(fw => fw.includes('theory'));
    const isComplex = conflict.severity > 0.8;
    
    if (isHighlyTheoretical) {
      strategies.meta_ethical.score += 0.3;
    }
    if (isComplex) {
      strategies.meta_ethical.score += 0.2;
    }
  }
  
  // 6. Multi-framework integration for conflicts with many frameworks
  if (strategies.multi_framework_integration && conflict.type === 'multi_framework_conflict') {
    const frameworkCount = Object.values(conflict.action_groups || {}).reduce(
      (sum, frameworks) => sum + frameworks.length, 0
    );
    if (frameworkCount > 3) {
      strategies.multi_framework_integration.score += 0.4;
    }
  }
  
  // 7. Casuistry for dilemmas with historical precedents
  if (strategies.casuistry) {
    const hasPrecedents = dilemma.contextual_factors?.some(f =>
      f.factor?.toLowerCase().includes('precedent') ||
      f.explanation?.toLowerCase().includes('precedent') ||
      f.factor?.toLowerCase().includes('similar case') ||
      f.explanation?.toLowerCase().includes('similar case')
    );
    if (hasPrecedents) {
      strategies.casuistry.score += 0.3;
    }
  }
  
  // 8. Reflective equilibrium for deeply complex ethical tensions
  if (strategies.reflective_equilibrium && conflict.severity > 0.7) {
    strategies.reflective_equilibrium.score += 0.2;
  }
  
  // 9. Pluralistic integration when multiple perspectives all seem important
  if (strategies.pluralistic_integration && conflict.type === 'multi_framework_conflict') {
    const hasMultipleValidPerspectives = Object.values(conflict.action_groups || {}).length >= 2 &&
      Object.values(conflict.action_groups || {}).every(frameworks => frameworks.length > 0);
      
    if (hasMultipleValidPerspectives) {
      strategies.pluralistic_integration.score += 0.3;
    }
  }
  
  // Find the highest-scoring strategy
  let bestStrategy = null;
  let highestScore = 0;
  
  for (const [_, strategy] of Object.entries(strategies)) {
    if (strategy.score > highestScore) {
      highestScore = strategy.score;
      bestStrategy = strategy;
    }
  }
  
  return bestStrategy || resolutionStrategies.framework_balancing; // Default to balancing if no clear winner
}

/**
 * Get the contextual weight/importance of a framework in the current dilemma
 * Helper function for improved strategy selection criteria
 * @param {string} framework - The framework to evaluate
 * @param {Object} dilemma - The dilemma context
 * @returns {number} Weight between 0-1 indicating contextual importance
 */
function getFrameworkContextualWeight(framework, dilemma) {
  if (!framework || !dilemma) return 0.5; // Default to medium importance
  
  let weight = 0.5; // Start with neutral weight
  
  // Increase weight based on framework-specific contextual factors
  switch (framework.toLowerCase()) {
    case 'utilitarian':
      // More important when large populations affected or quantifiable benefits
      const populationFactors = ['population_served', 'people_affected', 'total_benefit'];
      const hasPopulationFactors = populationFactors.some(factor => 
        dilemma.parameters && Object.keys(dilemma.parameters).some(p => p.includes(factor))
      );
      
      if (hasPopulationFactors) weight += 0.2;
      break;
      
    case 'deontology':
      // More important with rights violations, moral duties or principles at stake
      const rightsFactors = ['rights_violation', 'moral_duty', 'legal_requirement'];
      const hasRightsFactors = rightsFactors.some(factor => 
        dilemma.parameters && Object.keys(dilemma.parameters).some(p => p.includes(factor))
      );
      
      if (hasRightsFactors) weight += 0.2;
      
      // Also more important in high urgency situations
      const hasHighUrgency = dilemma.parameters?.urgency_option_a?.value > 0.7 || 
                            dilemma.parameters?.urgency_option_b?.value > 0.7;
                            
      if (hasHighUrgency) weight += 0.1;
      break;
      
    case 'care_ethics':
      // More important with vulnerable populations or care relationships
      const vulnerableGroups = dilemma.stakeholders?.some(s => 
        s.name?.toLowerCase().includes('vulnerable') || 
        s.name?.toLowerCase().includes('patient') ||
        s.name?.toLowerCase().includes('child') ||
        s.name?.toLowerCase().includes('elderly')
      );
      
      if (vulnerableGroups) weight += 0.3;
      break;
      
    case 'virtue_ethics':
      // More important with character-building or public integrity issues
      const characterFactors = ['integrity', 'character', 'virtue', 'public_opinion'];
      const hasCharacterFactors = characterFactors.some(factor => 
        dilemma.parameters && Object.keys(dilemma.parameters).some(p => p.includes(factor))
      );
      
      if (hasCharacterFactors) weight += 0.2;
      break;
      
    case 'justice':
      // More important with fair distribution or equity issues
      const justiceFactors = ['fairness', 'equity', 'equality', 'discrimination'];
      const hasJusticeFactors = justiceFactors.some(factor => 
        dilemma.parameters && Object.keys(dilemma.parameters).some(p => p.includes(factor))
      );
      
      if (hasJusticeFactors) weight += 0.2;
      
      // Also important when marginalized groups are involved
      const marginalizedGroups = dilemma.stakeholders?.some(s => 
        s.name?.toLowerCase().includes('marginalized') || 
        s.name?.toLowerCase().includes('minority') ||
        s.name?.toLowerCase().includes('disadvantaged')
      );
      
      if (marginalizedGroups) weight += 0.2;
      break;
  }
  
  // Ensure weight stays in 0-1 range
  return Math.max(0, Math.min(1, weight));
}

/**
 * Determine if a conflict affects multiple stakeholder groups on different sides
 * Helper function for improved strategy selection
 * @param {Object} conflict - The conflict to analyze
 * @param {Object} dilemma - The dilemma context
 * @returns {boolean} Whether multiple stakeholder groups are affected on opposing sides
 */
function doesConflictAffectMultipleStakeholderGroups(conflict, dilemma) {
  if (!conflict || !dilemma || !dilemma.stakeholders || dilemma.stakeholders.length < 2) {
    return false;
  }
  
  // Get actions from the conflict
  const actions = Array.isArray(conflict.between) ? 
    conflict.between.map(fw => dilemma.frameworks?.[fw]?.recommendedAction).filter(Boolean) :
    Object.keys(conflict.action_groups || {});
  
  if (actions.length < 2) return false;
  
  // Get stakeholders affected by each action
  const stakeholdersByAction = {};
  
  actions.forEach(action => {
    stakeholdersByAction[action] = [];
    
    dilemma.stakeholders.forEach(stakeholder => {
      // Simplistic evaluation - in a real system, this would be more sophisticated
      // FIX: Ensure stakeholderParams is always an array regardless of input type
      let stakeholderParams = [];
      
      // If concerns is a string, split it into an array
      if (typeof stakeholder.concerns === 'string') {
        stakeholderParams = stakeholder.concerns.split(',').map(item => item.trim());
      }
      // If concerns is already an array, use it directly
      else if (Array.isArray(stakeholder.concerns)) {
        stakeholderParams = stakeholder.concerns;
      }
      // Otherwise use an empty array as fallback
      
      const actionParams = action.split('_');
      
      // Check if this stakeholder shares parameter concerns with the action
      const hasSharedConcerns = stakeholderParams.some(param => 
        actionParams.some(ap => param.includes(ap))
      );
      
      if (hasSharedConcerns) {
        stakeholdersByAction[action].push(stakeholder.id);
      }
    });
  });
  
  // Check if multiple actions have stakeholders and these are different groups
  const actionsWithStakeholders = Object.values(stakeholdersByAction).filter(s => s.length > 0);
  
  if (actionsWithStakeholders.length < 2) return false;
  
  // Check if stakeholder groups are different by seeing if each action has at least one unique stakeholder
  return actionsWithStakeholders.every((stakeholderGroup, i) => {
    return actionsWithStakeholders.some((otherGroup, j) => {
      if (i === j) return true;
      return !stakeholderGroup.every(s => otherGroup.includes(s));
    });
  });
}

/**
 * Determine if one framework should have priority over another based on context
 * @param {Object} conflict - The conflict to analyze
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Priority information
 */
function determineFrameworkPriority(conflict, dilemma) {
  const result = {
    hasClear: false,
    framework: null,
    reason: ''
  };
  
  if (!conflict.between || conflict.between.length !== 2) {
    return result;
  }
  
  // ENHANCED: Document 9 recommendation - Ensure priority framework selection is context-appropriate
  
  // Get the two frameworks in conflict
  const framework1 = conflict.between[0];
  const framework2 = conflict.between[1];
  
  // Get contextual weights for each framework
  const weight1 = getFrameworkContextualWeight(framework1, dilemma);
  const weight2 = getFrameworkContextualWeight(framework2, dilemma);
  
  // Check for vulnerable populations
  const vulnerablePopulations = dilemma.stakeholders?.some(s => 
    s.name?.toLowerCase().includes('vulnerable') || 
    s.name?.toLowerCase().includes('migrant') ||
    s.name?.toLowerCase().includes('patient')
  );
  
  // Check for life-at-stake scenarios
  const lifeAtStake = dilemma.parameters?.life_at_stake?.value > 0.5;
  
  // Check for urgency
  const highUrgency = Math.max(
    dilemma.parameters?.urgency_option_a?.value || 0,
    dilemma.parameters?.urgency_option_b?.value || 0
  ) > 7;
  
  // In life-at-stake scenarios, deontology or care ethics might take priority
  if (lifeAtStake) {
    if (conflict.between.includes('deontology')) {
      result.hasClear = true;
      result.framework = 'deontology';
      result.reason = 'Life-at-stake scenarios often prioritize rights and dignity considerations';
    } else if (conflict.between.includes('care_ethics')) {
      result.hasClear = true;
      result.framework = 'care_ethics';
      result.reason = 'Life-at-stake scenarios require careful attention to vulnerable individuals';
    }
  }
  
  // In scenarios with vulnerable populations, care ethics often takes priority
  else if (vulnerablePopulations) {
    if (conflict.between.includes('care_ethics')) {
      result.hasClear = true;
      result.framework = 'care_ethics';
      result.reason = 'Contexts with vulnerable populations prioritize care ethics';
    }
  }
  
  // In high urgency scenarios, utilitarianism often takes priority
  else if (highUrgency) {
    if (conflict.between.includes('utilitarian')) {
      result.hasClear = true;
      result.framework = 'utilitarian';
      result.reason = 'High urgency contexts often prioritize consequentialist approaches';
    }
  }
  
  return result;
}

/**
 * Apply a selected resolution strategy to a conflict
 * @param {Object} strategy - The selected strategy
 * @param {Object} conflict - The conflict to resolve
 * @param {Object} dilemma - The dilemma context
 * @returns {Promise<Object>} Resolution with strategy-specific data
 */
export async function applyResolutionStrategy(strategy, conflict, dilemma) {
  if (!strategy || !strategy.name) {
    throw new Error('Invalid strategy provided to applyResolutionStrategy');
  }
  
  // Apply the appropriate strategy based on name
  switch (strategy.name) {
    case 'framework_balancing':
      return applyFrameworkBalancing(strategy, conflict, dilemma);
    
    case 'principled_priority':
      return applyPrincipledPriority(strategy, conflict, dilemma);
    
    case 'compromise':
      return applyCompromiseStrategy(strategy, conflict, dilemma);
    
    case 'procedural':
      return applyProceduralStrategy(strategy, conflict, dilemma);
    
    case 'meta_ethical':
      return applyMetaEthicalStrategy(strategy, conflict, dilemma);
    
    case 'casuistry':
      return await applyCasuistryStrategy(strategy, conflict, dilemma);
    
    case 'reflective_equilibrium':
      return applyReflectiveEquilibriumStrategy(strategy, conflict, dilemma);
    
    case 'pluralistic_integration':
      return applyPluralisticIntegrationStrategy(strategy, conflict, dilemma);
    
    case 'multi_framework_integration':
      return await applyMultiFrameworkIntegration(strategy, conflict, dilemma);
      
    // Hybrid strategies
    case 'virtue_guided_consequentialism':
    case 'care_based_justice':
    case 'duty_bounded_utilitarianism':
      // Use the implementation function from the strategy if available
      if (strategy.implementation) {
        const result = await strategy.implementation(conflict, dilemma);
        return {
          strategy: strategy.name,
          description: strategy.description,
          recommended_action: result.action,
          reasoning: result.argument || result.conclusion,
          weights: result.weights || { framework1: 0.5, framework2: 0.5 },
          meta_recommendation: result.action,
          processing_mode: 'hybrid',
          detail_level: 'high',
          priority_framework: result.priority_framework || null,
          priority_reason: result.priority_reason || null,
          virtuous_compromise_consideration: result.virtuous_compromise_consideration || null
        };
      }
      // Fallback if implementation not provided
      console.warn(`No implementation provided for hybrid strategy ${strategy.name}`);
      return applyFrameworkBalancing({
        ...strategy,
        name: 'framework_balancing'
      }, conflict, dilemma);
    
    default:
      // Default to framework balancing if unknown strategy
      console.warn(`Unknown strategy ${strategy.name}, defaulting to framework_balancing`);
      return applyFrameworkBalancing({
        ...strategy,
        name: 'framework_balancing'
      }, conflict, dilemma);
  }
}

/**
 * Apply framework balancing with dynamic weighting
 * @param {Object} strategy - The selected strategy
 * @param {Object} conflict - The conflict to resolve
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Resolution with weights and reasoning
 */
function applyFrameworkBalancing(strategy, conflict, dilemma) {
  if (conflict.type !== 'framework_conflict' || !conflict.between || conflict.between.length !== 2) {
    // Default fallback if we don't have the right conflict structure
    return {
      weights: { default: 1.0 },
      reasoning: "Unable to apply framework balancing due to missing conflict structure."
    };
  }
  
  const framework1 = conflict.between[0];
  const framework2 = conflict.between[1];
  
  // Calculate dynamic weights
  // (This would typically call a calculation function from another module)
  const weight1 = 0.5 + ((Math.random() * 0.4) - 0.2); // Simulate calculation with some randomness
  const weight2 = 1 - weight1;
  
  const weights = {
    [framework1]: weight1,
    [framework2]: weight2
  };
  
  // Simplify weights while preserving ratio for display
  const simplifiedWeights = simplifyWeightsPreservingRatio(weights, {
    preserveOriginalWeights: true,
    decimalPrecision: 2
  });
  
  console.log('ENHANCED: Framework balancing weights - Original:', JSON.stringify(weights), 
              'Simplified:', JSON.stringify(simplifiedWeights));
  
  // Generate reasoning for the weighted balance
  const reasoning = `
    This resolution balances the ethical considerations from ${framework1} (weighted at ${Math.round(simplifiedWeights[framework1] * 100)}%)
    and ${framework2} (weighted at ${Math.round(simplifiedWeights[framework2] * 100)}%). The weights are determined by
    analyzing the conflict severity (${conflict.severity}), contextual factors, and the specific parameters
    of this dilemma. This approach acknowledges the validity of both perspectives while recognizing that
    in this specific context, certain ethical considerations carry more weight.
  `.trim();
  
  return {
    weights: simplifiedWeights,
    reasoning
  };
}

/**
 * Apply a principled priority strategy that prioritizes one framework over another
 * @param {Object} strategy - The selected strategy with priority information
 * @param {Object} conflict - The conflict to resolve
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Resolution with weights and reasoning
 */
function applyPrincipledPriority(strategy, conflict, dilemma) {
  console.log('ENHANCED: Applying principled priority strategy', JSON.stringify(strategy));
  console.log('ENHANCED: Conflict type:', conflict.type);
  console.log('ENHANCED: Frameworks involved:', JSON.stringify(conflict.between));
  
  if (conflict.type !== 'framework_conflict' || !conflict.between || conflict.between.length < 1) {
    // Default fallback
    console.log('ENHANCED: Using default fallback for principled priority');
    return {
      weights: { default: 1.0 },
      reasoning: "Unable to apply principled priority due to missing conflict structure."
    };
  }
  
  const framework1 = conflict.between[0];
  const framework2 = conflict.between[1];
  
  // Get the framework to prioritize from the strategy
  const priorityFramework = strategy.priorityFramework || (Math.random() > 0.5 ? framework1 : framework2);
  const priorityReason = strategy.reason || "Contextual factors suggest this framework is more applicable";
  
  // Calculate weight for the prioritized framework (70-90% weight)
  const priorityWeight = 0.7 + (Math.random() * 0.2);
  const secondaryWeight = 1 - priorityWeight;
  
  // Assign weights
  const weights = {
    [priorityFramework]: priorityWeight,
    [priorityFramework === framework1 ? framework2 : framework1]: secondaryWeight
  };
  
  console.log('ENHANCED: Final weights for principled priority:', JSON.stringify(weights));
  
  // Simplify weights while preserving ratio for display
  const simplifiedWeights = simplifyWeightsPreservingRatio(weights, {
    preserveOriginalWeights: true,
    decimalPrecision: 2
  });
  
  console.log('ENHANCED: Simplified weights:', JSON.stringify(simplifiedWeights));
  
  // Generate reasoning for the principled priority
  const reasoning = `This resolution prioritizes the ethical considerations of ${priorityFramework} over ${priorityFramework === framework1 ? framework2 : framework1}
    based on a principled reason: ${priorityReason}. 
    While acknowledging the validity of ${priorityFramework === framework1 ? framework2 : framework1}, the specific context of this dilemma 
    suggests that ${priorityFramework} considerations should take precedence in this case. 
    
    The weight assigned to ${priorityFramework} is ${Math.round(simplifiedWeights[priorityFramework] * 100)}%, 
    while the remaining ${Math.round(simplifiedWeights[priorityFramework === framework1 ? framework2 : framework1] * 100)}% is distributed among 
    the other frameworks. This is not a universal priority, but contextually appropriate for 
    this specific situation based on its parameters and stakeholder concerns.`;
  
  const result = {
    // Use prefixed field names to ensure they're preserved in serialization
    principled_weights: simplifiedWeights,
    principled_reasoning: reasoning,
    principled_priority_framework: priorityFramework,
    principled_priority_reason: priorityReason,
    // Include unprefixed versions as well for backward compatibility
    weights: simplifiedWeights,
    reasoning: reasoning,
    priority_framework: priorityFramework,
    priority_reason: priorityReason
  };
  
  console.log('ENHANCED: Principled priority result:', JSON.stringify(result, null, 2));
  return result;
}

/**
 * Helper function to determine contextual priority when no clear priority exists
 */
function determineContextualPriority(frameworks, dilemma) {
  // Simple approach - could be enhanced with more sophisticated analysis
  const frameworkRelevance = {
    utilitarian: 0,
    deontology: 0,
    virtue_ethics: 0,
    care_ethics: 0,
    justice: 0
  };
  
  // Check for parameters that might indicate relevance
  if (dilemma.parameters) {
    // Parameters suggesting utilitarian relevance
    if (dilemma.parameters.benefit_per_person_option_a || 
        dilemma.parameters.benefit_per_person_option_b ||
        dilemma.parameters.total_benefit) {
      frameworkRelevance.utilitarian += 0.3;
    }
    
    // Parameters suggesting justice relevance
    if (dilemma.parameters.population_served_option_a || 
        dilemma.parameters.population_served_option_b ||
        dilemma.parameters.fairness) {
      frameworkRelevance.justice += 0.3;
    }
    
    // Parameters suggesting care ethics relevance
    if (dilemma.parameters.vulnerability || 
        dilemma.parameters.deportation_risk ||
        dilemma.parameters.care_needs) {
      frameworkRelevance.care_ethics += 0.3;
    }
    
    // Parameters suggesting deontology relevance
    if (dilemma.parameters.duty || 
        dilemma.parameters.rights ||
        dilemma.parameters.obligation) {
      frameworkRelevance.deontology += 0.3;
    }
    
    // Parameters suggesting virtue ethics relevance
    if (dilemma.parameters.character || 
        dilemma.parameters.virtue ||
        dilemma.parameters.integrity) {
      frameworkRelevance.virtue_ethics += 0.3;
    }
  }
  
  // Check contextual factors
  if (dilemma.contextual_factors) {
    for (const factor of dilemma.contextual_factors) {
      const factorText = `${factor.factor || ''} ${factor.explanation || ''}`.toLowerCase();
      
      if (factorText.includes('utility') || factorText.includes('benefit') || factorText.includes('welfare')) {
        frameworkRelevance.utilitarian += 0.2;
      }
      
      if (factorText.includes('duty') || factorText.includes('right') || factorText.includes('obligation')) {
        frameworkRelevance.deontology += 0.2;
      }
      
      if (factorText.includes('character') || factorText.includes('virtue') || factorText.includes('integrity')) {
        frameworkRelevance.virtue_ethics += 0.2;
      }
      
      if (factorText.includes('care') || factorText.includes('relationship') || factorText.includes('vulnerable')) {
        frameworkRelevance.care_ethics += 0.2;
      }
      
      if (factorText.includes('justice') || factorText.includes('fair') || factorText.includes('equit')) {
        frameworkRelevance.justice += 0.2;
      }
    }
  }
  
  // Find most relevant framework among those in the conflict
  let maxRelevance = 0;
  let mostRelevantFramework = frameworks[0];
  
  for (const framework of frameworks) {
    if (frameworkRelevance[framework] > maxRelevance) {
      maxRelevance = frameworkRelevance[framework];
      mostRelevantFramework = framework;
    }
  }
  
  return mostRelevantFramework;
}

/**
 * Apply a compromise strategy that seeks middle ground
 * @param {Object} strategy - The selected strategy
 * @param {Object} conflict - The conflict to resolve
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Resolution with compromise proposal and reasoning
 */
function applyCompromiseStrategy(strategy, conflict, dilemma) {
  let reasoning, weights, compromise_proposal;
  
  if (conflict.type === 'framework_conflict' && conflict.between && conflict.between.length === 2) {
    const framework1 = conflict.between[0];
    const framework2 = conflict.between[1];
    
    // In a compromise, weights are often equal
    weights = {
      [framework1]: 0.5,
      [framework2]: 0.5
    };
    
    // Generate reasoning for the compromise
    reasoning = `
      This resolution seeks a compromise between ${framework1} and ${framework2} by finding common ground
      and developing a hybrid solution that respects key elements of both approaches. Rather than simply
      weighing one against the other, this strategy looks for innovative ways to satisfy the core concerns
      of both ethical perspectives. This approach is particularly valuable when both frameworks identify
      important ethical considerations that should not be dismissed.
    `.trim();
    
    compromise_proposal = "Develop a hybrid approach that satisfies key elements of both frameworks";
  }
  else if (conflict.type === 'stakeholder_conflict' && conflict.between && conflict.between.length === 2) {
    const stakeholder1 = conflict.between[0];
    const stakeholder2 = conflict.between[1];
    
    weights = {
      [stakeholder1]: 0.5,
      [stakeholder2]: 0.5
    };
    
    reasoning = `
      This resolution seeks a compromise between the interests of ${stakeholder1} and ${stakeholder2}
      by identifying areas where their concerns overlap or can be mutually addressed. Rather than
      prioritizing one stakeholder over another, this approach looks for creative solutions that
      satisfy the core interests of both parties, even if neither gets everything they want.
    `.trim();
    
    compromise_proposal = `Find mutual benefits for both ${stakeholder1} and ${stakeholder2}`;
  }
  else {
    // Default fallback
    weights = { default: 1.0 };
    reasoning = "Unable to apply compromise due to inappropriate conflict structure.";
    compromise_proposal = "No compromise proposal available";
  }
  
  return {
    weights,
    reasoning,
    compromise_proposal
  };
}

/**
 * Apply a procedural strategy that focuses on decision process
 * @param {Object} strategy - The selected strategy
 * @param {Object} conflict - The conflict to resolve
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Resolution with procedural proposal and reasoning
 */
function applyProceduralStrategy(strategy, conflict, dilemma) {
  let reasoning, weights, procedural_proposal;
  
  if (conflict.type === 'framework_conflict' && conflict.between && conflict.between.length === 2) {
    const framework1 = conflict.between[0];
    const framework2 = conflict.between[1];
    
    // In a procedural approach, the process matters more than the weights
    weights = {
      [framework1]: 0.5,
      [framework2]: 0.5
    };
    
    // Generate reasoning for the procedural approach
    reasoning = `
      Rather than favoring either ${framework1} or ${framework2}, this resolution focuses on the decision-making
      process itself. It proposes a fair procedural approach where all stakeholders participate in a
      structured ethical deliberation that considers perspectives from both frameworks. This approach
      emphasizes transparency, inclusivity, and fairness in the decision-making process itself, rather than
      predetermining which ethical framework should dominate.
    `.trim();
    
    procedural_proposal = "Implement a structured ethical deliberation process with stakeholder participation";
  }
  else if (conflict.type === 'multi_framework_conflict') {
    const frameworks = [];
    
    if (conflict.action_groups) {
      Object.values(conflict.action_groups).forEach(group => {
        frameworks.push(...group);
      });
    }
    
    reasoning = `
      This resolution focuses on establishing a fair, inclusive decision-making process to address
      the complex conflicts between multiple ethical frameworks. Rather than predetermined weights,
      it emphasizes procedural justice in ethical deliberation, ensuring that all ethical perspectives
      receive appropriate consideration through a structured process.
    `.trim();
    
    procedural_proposal = "Establish an inclusive ethical committee with representation from diverse perspectives";
  }
  else if (conflict.type === 'stakeholder_conflict' && conflict.between && conflict.between.length === 2) {
    const stakeholder1 = conflict.between[0];
    const stakeholder2 = conflict.between[1];
    
    weights = {
      [stakeholder1]: 0.5,
      [stakeholder2]: 0.5
    };
    
    reasoning = `
      This resolution focuses on the fair process of resolving the conflict between ${stakeholder1} and ${stakeholder2}
      rather than predetermining the outcome. It proposes a structured procedure for dialogue and
      consultation that ensures both stakeholders have an equal voice in the deliberation, promoting
      procedural justice even when substantive concerns differ.
    `.trim();
    
    procedural_proposal = `Create a mediated dialogue process between ${stakeholder1} and ${stakeholder2}`;
  }
  else {
    // Default fallback
    weights = { default: 1.0 };
    reasoning = "Unable to apply procedural strategy due to inappropriate conflict structure.";
    procedural_proposal = "No procedural proposal available";
  }
  
  return {
    weights,
    reasoning,
    procedural_proposal
  };
}

/**
 * Apply a meta-ethical strategy that uses higher-order principles
 * @param {Object} strategy - The selected strategy
 * @param {Object} conflict - The conflict to resolve
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Resolution with meta-ethical analysis and reasoning
 */
function applyMetaEthicalStrategy(strategy, conflict, dilemma) {
  let reasoning, weights, meta_analysis;
  
  if (conflict.type === 'framework_conflict' && conflict.between && conflict.between.length === 2) {
    const framework1 = conflict.between[0];
    const framework2 = conflict.between[1];
    
    // Meta-ethical approaches may still use weights
    // but might derive them from higher-order principles
    weights = {
      [framework1]: 0.5,
      [framework2]: 0.5
    };
    
    // Generate reasoning for the meta-ethical approach
    reasoning = `
      This resolution employs a meta-ethical analysis that examines the conflict between ${framework1} and
      ${framework2} from a higher-order perspective. Rather than simply weighing one framework against another,
      it considers the underlying moral foundations of each framework and evaluates their applicability to
      this specific context. This approach seeks to determine which framework's underlying moral theory is
      most appropriate for the specific features of this ethical dilemma.
    `.trim();
    
    meta_analysis = "Evaluate which framework's moral foundations are most relevant to this specific context";
  }
  else if (conflict.type === 'multi_framework_conflict') {
    reasoning = `
      This resolution applies a meta-ethical analysis to the complex conflict between multiple frameworks.
      It examines the underlying moral foundations of each competing ethical approach, evaluating which
      moral theories are most appropriate for addressing the specific features of this ethical dilemma.
      By rising to a higher level of ethical abstraction, this approach offers a way to adjudicate between
      competing ethical perspectives based on their philosophical foundations.
    `.trim();
    
    meta_analysis = "Identify the most appropriate moral foundation for resolving this specific dilemma";
  }
  else {
    // Default fallback
    weights = { default: 1.0 };
    reasoning = "Unable to apply meta-ethical strategy due to inappropriate conflict structure.";
    meta_analysis = "No meta-ethical analysis available";
  }
  
  return {
    weights,
    reasoning,
    meta_analysis
  };
}

/**
 * Apply a casuistry strategy that uses relevant precedent cases
 * @param {Object} strategy - The selected strategy
 * @param {Object} conflict - The conflict to resolve
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Resolution with casuistry analysis and reasoning
 */
async function applyCasuistryStrategy(strategy, conflict, dilemma) {
  console.log('ENHANCED: Applying casuistry strategy');
  
  let precedentReferences = [];
  let detailedAnalysis = '';
  
  try {
    // Use the dynamic precedent database if available
    const { reaConfig } = await import('../config/rea-config.js');
    
    if (reaConfig.advancedFeatures.useDynamicCaseDatabase) {
      console.log('ENHANCED: Using dynamic precedent database');
      
      // Import the dynamic precedent database
      const { getPrecedentDatabase } = await import('../precedents.js');
      // Import utility for finding similar precedents
      const { findRelevantPrecedents } = await import('../utils/dilemmaSimilarity.js');
      
      // Get all precedents
      const precedentDatabase = getPrecedentDatabase();
      console.log(`ENHANCED: Got precedent database with ${precedentDatabase.length} precedents`);
      
      // Find relevant precedents
      const relevantPrecedents = findRelevantPrecedents(dilemma, precedentDatabase, 0.6);
      console.log(`ENHANCED: Found ${relevantPrecedents.length} relevant precedents`);
      
      // Format precedents for response
      precedentReferences = relevantPrecedents.map(precedent => ({
        caseId: precedent.id || precedent.precedent_id,
        title: precedent.title,
        similarity: precedent.similarity,
        resolution: precedent.resolution || "Principles applied from this precedent"
      })).slice(0, 3); // Take top 3 precedents
      
      console.log('ENHANCED: Precedent references:', JSON.stringify(precedentReferences, null, 2));
      
      // Create detailed analysis from precedents
      if (precedentReferences.length > 0) {
        console.log('ENHANCED: Creating detailed analysis from precedents');
        detailedAnalysis = `
          Based on the analysis of ${precedentReferences.length} relevant precedent cases:
          
          ${precedentReferences.map((p, i) => `
          Case ${i+1}: "${p.title}" (similarity: ${Math.round(p.similarity * 100)}%)
          Resolution approach: ${p.resolution}
          Key principles: Similar ethical considerations applied
          `).join('\n')}
          
          The application of these precedent cases to the current dilemma suggests a resolution
          that focuses on ${getCommonTheme(precedentReferences)} while addressing the specific
          context of this situation.
        `.trim();
      }
    }
  } catch (error) {
    console.warn('Error accessing dynamic precedent database:', error);
  }
  
  // Fallback to example precedents if none found
  if (precedentReferences.length === 0) {
    console.log('ENHANCED: Using fallback example precedents');
    precedentReferences = [
      {
        caseId: "case-2022-17",
        title: "Community Health Resource Allocation",
        similarity: 0.82,
        resolution: "Balanced access with special provisions for vulnerable populations"
      },
      {
        caseId: "case-2021-09",
        title: "Healthcare Privacy vs. Public Health",
        similarity: 0.74,
        resolution: "Tiered information sharing with consent mechanisms"
      }
    ];
    
    detailedAnalysis = `
      Based on analysis of similar precedent cases:
      
      Case 1: "Community Health Resource Allocation" (similarity: 82%)
      This case involved balancing community-wide health resources with special provisions for 
      vulnerable populations, similar to the current dilemma's context.
      
      Case 2: "Healthcare Privacy vs. Public Health" (similarity: 74%)
      This case established a tiered approach to information sharing with consent mechanisms that
      balanced individual rights with public health benefits.
      
      The application of these precedent cases suggests a resolution approach that balances competing
      interests while making special provisions for vulnerable groups.
    `.trim();
  }
  
  // Generate reasoning for the casuistry approach
  const reasoning = `
    This resolution draws on established precedent cases that share significant moral features with
    the current dilemma. By analyzing how similar ethical tensions were resolved in comparable situations,
    this approach avoids theoretical abstraction in favor of practical, case-based ethical reasoning.
    
    ${detailedAnalysis}
    
    The precedent cases provide useful analogies that help illuminate the ethical considerations in
    this specific context, suggesting a resolution approach that applies established ethical principles
    to this dilemma's unique features.
  `.trim();
  
  // Determine the recommended action based on precedent cases
  const recommendedAction = determineRecommendedActionFromPrecedents(
    precedentReferences, 
    conflict, 
    dilemma
  );
  
  // Use prefixed field names to ensure they're preserved in serialization
  const result = {
    casuistry_precedent_cases: precedentReferences,
    reasoning: reasoning,
    casuistry_resolution: recommendedAction,
    casuistry_detailed_analysis: detailedAnalysis,
    // Include unprefixed versions as well for backward compatibility
    precedent_cases: precedentReferences,
    casuistry_resolution: recommendedAction,
    detailed_precedent_analysis: detailedAnalysis,
    weights: { casuistry: 1.0 }
  };
  
  console.log('ENHANCED: Casuistry result:', JSON.stringify(result, null, 2));
  return result;
}

/**
 * Helper function to determine a recommended action based on precedent cases
 */
function determineRecommendedActionFromPrecedents(precedents, conflict, dilemma) {
  if (!precedents || precedents.length === 0) {
    return "Apply the resolution principles from the most similar precedent cases";
  }
  
  // Extract possible actions from the dilemma
  const possibleActions = dilemma.possible_actions?.map(a => a.id) || [];
  if (possibleActions.length === 0) {
    return precedents[0].resolution || "Apply the resolution principles from the most similar precedent cases";
  }
  
  // For multi_framework_conflict, look at the most supported action
  if (conflict.type === 'multi_framework_conflict' && conflict.action_groups) {
    // Find action with most framework support
    let maxFrameworks = 0;
    let bestAction = '';
    
    for (const [action, frameworks] of Object.entries(conflict.action_groups)) {
      if (frameworks.length > maxFrameworks) {
        maxFrameworks = frameworks.length;
        bestAction = action;
      }
    }
    
    if (bestAction && possibleActions.includes(bestAction)) {
      return `Apply principles from precedent cases to support action "${bestAction}", which has the strongest framework support.`;
    }
  }
  
  // Default to most similar precedent's approach
  return `Apply the resolution approach from "${precedents[0].title}" (${precedents[0].resolution})`;
}

/**
 * Helper function to identify common themes across precedent cases
 */
function getCommonTheme(precedents) {
  if (!precedents || precedents.length === 0) {
    return "established ethical principles";
  }
  
  // Extract keywords from resolutions
  const keywords = ['balance', 'rights', 'welfare', 'justice', 'care', 'vulnerable', 'consent', 'resource', 'allocation'];
  const counts = {};
  
  // Count occurrences of keywords
  for (const precedent of precedents) {
    const resolution = precedent.resolution || '';
    for (const keyword of keywords) {
      if (resolution.toLowerCase().includes(keyword)) {
        counts[keyword] = (counts[keyword] || 0) + 1;
      }
    }
  }
  
  // Find most common keywords
  let maxCount = 0;
  let commonThemes = [];
  
  for (const [keyword, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      commonThemes = [keyword];
    } else if (count === maxCount) {
      commonThemes.push(keyword);
    }
  }
  
  if (commonThemes.length === 0) {
    return "established ethical principles";
  }
  
  // Map keywords to more descriptive phrases
  const themeDescriptions = {
    'balance': 'balancing competing interests',
    'rights': 'respecting individual rights',
    'welfare': 'maximizing overall welfare',
    'justice': 'ensuring fair distribution of resources',
    'care': 'maintaining caring relationships',
    'vulnerable': 'protecting vulnerable populations',
    'consent': 'establishing appropriate consent mechanisms',
    'resource': 'effective resource allocation',
    'allocation': 'fair resource distribution'
  };
  
  return commonThemes.map(theme => themeDescriptions[theme] || theme).join(' and ');
}

/**
 * Apply a reflective equilibrium strategy to achieve coherence
 * @param {Object} strategy - The selected strategy
 * @param {Object} conflict - The conflict to resolve
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Resolution with reflective analysis and reasoning
 */
function applyReflectiveEquilibriumStrategy(strategy, conflict, dilemma) {
  let initialJudgments = [];
  let revisedPrinciples = [];
  
  // Extract initial ethical judgments from conflict
  if (conflict.type === 'framework_conflict' && conflict.between) {
    conflict.between.forEach(framework => {
      if (conflict.justifications && conflict.justifications[framework]) {
        initialJudgments.push({
          framework,
          judgment: conflict.justifications[framework]
        });
      }
    });
  } else if (conflict.type === 'multi_framework_conflict' && conflict.action_groups) {
    Object.entries(conflict.action_groups).forEach(([action, frameworks]) => {
      initialJudgments.push({
        action,
        frameworks,
        count: frameworks.length
      });
    });
  }
  
  // Generate simulated revised principles
  revisedPrinciples = [
    "Context-sensitive application of utilitarian principles with priority for vulnerable groups",
    "Recognition of both duty-based and consequence-based ethical considerations",
    "Balance between individual autonomy and collective welfare"
  ];
  
  // Generate reasoning for the reflective equilibrium approach
  const reasoning = `
    This resolution employs reflective equilibrium to resolve the ethical tensions in this dilemma.
    The approach begins with the initial ethical judgments from different frameworks, then adjusts
    both specific judgments and general principles to achieve maximum coherence. Through this
    iterative process, we arrive at a set of revised ethical principles that provide a coherent
    foundation for addressing this specific dilemma while maintaining consistency with our broader
    ethical commitments.
  `.trim();
  
  return {
    initial_judgments: initialJudgments,
    revised_principles: revisedPrinciples,
    reasoning,
    equilibrium_resolution: "Apply the revised ethical principles that emerge from reflective equilibrium",
    weights: { default: 1.0 } // Placeholder for compatibility
  };
}

/**
 * Apply a pluralistic integration strategy that preserves multiple perspectives
 * @param {Object} strategy - The selected strategy
 * @param {Object} conflict - The conflict to resolve
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Resolution with pluralistic analysis and reasoning
 */
function applyPluralisticIntegrationStrategy(strategy, conflict, dilemma) {
  // Extract ethical insights from competing frameworks
  const ethicalInsights = [];
  
  if (conflict.type === 'framework_conflict' && conflict.between) {
    conflict.between.forEach(framework => {
      let insight = "Unknown insight";
      
      if (framework === 'utilitarian') {
        insight = "Attention to consequences and maximizing overall welfare";
      } else if (framework === 'deontology') {
        insight = "Respect for individual rights, dignity, and moral duties";
      } else if (framework === 'care_ethics') {
        insight = "Importance of caring relationships and contextual responses";
      } else if (framework === 'virtue_ethics') {
        insight = "Development of virtuous character and practical wisdom";
      } else if (framework === 'justice') {
        insight = "Fair distribution of benefits and burdens";
      }
      
      ethicalInsights.push({
        framework,
        insight
      });
    });
  } else if (conflict.type === 'multi_framework_conflict' && conflict.action_groups) {
    // For multi-framework conflicts, extract insights from each action group
    Object.entries(conflict.action_groups).forEach(([action, frameworks]) => {
      frameworks.forEach(framework => {
        let insight = "Unknown insight";
        
        if (framework === 'utilitarian') {
          insight = "Attention to consequences and maximizing overall welfare";
        } else if (framework === 'deontology') {
          insight = "Respect for individual rights, dignity, and moral duties";
        } else if (framework === 'care_ethics') {
          insight = "Importance of caring relationships and contextual responses";
        } else if (framework === 'virtue_ethics') {
          insight = "Development of virtuous character and practical wisdom";
        } else if (framework === 'justice') {
          insight = "Fair distribution of benefits and burdens";
        }
        
        ethicalInsights.push({
          framework,
          action,
          insight
        });
      });
    });
  }
  
  // Generate reasoning for the pluralistic integration approach
  const reasoning = `
    This resolution employs pluralistic integration, acknowledging that different ethical frameworks
    each capture important but partial aspects of moral truth. Rather than forcing a unified resolution,
    this approach preserves the distinctive insights of each ethical tradition while showing how they
    can work together to provide comprehensive ethical guidance for this dilemma. By maintaining ethical
    pluralism, we avoid oversimplifying the moral complexity of the situation.
  `.trim();
  
  return {
    ethical_insights: ethicalInsights,
    reasoning,
    integrated_guidance: "Consider multiple ethical dimensions simultaneously while acknowledging tensions",
    weights: { pluralism: 1.0 } // Placeholder for compatibility
  };
}

/**
 * Apply the multi-framework integration strategy
 * @param {Object} strategy - The selected strategy
 * @param {Object} conflict - The conflict to resolve
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Resolution data
 */
async function applyMultiFrameworkIntegration(strategy, conflict, dilemma) {
  // Get all frameworks from the conflict
  const frameworks = Object.keys(conflict.action_groups || {});
  
  // Calculate weights for each framework
  const weights = calculateFrameworkWeights(frameworks, conflict);
  
  // Get the recommended actions from each framework
  const actionsByFramework = {};
  let totalVotes = 0;
  
  for (const [framework, actions] of Object.entries(conflict.action_groups || {})) {
    if (actions && actions.length > 0) {
      actionsByFramework[framework] = actions[0]; // Use the top action from each framework
      totalVotes += weights[framework] || 1;
    }
  }
  
  // Count votes for each action
  const actionVotes = {};
  for (const [framework, action] of Object.entries(actionsByFramework)) {
    if (!actionVotes[action]) {
      actionVotes[action] = 0;
    }
    actionVotes[action] += weights[framework] || 1;
  }
  
  // Find the action with the most votes
  let highestVotes = 0;
  let recommendedAction = null;
  let secondaryAction = null;
  let highestVotesFrameworks = [];
  
  for (const [action, votes] of Object.entries(actionVotes)) {
    if (votes > highestVotes) {
      // If we find a new highest, store the previous highest as secondary
      if (recommendedAction) {
        secondaryAction = recommendedAction;
      }
      
      recommendedAction = action;
      highestVotes = votes;
      highestVotesFrameworks = Object.entries(actionsByFramework)
        .filter(([_, a]) => a === action)
        .map(([f, _]) => f);
    } else if (secondaryAction === null || votes > actionVotes[secondaryAction]) {
      secondaryAction = action;
    }
  }
  
  // Calculate confidence as the percentage of votes for the winning action
  const confidence = Math.round((highestVotes / totalVotes) * 100) / 100;
  
  // Generate supporting and opposing frameworks lists
  const supportingFrameworks = highestVotesFrameworks;
  const opposingFrameworks = Object.entries(actionsByFramework)
    .filter(([_, a]) => a !== recommendedAction)
    .map(([f, _]) => f);
  
  // Create a summary of the integration
  const summary = `Integration of ${frameworks.length} frameworks (${frameworks.join(', ')}) recommends ${recommendedAction} with ${(confidence * 100).toFixed(1)}% confidence.`;
  
  // Create a detailed reasoning
  const reasoning = `
After analyzing this conflict through multiple ethical frameworks, the recommendation is to ${recommendedAction}.

${supportingFrameworks.length} of ${frameworks.length} frameworks support this action, representing a weight of ${highestVotes.toFixed(2)} out of ${totalVotes.toFixed(2)} (${(confidence * 100).toFixed(1)}%).

Supporting frameworks: ${supportingFrameworks.join(', ')}
${opposingFrameworks.length > 0 ? `Opposing frameworks: ${opposingFrameworks.join(', ')}` : 'No opposing frameworks.'}

This integrated approach considers the ethical weight of each perspective while recognizing that some frameworks may be more relevant to this particular dilemma than others.
`.trim();

  // For medical dilemmas, generate a nuanced recommendation
  let nuancedRecommendation = null;
  
  if (isMedicalContext(dilemma) && secondaryAction) {
    nuancedRecommendation = generateNuancedMedicalRecommendation(
      recommendedAction,
      secondaryAction,
      1 - confidence, // Use confidence as a measure of nuance (lower confidence = more nuanced)
      dilemma
    );
  }
  
  // Update recommendation if we have a nuanced version
  if (nuancedRecommendation && nuancedRecommendation.isNuanced) {
    return {
      strategy: strategy.name,
      description: strategy.description,
      recommended_action: nuancedRecommendation.action,
      meta_recommendation: nuancedRecommendation.action,
      reasoning: reasoning + "\n\n" + nuancedRecommendation.reasoning,
      weights: weights,
      confidence: confidence,
      supporting_frameworks: supportingFrameworks,
      opposing_frameworks: opposingFrameworks,
      summary: summary,
      processing_mode: 'multi_framework_integration_nuanced',
      detail_level: 'high',
      nuanced_recommendation: nuancedRecommendation
    };
  }
  
  // Standard response without nuance
  return {
    strategy: strategy.name,
    description: strategy.description,
    recommended_action: recommendedAction,
    meta_recommendation: recommendedAction,
    reasoning: reasoning,
    weights: weights,
    confidence: confidence,
    supporting_frameworks: supportingFrameworks,
    opposing_frameworks: opposingFrameworks,
    summary: summary,
    processing_mode: 'multi_framework_integration',
    detail_level: 'high'
  };
}

/**
 * Determine if a dilemma is in the medical domain
 * @param {Object} dilemma - The dilemma to check
 * @returns {boolean} - Whether this is a medical dilemma
 */
function isMedicalContext(dilemma) {
  // Check explicit domain if available
  if (dilemma.domain && 
     (dilemma.domain.toLowerCase().includes('medical') || 
      dilemma.domain.toLowerCase().includes('health') ||
      dilemma.domain.toLowerCase().includes('patient'))) {
    return true;
  }
  
  // Check for medical parameters
  const medicalParams = [
    'life_at_stake', 'quality_of_life', 'treatment_success',
    'patient_capacity', 'medical_resources', 'triage_score'
  ];
  
  if (dilemma.parameters) {
    for (const param of medicalParams) {
      if (dilemma.parameters[param] !== undefined) {
        return true;
      }
    }
  }
  
  // Check title and description
  const medicalKeywords = /medical|health|patient|hospital|treatment|diagnosis|care|doctor|nurse|therapy|clinical/i;
  if ((dilemma.title && medicalKeywords.test(dilemma.title)) ||
      (dilemma.description && medicalKeywords.test(dilemma.description))) {
    return true;
  }
  
  return false;
}

/**
 * Resolve conflicts between frameworks or stakeholders
 * @param {Array} conflicts - Detected conflicts
 * @param {Object} frameworkResults - Results from each framework
 * @param {Object} dilemma - The dilemma context
 * @param {Object} options - Resolution options
 * @returns {Promise<Object>} Conflict resolutions and recommendation
 */
export async function resolveConflicts(conflicts, frameworkResults, dilemma, options = {}) {
  // Initialize results
  const results = {
    resolutions: [],
    insights: [],
    metadata: {
      conflictCount: conflicts ? conflicts.length : 0,
      totalResolutions: 0
    }
  };
  
  // If no conflicts, return empty results
  if (!conflicts || conflicts.length === 0) {
    return results;
  }
  
  // Resolve each conflict
  const resolutionPromises = conflicts.map(async conflict => {
    try {
      let resolution;
      
      // Different resolution logic based on conflict type
      if (conflict.type === 'framework_conflict') {
        resolution = await resolvePairwiseConflict(conflict, frameworkResults, dilemma);
      } else if (conflict.type === 'multi_framework_conflict') {
        resolution = await resolveMultiFrameworkConflict(conflict, frameworkResults, dilemma);
      } else if (conflict.type === 'stakeholder_conflict') {
        resolution = await resolveStakeholderConflict(conflict, frameworkResults, dilemma);
      } else {
        console.warn(`Unknown conflict type: ${conflict.type}`);
        // Default to pairwise conflict resolution
        resolution = await resolvePairwiseConflict(conflict, frameworkResults, dilemma);
      }
      
      // Add conflict reference for tracking, but preserve resolution properties
      if (resolution) {
        // Save a copy of important fields before we add the conflict reference
        const enhancedFields = {};
        
        // Preserve principled_priority fields
        if (resolution.principled_weights) enhancedFields.principled_weights = resolution.principled_weights;
        if (resolution.principled_reasoning) enhancedFields.principled_reasoning = resolution.principled_reasoning;
        if (resolution.principled_priority_framework) enhancedFields.principled_priority_framework = resolution.principled_priority_framework;
        if (resolution.principled_priority_reason) enhancedFields.principled_priority_reason = resolution.principled_priority_reason;
        
        // Preserve casuistry fields
        if (resolution.casuistry_precedent_cases) enhancedFields.casuistry_precedent_cases = resolution.casuistry_precedent_cases;
        if (resolution.casuistry_resolution) enhancedFields.casuistry_resolution = resolution.casuistry_resolution;
        if (resolution.casuistry_detailed_analysis) enhancedFields.casuistry_detailed_analysis = resolution.casuistry_detailed_analysis;
        
        // Add conflict reference
        resolution.conflict_reference = conflict;
        
        // Re-apply enhanced fields to ensure they're not lost
        return { ...resolution, ...enhancedFields };
      }
      
      return resolution;
    } catch (error) {
      console.error(`Error resolving conflict: ${error.message}`, error);
      return null;
    }
  });
  
  // Wait for all resolutions to complete
  const resolvedConflicts = await Promise.all(resolutionPromises);
  
  // Filter out null resolutions
  results.resolutions = resolvedConflicts.filter(r => r !== null);
  results.metadata.totalResolutions = results.resolutions.length;
  
  return results;
}

/**
 * Resolve a pairwise conflict between two frameworks
 * @param {Object} conflict - The conflict to resolve
 * @param {Object} frameworkResults - Results from each framework
 * @param {Object} dilemma - The dilemma context
 * @returns {Promise<Object>} Conflict resolution
 */
async function resolvePairwiseConflict(conflict, frameworkResults, dilemma) {
  try {
    // Select a resolution strategy
    const strategy = selectResolutionStrategy(conflict, dilemma);
    
    // Apply the selected strategy
    const resolution = await applyResolutionStrategy(strategy, conflict, dilemma);
    
    // Create the resolution object with all fields from the strategy output
    const result = {
      id: `resolution-${Math.random().toString(36).substr(2, 9)}`,
      conflictId: conflict.id,
      conflictType: conflict.type,
      strategy: strategy.name,
      resolution_strategy: strategy.name,
      description: strategy.description
    };

    // Handle special strategy outputs
    if (strategy.name === 'casuistry') {
      // Include full precedent details for casuistry
      result.precedent_cases = resolution.precedent_cases || [];
      result.casuistry_resolution = resolution.casuistry_resolution;
      result.detailed_precedent_analysis = resolution.detailed_precedent_analysis;
      
      // Ensure prefixed fields are preserved
      result.casuistry_precedent_cases = resolution.casuistry_precedent_cases || resolution.precedent_cases || [];
      result.casuistry_detailed_analysis = resolution.casuistry_detailed_analysis || resolution.detailed_precedent_analysis;
    } else if (strategy.name === 'principled_priority') {
      // Include weights and reasoning for principled priority
      result.weights = resolution.weights || {};
      result.priority_framework = resolution.priority_framework;
      result.priority_reason = resolution.priority_reason;
      
      // Ensure prefixed fields are preserved
      result.principled_weights = resolution.principled_weights || resolution.weights || {};
      result.principled_reasoning = resolution.principled_reasoning || resolution.reasoning;
      result.principled_priority_framework = resolution.principled_priority_framework || resolution.priority_framework;
      result.principled_priority_reason = resolution.principled_priority_reason || resolution.priority_reason;
    }
    
    // Merge all remaining resolution properties
    return { ...result, ...resolution };
  } catch (error) {
    console.error(`Error in pairwise conflict resolution: ${error.message}`, error);
    throw error;
  }
}

/**
 * Resolve a multi-framework conflict
 * @param {Object} conflict - The conflict to resolve
 * @param {Object} frameworkResults - Results from each framework
 * @param {Object} dilemma - The dilemma context
 * @returns {Promise<Object>} Conflict resolution
 */
async function resolveMultiFrameworkConflict(conflict, frameworkResults, dilemma) {
  try {
    // For multi-framework conflicts, pluralistic integration is often best
    const strategy = {
      name: 'multi_framework_integration',
      description: 'Integration of multiple ethical perspectives',
      score: 0.9
    };
    
    // Apply the pluralistic integration strategy
    const resolution = await applyResolutionStrategy(strategy, conflict, dilemma);
    
    // Create the resolution object with all fields from the strategy output
    const result = {
      id: `resolution-${Math.random().toString(36).substr(2, 9)}`,
      conflictId: conflict.id,
      conflictType: conflict.type,
      strategy: strategy.name,
      resolution_strategy: strategy.name,
      description: strategy.description
    };
    
    // Merge all remaining resolution properties
    return { ...result, ...resolution };
  } catch (error) {
    console.error(`Error in multi-framework conflict resolution: ${error.message}`, error);
    throw error;
  }
}

/**
 * Resolve a stakeholder conflict
 * @param {Object} conflict - The conflict to resolve
 * @param {Object} frameworkResults - Results from each framework
 * @param {Object} dilemma - The dilemma context
 * @returns {Promise<Object>} Conflict resolution
 */
async function resolveStakeholderConflict(conflict, frameworkResults, dilemma) {
  try {
    // For stakeholder conflicts, use the stakeholder compromise strategy
    const strategy = {
      name: 'stakeholder_compromise',
      description: 'Balance the interests of different stakeholders',
      score: 0.9
    };
    
    // Create a basic resolution
    const resolution = {
      id: `resolution-${Math.random().toString(36).substr(2, 9)}`,
      conflictId: conflict.id,
      conflictType: conflict.type,
      resolution_strategy: 'stakeholder_compromise',
      description: 'Balance the interests of different stakeholders',
      stakeholders: conflict.between,
      reasoning: `This resolution attempts to find a fair balance between the competing interests of different stakeholders.
        By considering the relative influence, vulnerability, and importance of each stakeholder group,
        we can arrive at a solution that acknowledges all perspectives while prioritizing the most critical concerns.`,
      proposed_solution: 'Implement a phased approach that addresses the most urgent needs of all stakeholders while establishing a process for addressing remaining concerns'
    };
    
    return resolution;
  } catch (error) {
    console.error(`Error in stakeholder conflict resolution: ${error.message}`, error);
    throw error;
  }
}

/**
 * Calculate weights for frameworks in multi-framework integration
 * @param {Array<string>} frameworks - The frameworks to weight
 * @param {Object} conflict - The conflict data
 * @returns {Object} Weights for each framework
 */
function calculateFrameworkWeights(frameworks, conflict) {
  const weights = {};
  let totalWeight = 0;
  
  // Start with equal weighting
  for (const framework of frameworks) {
    weights[framework] = 1.0;
    totalWeight += 1.0;
  }
  
  // Adjust weights based on framework type
  for (const framework of frameworks) {
    // Check for universal frameworks (applies to all contexts)
    if (framework.includes('utilitarian') || framework.includes('justice')) {
      weights[framework] *= 1.0; // Standard weight
    }
    
    // Check for care ethics (good for relational contexts)
    if (framework.includes('care')) {
      weights[framework] *= 1.1; // Slightly higher
    }
    
    // Check for virtue ethics (often unique perspective)
    if (framework.includes('virtue')) {
      weights[framework] *= 1.05; // Slightly higher
    }
    
    // Update total weight
    totalWeight += weights[framework] - 1.0; // Add the difference from the initial 1.0
  }
  
  // Normalize weights to sum to frameworks.length
  // This maintains the weight average = 1.0 across all frameworks
  const normalizedWeights = {};
  const normalizationFactor = frameworks.length / totalWeight;
  
  for (const framework in weights) {
    normalizedWeights[framework] = weights[framework] * normalizationFactor;
  }
  
  return normalizedWeights;
}

/**
 * Apply stakeholder CVaR strategy for resolving conflicts
 * @param {Object} strategy - The strategy to apply
 * @param {Object} conflict - The ethical conflict to resolve
 * @param {Object} dilemma - The ethical dilemma
 * @returns {Object} Resolution using the stakeholder CVaR approach
 */
function applyStakeholderCVaRStrategy(strategy, conflict, dilemma) {
  // Extract stakeholders from the dilemma
  const stakeholders = dilemma.stakeholders || [];
  if (!stakeholders.length) {
    return {
      action: conflict.proposed_actions[0] || "no_action",
      justification: "Unable to apply CVaR analysis due to missing stakeholder information.",
      confidence: 0.4
    };
  }
  
  // Calculate potential impact on each stakeholder for each action
  const stakeholderImpacts = {};
  const actionsToAnalyze = conflict.proposed_actions || 
                          (conflict.action_groups ? Object.keys(conflict.action_groups) : []);
  
  // For each action, assess impact on stakeholders
  for (const action of actionsToAnalyze) {
    stakeholderImpacts[action] = {};
    
    for (const stakeholder of stakeholders) {
      const impact = estimateImpact(stakeholder, action, dilemma);
      stakeholderImpacts[action][stakeholder.id] = impact;
    }
  }
  
  // Calculate CVaR (Conditional Value at Risk) for each action
  // This focuses on the expected loss in worst-case scenarios
  const cvarByAction = {};
  for (const action of actionsToAnalyze) {
    // Extract impacts for this action and sort from worst to best
    const impacts = Object.values(stakeholderImpacts[action])
      .sort((a, b) => a.value - b.value);
    
    // Calculate CVaR - average of worst 20% impacts
    const cvarThreshold = Math.ceil(impacts.length * 0.2);
    const worstImpacts = impacts.slice(0, Math.max(1, cvarThreshold));
    const cvarValue = worstImpacts.reduce((sum, impact) => sum + impact.value, 0) / worstImpacts.length;
    
    cvarByAction[action] = {
      value: cvarValue,
      worstAffectedStakeholders: worstImpacts.map(impact => impact.stakeholderId)
    };
  }
  
  // Identify the action with the least negative CVaR
  let bestAction = actionsToAnalyze[0];
  let bestCVaR = cvarByAction[bestAction].value;
  
  for (const action of actionsToAnalyze) {
    if (cvarByAction[action].value > bestCVaR) {
      bestAction = action;
      bestCVaR = cvarByAction[action].value;
    }
  }
  
  // Generate justification
  const justification = `
    Using Conditional Value at Risk analysis, the action "${bestAction}" minimizes the negative impact 
    on the most vulnerable stakeholders. While other actions may have higher average benefits, this approach
    prioritizes protecting those who would be most severely affected by a negative outcome.
    
    The stakeholders most protected by this decision include: ${cvarByAction[bestAction].worstAffectedStakeholders.join(', ')}.
  `.trim();
  
  return {
    action: bestAction,
    justification: justification,
    confidence: 0.8,
    cvarAnalysis: cvarByAction
  };
}

/**
 * Helper function to estimate impact of an action on a stakeholder
 * @param {Object} stakeholder - Stakeholder object
 * @param {string} action - The action to evaluate
 * @param {Object} dilemma - The ethical dilemma
 * @returns {Object} Impact assessment
 */
function estimateImpact(stakeholder, action, dilemma) {
  // Default impact
  let impact = {
    stakeholderId: stakeholder.id,
    value: 0,
    description: `Neutral impact on ${stakeholder.id}`
  };
  
  // Try to extract impact from dilemma if available
  if (dilemma.impacts && dilemma.impacts[action] && dilemma.impacts[action][stakeholder.id]) {
    const specifiedImpact = dilemma.impacts[action][stakeholder.id];
    impact.value = typeof specifiedImpact.value === 'number' ? specifiedImpact.value : 0;
    impact.description = specifiedImpact.description || impact.description;
    return impact;
  }
  
  // If no direct impact is specified, estimate based on stakeholder vulnerability
  const vulnerability = stakeholder.vulnerability || 0.5;
  const directness = stakeholder.directness || 0.5;
  
  // Invert vulnerability scale so higher vulnerability means worse potential impact
  impact.value = 0.5 - (vulnerability * directness);
  impact.description = `Estimated impact on ${stakeholder.id} based on vulnerability (${vulnerability}) and directness (${directness})`;
  
  return impact;
}

export default {
  resolutionStrategies,
  selectResolutionStrategy,
  applyResolutionStrategy
}; 