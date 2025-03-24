/**
 * Resolution Hybrid Module
 * 
 * This module contains functions for hybrid resolution approaches that combine
 * multiple ethical frameworks to resolve conflicts.
 */

import { normalizeFrameworkName } from './core.js';
import { detectCausalLanguage, extractCausalStatements } from '../analysis/causalDetection.js';
import { CausalGraph } from '../analysis/causalGraph.js';
import { ConsequenceSchema } from '../analysis/consequenceSchema.js';

/**
 * Apply duty-bounded utilitarianism approach to resolve conflicts
 * @param {Object} path1 - First reasoning path
 * @param {Object} path2 - Second reasoning path
 * @param {Object} dilemma - The ethical dilemma
 * @returns {Object} Resolved path using duty-bounded utilitarianism
 */
function applyDutyBoundedUtilitarianism(path1, path2, dilemma) {
    // Determine which path is deontological and which is utilitarian
    const deonPath = isDeonPath(path1) ? path1 : (isDeonPath(path2) ? path2 : null);
    const utilPath = isUtilPath(path1) ? path1 : (isUtilPath(path2) ? path2 : null);
    
    // If we don't have both types, create a fallback hybrid
    if (!deonPath || !utilPath) {
        // Create fallback hybrid with whatever paths we have
        return createFallbackHybrid(
            path1, 
            path2, 
            "Duty-Bounded Utilitarianism", 
            "Combines deontological constraints with utilitarian calculations."
        );
    }
    
    // Extract duties/constraints from deontological path
    const constraints = extractDuties(deonPath);
    
    // Extract utility calculations from utilitarian path
    const utilities = extractUtilities(utilPath);
    
    // Apply constraints to utility calculations
    const boundedUtilities = applyConstraints(utilities, constraints);
    
    // Determine if any constraints were violated
    const hasViolations = boundedUtilities.constraintViolations && 
                          boundedUtilities.constraintViolations.length > 0;
    
    // Determine if there are permissible actions
    const hasPermissibleActions = boundedUtilities.permissibleActions && 
                                 boundedUtilities.permissibleActions.length > 0;
    
    // Determine the action based on bounded utilities
    let recommendedAction = deonPath.action || utilPath.action;
    let actionJustification = "";
    
    if (hasViolations) {
        // If there are violations, prefer the deontological action
        recommendedAction = deonPath.action;
        actionJustification = "Due to potential violations of moral constraints, the deontological perspective takes precedence.";
    } else if (hasPermissibleActions) {
        // If there are explicitly permissible actions, recommend the utilitarian action
        recommendedAction = utilPath.action;
        actionJustification = "Since the action is permissible within moral constraints, the utilitarian perspective guides the final decision.";
    } else {
        // If no clear violations or permissions, balance both perspectives
        actionJustification = "Balancing both moral constraints and utility considerations leads to this recommendation.";
    }
    
    // Create a detailed analysis of constraints and utilities
    const constraintAnalysis = constraints.duties.length > 0 
        ? `Key moral duties identified: ${constraints.duties.slice(0, 3).join('; ')}${constraints.duties.length > 3 ? '...' : ''}`
        : "No specific moral duties were identified.";
    
    const constraintPrinciples = constraints.principles.length > 0
        ? `Key moral principles identified: ${constraints.principles.slice(0, 3).join('; ')}${constraints.principles.length > 3 ? '...' : ''}`
        : "No specific moral principles were identified.";
    
    const utilityAnalysis = utilities.utilities.length > 0
        ? `Key utility considerations identified: ${utilities.utilities.slice(0, 3).join('; ')}${utilities.utilities.length > 3 ? '...' : ''}`
        : "No specific utility considerations were identified.";
    
    const welfareAnalysis = utilities.welfare.length > 0
        ? `Key welfare considerations identified: ${utilities.welfare.slice(0, 3).join('; ')}${utilities.welfare.length > 3 ? '...' : ''}`
        : "No specific welfare considerations were identified.";
    
    // Create argument text with more detailed analysis
    const argumentText = `
This approach combines deontological ethics from ${deonPath.framework} with utilitarian reasoning from ${utilPath.framework}.

DEONTOLOGICAL CONSTRAINTS:
${constraintAnalysis}
${constraintPrinciples}
${constraints.constraints.length > 0 ? `Moral constraints identified: ${constraints.constraints.slice(0, 3).join('; ')}${constraints.constraints.length > 3 ? '...' : ''}` : "No specific moral constraints were identified."}

UTILITARIAN CONSIDERATIONS:
${utilityAnalysis}
${welfareAnalysis}
${utilities.calculations.length > 0 ? `Utility calculations identified: ${utilities.calculations.slice(0, 3).join('; ')}${utilities.calculations.length > 3 ? '...' : ''}` : "No specific utility calculations were identified."}

CONSTRAINT APPLICATION ANALYSIS:
${hasViolations ? `Some utility considerations violate moral constraints: ${boundedUtilities.constraintViolations.slice(0, 2).join('; ')}${boundedUtilities.constraintViolations.length > 2 ? '...' : ''}` : "No utility considerations directly violate moral constraints."}
${hasPermissibleActions ? `Some actions are explicitly permissible: ${boundedUtilities.permissibleActions.slice(0, 2).join('; ')}${boundedUtilities.permissibleActions.length > 2 ? '...' : ''}` : "No actions were identified as explicitly permissible."}
${boundedUtilities.boundedUtilities.length > 0 ? `Bounded utility considerations: ${boundedUtilities.boundedUtilities.slice(0, 3).join('; ')}${boundedUtilities.boundedUtilities.length > 3 ? '...' : ''}` : "No bounded utility considerations were identified."}

HYBRID REASONING:
By applying deontological constraints to utilitarian calculations, we reach an ethical assessment that respects moral boundaries while still being sensitive to outcomes and welfare. This avoids the potential harshness of pure deontology and the potential moral hazards of unrestricted utilitarianism.

${actionJustification}
`.trim();
    
    // Create a concise conclusion
    const conclusion = `The duty-bounded utilitarian approach suggests ${recommendedAction} as the most ethical course of action, respecting moral constraints while still promoting positive outcomes.`;
    
    // Create a new hybrid path with detailed analysis
    return {
        id: `hybrid-duty-bounded-${Date.now()}`,
        framework: `Hybrid: Duty-Bounded Utilitarianism`,
        action: recommendedAction,
        strength: Math.max(deonPath.strength || 0.7, utilPath.strength || 0.7),
        argument: argumentText,
        conclusion: conclusion,
        original_paths: [deonPath, utilPath],
        evaluatedResults: boundedUtilities,
        constraints: constraints,
        utilities: utilities,
        analysis: {
            hasViolations,
            hasPermissibleActions,
            actionJustification,
            boundedUtilitiesCount: boundedUtilities.boundedUtilities.length,
            constraintViolationsCount: boundedUtilities.constraintViolations.length,
            permissibleActionsCount: boundedUtilities.permissibleActions.length
        }
    };
}

/**
 * Apply virtue-guided consequentialism approach to resolve conflicts
 * @param {Object} path1 - First reasoning path
 * @param {Object} path2 - Second reasoning path
 * @param {Object} dilemma - The ethical dilemma
 * @returns {Object} Resolved path using virtue-guided consequentialism
 */
function applyVirtueGuidedConsequentialism(path1, path2, dilemma) {
    // Determine which path is virtue ethics and which is consequentialist
    const virtuePath = isVirtuePath(path1) ? path1 : (isVirtuePath(path2) ? path2 : null);
    const consequentialistPath = isConsequentialistPath(path1) ? path1 : (isConsequentialistPath(path2) ? path2 : null);
    
    // If we don't have both types, create a fallback hybrid
    if (!virtuePath || !consequentialistPath) {
        // Create fallback hybrid with whatever paths we have
        return createFallbackHybrid(
            path1, 
            path2, 
            "Virtue-Guided Consequentialism", 
            "Evaluates consequences through the lens of virtuous character."
        );
    }
    
    // Extract virtues from virtue ethics path
    const virtues = extractVirtues(virtuePath);
    
    // Extract consequences from consequentialist path
    const consequences = extractConsequences(consequentialistPath);
    
    // Evaluate consequences through the lens of virtues
    const evaluatedConsequences = evaluateConsequencesWithVirtues(consequences, virtues);
    
    // Determine if there are virtue-aligned outcomes
    const hasAlignedOutcomes = evaluatedConsequences.alignments && 
                              evaluatedConsequences.alignments.length > 0;
    
    // Determine if there are virtue-conflicting outcomes
    const hasConflictingOutcomes = evaluatedConsequences.conflicts && 
                                  evaluatedConsequences.conflicts.length > 0;
    
    // Determine the action based on virtue evaluation
    let recommendedAction = virtuePath.action || consequentialistPath.action;
    let actionJustification = "";
    
    if (hasAlignedOutcomes && !hasConflictingOutcomes) {
        // If there are only aligned outcomes, prefer the consequentialist action
        recommendedAction = consequentialistPath.action;
        actionJustification = "Since the consequences align with virtuous character, the consequentialist perspective guides the final decision.";
    } else if (hasConflictingOutcomes && !hasAlignedOutcomes) {
        // If there are only conflicting outcomes, prefer the virtue ethics action
        recommendedAction = virtuePath.action;
        actionJustification = "Due to conflicts between consequences and virtuous character, the virtue ethics perspective takes precedence.";
    } else {
        // If mixed or unclear, balance both perspectives
        actionJustification = "Balancing both virtue considerations and consequences leads to this recommendation.";
    }
    
    // Create a detailed analysis of virtues and consequences
    const virtueAnalysis = virtues.virtues.length > 0 
        ? `Key virtues identified: ${virtues.virtues.slice(0, 3).join('; ')}${virtues.virtues.length > 3 ? '...' : ''}`
        : "No specific virtues were identified.";
    
    const specificVirtuesAnalysis = virtues.specificVirtues && virtues.specificVirtues.length > 0
        ? `Specific virtues mentioned: ${virtues.specificVirtues.join(', ')}`
        : "No specific virtues were mentioned.";
    
    const characterAnalysis = virtues.character.length > 0
        ? `Character considerations: ${virtues.character.slice(0, 3).join('; ')}${virtues.character.length > 3 ? '...' : ''}`
        : "No specific character considerations were identified.";
    
    const consequenceAnalysis = consequences.consequences && consequences.consequences.length > 0
        ? `Key consequences identified: ${consequences.consequences.slice(0, 3).join('; ')}${consequences.consequences.length > 3 ? '...' : ''}`
        : "No specific consequences were identified.";
    
    // Create argument text with more detailed analysis
    const argumentText = `
This approach integrates virtue ethics from ${virtuePath.framework} with consequentialist reasoning from ${consequentialistPath.framework}.

VIRTUE ETHICS CONSIDERATIONS:
${virtueAnalysis}
${specificVirtuesAnalysis}
${characterAnalysis}
${virtues.excellence.length > 0 ? `Excellence considerations: ${virtues.excellence.slice(0, 3).join('; ')}${virtues.excellence.length > 3 ? '...' : ''}` : "No specific excellence considerations were identified."}

CONSEQUENTIALIST CONSIDERATIONS:
${consequenceAnalysis}

VIRTUE-GUIDED EVALUATION:
${hasAlignedOutcomes ? `Consequences that align with virtues: ${evaluatedConsequences.alignments.slice(0, 2).map(o => o.consequence).join('; ')}${evaluatedConsequences.alignments.length > 2 ? '...' : ''}` : "No consequences were found to clearly align with virtues."}
${hasConflictingOutcomes ? `Consequences that conflict with virtues: ${evaluatedConsequences.conflicts.slice(0, 2).map(o => o.consequence).join('; ')}${evaluatedConsequences.conflicts.length > 2 ? '...' : ''}` : "No consequences were found to clearly conflict with virtues."}

DETAILED EVALUATIONS:
${evaluatedConsequences.summary}

HYBRID REASONING:
By evaluating consequences through the lens of virtuous character, we arrive at an ethical judgment that considers not just what happens, but what kind of person would make such choices. This avoids both the potential narrowness of virtue ethics alone and the potential callousness of pure consequentialism.

${actionJustification}
`.trim();
    
    // Create a concise conclusion
    const conclusion = `The virtue-guided consequentialist approach suggests ${recommendedAction} as the most ethical course of action, reflecting both virtuous character and positive outcomes.`;
    
    // Create a new hybrid path with detailed analysis
    return {
        id: `hybrid-virtue-consequentialist-${Date.now()}`,
        framework: `Hybrid: Virtue-Guided Consequentialism`,
        action: recommendedAction,
        strength: Math.max(virtuePath.strength || 0.7, consequentialistPath.strength || 0.7),
        argument: argumentText,
        conclusion: conclusion,
        original_paths: [virtuePath, consequentialistPath],
        evaluatedConsequences: evaluatedConsequences,
        virtues: virtues,
        consequences: consequences,
        analysis: {
            hasAlignedOutcomes,
            hasConflictingOutcomes,
            actionJustification,
            alignedOutcomesCount: evaluatedConsequences.alignments.length,
            conflictingOutcomesCount: evaluatedConsequences.conflicts.length,
            specificVirtuesApplied: evaluatedConsequences.specificVirtuesApplied || []
        }
    };
}

/**
 * Apply care-based justice approach to resolve conflicts
 * @param {Object} path1 - First reasoning path
 * @param {Object} path2 - Second reasoning path
 * @param {Object} dilemma - The ethical dilemma
 * @returns {Object} Resolved path using care-based justice
 */
function applyCareBasedJustice(path1, path2, dilemma) {
    // Determine which path is care ethics and which is justice-based
    const carePath = isCarePath(path1) ? path1 : (isCarePath(path2) ? path2 : null);
    const justicePath = isJusticePath(path1) ? path1 : (isJusticePath(path2) ? path2 : null);
    
    // If we don't have both types, create a fallback hybrid
    if (!carePath || !justicePath) {
        // Create fallback hybrid with whatever paths we have
        return createFallbackHybrid(
            path1, 
            path2, 
            "Care-Based Justice", 
            "Integrates principles of care ethics with justice considerations."
        );
    }
    
    // Extract care considerations from care ethics path
    const careConsiderations = extractCareConsiderations(carePath);
    
    // Extract justice principles from justice-based path
    const justicePrinciples = extractJusticePrinciples(justicePath);
    
    // Integrate care considerations with justice principles
    const integratedPrinciples = integrateCarePrinciples(careConsiderations, justicePrinciples);
    
    // Determine if there are enhanced justice principles
    const hasEnhancedPrinciples = integratedPrinciples.enhancedJusticePrinciples && 
                                 integratedPrinciples.enhancedJusticePrinciples.length > 0;
    
    // Determine if there are contextualized rights
    const hasContextualizedRights = integratedPrinciples.contextualizedRights && 
                                   integratedPrinciples.contextualizedRights.length > 0;
    
    // Determine if there are non-integrated care considerations
    const hasNonIntegratedCare = integratedPrinciples.nonIntegratedCare && 
                                integratedPrinciples.nonIntegratedCare.length > 0;
    
    // Determine the action based on integration analysis
    let recommendedAction = carePath.action || justicePath.action;
    let actionJustification = "";
    
    if (hasEnhancedPrinciples && hasContextualizedRights) {
        // If we have both enhanced principles and contextualized rights, 
        // this is a strong integration - balance both perspectives
        actionJustification = "The strong integration of care and justice perspectives leads to a balanced recommendation.";
    } else if (hasEnhancedPrinciples) {
        // If we have enhanced principles but not contextualized rights,
        // lean toward the justice perspective but informed by care
        recommendedAction = justicePath.action;
        actionJustification = "Justice principles enhanced by care considerations guide this recommendation.";
    } else if (hasContextualizedRights) {
        // If we have contextualized rights but not enhanced principles,
        // lean toward the care perspective but respecting rights
        recommendedAction = carePath.action;
        actionJustification = "Care ethics contextualized with rights considerations guides this recommendation.";
    } else if (hasNonIntegratedCare) {
        // If we have non-integrated care considerations,
        // lean toward the care perspective
        recommendedAction = carePath.action;
        actionJustification = "The care ethics perspective takes precedence due to important care considerations.";
    } else {
        // If no clear integration pattern, balance both perspectives
        actionJustification = "Balancing both care and justice considerations leads to this recommendation.";
    }
    
    // Create a detailed analysis of care considerations and justice principles
    const careAnalysis = careConsiderations.careConsiderations.length > 0 
        ? `Key care considerations identified: ${careConsiderations.careConsiderations.slice(0, 3).join('; ')}${careConsiderations.careConsiderations.length > 3 ? '...' : ''}`
        : "No specific care considerations were identified.";
    
    const relationshipsAnalysis = careConsiderations.relationships && careConsiderations.relationships.length > 0
        ? `Relationship considerations: ${careConsiderations.relationships.join(', ')}`
        : "No specific relationship considerations were mentioned.";
    
    const contextualAnalysis = careConsiderations.contextual && careConsiderations.contextual.length > 0
        ? `Contextual considerations: ${careConsiderations.contextual.join(', ')}`
        : "No specific contextual considerations were mentioned.";
    
    const justicePrinciplesAnalysis = justicePrinciples.justicePrinciples.length > 0
        ? `Key justice principles identified: ${justicePrinciples.justicePrinciples.slice(0, 3).join('; ')}${justicePrinciples.justicePrinciples.length > 3 ? '...' : ''}`
        : "No specific justice principles were identified.";
    
    const fairnessAnalysis = justicePrinciples.fairness && justicePrinciples.fairness.length > 0
        ? `Fairness considerations: ${justicePrinciples.fairness.join(', ')}`
        : "No specific fairness considerations were mentioned.";
    
    const rightsAnalysis = justicePrinciples.rights && justicePrinciples.rights.length > 0
        ? `Rights considerations: ${justicePrinciples.rights.join(', ')}`
        : "No specific rights considerations were mentioned.";
    
    // Create argument text with more detailed analysis
    const argumentText = `
This approach merges care ethics from ${carePath.framework} with justice-based reasoning from ${justicePath.framework}.

CARE ETHICS CONSIDERATIONS:
${careAnalysis}
${relationshipsAnalysis}
${contextualAnalysis}

JUSTICE-BASED CONSIDERATIONS:
${justicePrinciplesAnalysis}
${fairnessAnalysis}
${rightsAnalysis}

INTEGRATION ANALYSIS:
${hasEnhancedPrinciples ? `Justice principles enhanced by care: ${integratedPrinciples.enhancedJusticePrinciples.slice(0, 2).map(p => p.enhancedFormulation).join('; ')}${integratedPrinciples.enhancedJusticePrinciples.length > 2 ? '...' : ''}` : "No justice principles were enhanced by care considerations."}
${hasContextualizedRights ? `Rights contextualized by care: ${integratedPrinciples.contextualizedRights.slice(0, 2).map(r => r.contextualizedFormulation).join('; ')}${integratedPrinciples.contextualizedRights.length > 2 ? '...' : ''}` : "No rights were contextualized by care considerations."}
${hasNonIntegratedCare ? `Standalone care considerations: ${integratedPrinciples.nonIntegratedCare.slice(0, 2).join('; ')}${integratedPrinciples.nonIntegratedCare.length > 2 ? '...' : ''}` : "All care considerations were integrated with justice principles."}

HYBRID REASONING:
By integrating care considerations with justice principles, we develop an ethical perspective that is both attentive to particular relationships and needs while also maintaining a commitment to fairness and impartiality. This approach overcomes the potential partiality of care ethics alone and the potential abstraction of justice-based approaches.

${actionJustification}
`.trim();
    
    // Create a concise conclusion
    const conclusion = `The care-based justice approach suggests ${recommendedAction} as the most ethical course of action, balancing care for individuals with principles of fairness.`;
    
    // Create a new hybrid path with detailed analysis
    return {
        id: `hybrid-care-justice-${Date.now()}`,
        framework: `Hybrid: Care-Based Justice`,
        action: recommendedAction,
        strength: Math.max(carePath.strength || 0.7, justicePath.strength || 0.7),
        argument: argumentText,
        conclusion: conclusion,
        original_paths: [carePath, justicePath],
        integratedPrinciples: integratedPrinciples,
        careConsiderations: careConsiderations,
        justicePrinciples: justicePrinciples,
        analysis: {
            hasEnhancedPrinciples,
            hasContextualizedRights,
            hasNonIntegratedCare,
            actionJustification,
            enhancedPrinciplesCount: integratedPrinciples.enhancedJusticePrinciples ? integratedPrinciples.enhancedJusticePrinciples.length : 0,
            contextualizedRightsCount: integratedPrinciples.contextualizedRights ? integratedPrinciples.contextualizedRights.length : 0,
            nonIntegratedCareCount: integratedPrinciples.nonIntegratedCare ? integratedPrinciples.nonIntegratedCare.length : 0
        }
    };
}

/**
 * Check if a path is based on deontological ethics
 * @param {Object} path - The reasoning path
 * @returns {boolean} True if the path is deontological
 */
function isDeonPath(path) {
    if (!path || !path.framework) return false;
    
    const framework = normalizeFrameworkName(path.framework);
    return framework.includes('deontolog') || 
           framework.includes('kantian') || 
           framework.includes('duty') || 
           framework.includes('rights');
}

/**
 * Check if a path is based on utilitarian ethics
 * @param {Object} path - The reasoning path
 * @returns {boolean} True if the path is utilitarian
 */
function isUtilPath(path) {
    if (!path || !path.framework) return false;
    
    const framework = normalizeFrameworkName(path.framework);
    return framework.includes('utilitarian') || 
           framework.includes('consequential') || 
           framework.includes('utility');
}

/**
 * Check if a path is based on virtue ethics
 * @param {Object} path - The reasoning path
 * @returns {boolean} True if the path is virtue ethics
 */
function isVirtuePath(path) {
    if (!path || !path.framework) return false;
    
    const framework = normalizeFrameworkName(path.framework);
    return framework.includes('virtue');
}

/**
 * Check if a path is based on consequentialist ethics
 * @param {Object} path - The reasoning path
 * @returns {boolean} True if the path is consequentialist
 */
function isConsequentialistPath(path) {
    if (!path || !path.framework) return false;
    
    const framework = normalizeFrameworkName(path.framework);
    return framework.includes('consequential') || 
           framework.includes('utilitarian');
}

/**
 * Check if a path is based on care ethics
 * @param {Object} path - The reasoning path
 * @returns {boolean} True if the path is care ethics
 */
function isCarePath(path) {
    if (!path || !path.framework) return false;
    
    const framework = normalizeFrameworkName(path.framework);
    return framework.includes('care');
}

/**
 * Check if a path is based on justice ethics
 * @param {Object} path - The reasoning path
 * @returns {boolean} True if the path is justice ethics
 */
function isJusticePath(path) {
    if (!path || !path.framework) return false;
    
    const framework = normalizeFrameworkName(path.framework);
    return framework.includes('justice') || 
           framework.includes('fairness') || 
           framework.includes('rawls');
}

/**
 * Helper function stubs - these would be implemented with actual logic
 */
function extractDuties(path) {
    // Implementation would extract duties from a deontological path
    return { duties: [] };
}

function extractUtilities(path) {
    // Implementation would extract utility calculations from a utilitarian path
    return { utilities: [], welfare: [], calculations: [] };
}

/**
 * Apply deontological constraints to utilitarian calculations
 * @param {Object} utilities - Extracted utility calculations
 * @param {Object} constraints - Extracted deontological constraints
 * @returns {Object} Object containing bounded utilities after applying constraints
 */
function applyConstraints(utilities, constraints) {
    if (!utilities || !constraints) {
        return { boundedUtilities: [], constraintViolations: [], permissibleActions: [] };
    }
    
    const boundedUtilities = [];
    const constraintViolations = [];
    const permissibleActions = [];
    
    // Extract all utility considerations
    const allUtilityConsiderations = [
        ...(utilities.utilities || []),
        ...(utilities.welfare || []),
        ...(utilities.calculations || [])
    ];
    
    // Extract all constraints
    const allConstraints = [
        ...(constraints.constraints || []),
        ...(constraints.duties || []),
        ...(constraints.principles || [])
    ];
    
    // If no utilities or constraints, return empty result
    if (allUtilityConsiderations.length === 0 || allConstraints.length === 0) {
        return { boundedUtilities, constraintViolations, permissibleActions };
    }
    
    // Keywords that indicate potential constraint violations
    const violationKeywords = [
        'violate', 'breach', 'infringe', 'disregard', 'ignore', 'override',
        'sacrifice', 'compromise', 'undermine', 'neglect', 'disrespect'
    ];
    
    // Keywords that indicate permissible actions
    const permissibleKeywords = [
        'permissible', 'allowed', 'acceptable', 'compatible', 'consistent',
        'respect', 'uphold', 'maintain', 'preserve', 'honor', 'align'
    ];
    
    // Check each utility consideration against each constraint
    allUtilityConsiderations.forEach(utility => {
        let isConstrained = false;
        let violatedConstraints = [];
        
        // Check for direct violations
        allConstraints.forEach(constraint => {
            // Check if utility consideration directly violates a constraint
            if (violationKeywords.some(keyword => 
                utility.toLowerCase().includes(keyword) && 
                constraint.toLowerCase().split(' ').some(word => utility.toLowerCase().includes(word))
            )) {
                isConstrained = true;
                violatedConstraints.push(constraint);
                constraintViolations.push(`Utility consideration "${utility}" violates constraint "${constraint}"`);
            }
        });
        
        // If not constrained, check if explicitly permissible
        if (!isConstrained) {
            const isExplicitlyPermissible = allConstraints.some(constraint => 
                permissibleKeywords.some(keyword => 
                    utility.toLowerCase().includes(keyword) && 
                    constraint.toLowerCase().split(' ').some(word => utility.toLowerCase().includes(word))
                )
            );
            
            if (isExplicitlyPermissible) {
                permissibleActions.push(utility);
            }
            
            // Add to bounded utilities if not constrained
            boundedUtilities.push(utility);
        }
    });
    
    // Create a summary of the constraint application
    const summary = {
        totalUtilities: allUtilityConsiderations.length,
        constrainedUtilities: allUtilityConsiderations.length - boundedUtilities.length,
        violationCount: constraintViolations.length,
        permissibleCount: permissibleActions.length,
        boundedUtilitiesCount: boundedUtilities.length
    };
    
    return { 
        boundedUtilities, 
        constraintViolations, 
        permissibleActions,
        summary
    };
}

function extractVirtues(path) {
    // Implementation would extract virtues from a virtue ethics path
    return { virtues: [] };
}

/**
 * Extract consequences from a reasoning path
 * @param {Object} path - The reasoning path to extract consequences from
 * @returns {Object} Object containing extracted consequences and causal graph
 */
function extractConsequences(path) {
    if (!path || !path.argument) {
        return {
            consequences: [],
            causalityScore: 0,
            causalGraph: null
        };
    }

    const schema = ConsequenceSchema;
    const graph = new CausalGraph();
    
    // Extract causal statements from the argument
    const result = detectCausalLanguage(path.argument);
    const causalStatements = result.causalStatements;
    
    // Process each causal statement
    causalStatements.forEach(statement => {
        // Ensure complete statements
        if (!statement.cause || !statement.effect) {
            return;
        }
        
        // Extract metadata with enhanced analysis
        const metadata = {
            consequence: statement.effect,
            type: graph.determineConsequenceType(statement.text),
            timeframe: graph.determineTimeframe(statement.text),
            stakeholders: graph.extractStakeholders(statement.text),
            valence: graph.determineValence(statement.text),
            likelihood: graph.assessLikelihood(statement.confidence, statement.text),
            domain: analyzeDomain(statement.text),
            reversibility: analyzeReversibility(statement.text),
            scope: analyzeScope(statement.text),
            intensity: analyzeIntensity(statement.text)
        };
        
        // Add to causal graph with complete metadata
        graph.addCausalRelation(
            path.action,
            metadata.consequence,
            statement.confidence,
            statement.text,
            metadata.stakeholders,
            {
                type: metadata.type,
                timeframe: metadata.timeframe,
                valence: metadata.valence,
                domain: metadata.domain,
                reversibility: metadata.reversibility,
                scope: metadata.scope,
                intensity: metadata.intensity,
                likelihood: metadata.likelihood
            }
        );
    });
    
    // Get all consequences from the graph
    const consequences = graph.getConsequences(path.action);
    
    // Enhanced analysis
    const typeAnalysis = analyzeTypes(consequences, schema);
    const timeframeAnalysis = analyzeTimeframes(consequences, schema);
    const stakeholderAnalysis = graph.identifyKeyStakeholders(path.action);
    const impactAnalysis = analyzeImpact(consequences);
    
    return {
        consequences,
        typeAnalysis,
        timeframeAnalysis,
        stakeholderAnalysis,
        impactAnalysis,
        causalGraph: graph,
        causalityScore: calculateCausalityScore(causalStatements)
    };
}

function analyzeDomain(text) {
    const domains = {
        medical: /medical|health|clinical|patient|treatment|diagnosis|care/i,
        social: /social|community|public|society|cultural|demographic/i,
        rights: /right|freedom|liberty|privacy|autonomy|dignity|justice/i,
        institutional: /institution|system|process|organization|structure/i,
        technical: /technical|technology|implement|algorithm|software|hardware/i,
        legal: /legal|law|regulation|compliance|policy|rule/i,
        economic: /economic|financial|cost|market|business|trade/i,
        environmental: /environment|climate|ecological|sustainable|nature/i
    };
    
    for (const [domain, pattern] of Object.entries(domains)) {
        if (pattern.test(text)) {
            return domain;
        }
    }
    return 'general';
}

function analyzeReversibility(text) {
    if (/permanent|irreversible|cannot be undone|irrevocable/i.test(text)) {
        return {
            type: 'irreversible',
            confidence: 0.9,
            description: 'Explicitly stated as permanent/irreversible'
        };
    }
    if (/temporary|reversible|can be undone|revocable/i.test(text)) {
        return {
            type: 'reversible',
            confidence: 0.9,
            description: 'Explicitly stated as temporary/reversible'
        };
    }
    if (/structural|fundamental|systemic/i.test(text)) {
        return {
            type: 'irreversible',
            confidence: 0.7,
            description: 'Inferred from structural/systemic nature'
        };
    }
    return {
        type: 'unknown',
        confidence: 0.5,
        description: 'No clear reversibility indicators'
    };
}

function analyzeScope(text) {
    if (/global|worldwide|universal|all|everyone/i.test(text)) {
        return {
            level: 'global',
            confidence: 0.9,
            description: 'Global/universal impact'
        };
    }
    if (/national|country|society-wide/i.test(text)) {
        return {
            level: 'national',
            confidence: 0.8,
            description: 'National/societal impact'
        };
    }
    if (/local|community|regional/i.test(text)) {
        return {
            level: 'local',
            confidence: 0.8,
            description: 'Local/community impact'
        };
    }
    if (/individual|personal|specific person/i.test(text)) {
        return {
            level: 'individual',
            confidence: 0.8,
            description: 'Individual/personal impact'
        };
    }
    return {
        level: 'unknown',
        confidence: 0.5,
        description: 'No clear scope indicators'
    };
}

function analyzeIntensity(text) {
    if (/severe|extreme|significant|major|critical/i.test(text)) {
        return {
            level: 'high',
            confidence: 0.8,
            description: 'High intensity impact'
        };
    }
    if (/moderate|medium|average/i.test(text)) {
        return {
            level: 'medium',
            confidence: 0.7,
            description: 'Medium intensity impact'
        };
    }
    if (/minor|minimal|slight|small/i.test(text)) {
        return {
            level: 'low',
            confidence: 0.7,
            description: 'Low intensity impact'
        };
    }
    return {
        level: 'unknown',
        confidence: 0.5,
        description: 'No clear intensity indicators'
    };
}

function analyzeImpact(consequences) {
    return consequences.map(consequence => ({
        consequence: consequence.consequence,
        impact: {
            intensity: consequence.intensity || analyzeIntensity(consequence.text),
            scope: consequence.scope || analyzeScope(consequence.text),
            timeframe: consequence.timeframe,
            stakeholders: consequence.stakeholders,
            reversibility: consequence.reversibility,
            confidence: consequence.confidence
        }
    }));
}

/**
 * Perform stakeholder impact analysis
 * @param {Array} consequences - Array of consequence objects
 * @returns {Object} Stakeholder impact analysis
 */
function performStakeholderAnalysis(consequences) {
    if (!consequences || consequences.length === 0) {
        return { stakeholders: [] };
    }
    
    // Collect all stakeholders and their impacts
    const stakeholderMap = {};
    
    for (const consequence of consequences) {
        const stakeholders = consequence.stakeholders || [];
        
        for (const stakeholderId of stakeholders) {
            if (!stakeholderMap[stakeholderId]) {
                stakeholderMap[stakeholderId] = {
                    id: stakeholderId,
                    consequences: [],
                    positiveImpacts: 0,
                    negativeImpacts: 0,
                    mixedImpacts: 0,
                    neutralImpacts: 0,
                    totalImpacts: 0,
                    averageSeverity: 0
                };
            }
            
            // Add consequence to stakeholder
            stakeholderMap[stakeholderId].consequences.push({
                description: consequence.description,
                type: consequence.type,
                timeframe: consequence.timeframe,
                severity: consequence.severity,
                likelihood: consequence.likelihood,
                valence: consequence.valence
            });
            
            // Update impact counts
            stakeholderMap[stakeholderId].totalImpacts++;
            
            if (consequence.valence === 'positive') {
                stakeholderMap[stakeholderId].positiveImpacts++;
            } else if (consequence.valence === 'negative') {
                stakeholderMap[stakeholderId].negativeImpacts++;
            } else if (consequence.valence === 'mixed') {
                stakeholderMap[stakeholderId].mixedImpacts++;
            } else {
                stakeholderMap[stakeholderId].neutralImpacts++;
            }
        }
    }
    
    // Calculate average severity and overall impact for each stakeholder
    const stakeholders = Object.values(stakeholderMap).map(stakeholder => {
        // Calculate average severity
        const totalSeverity = stakeholder.consequences.reduce(
            (sum, consequence) => sum + (consequence.severity || 0), 
            0
        );
        
        stakeholder.averageSeverity = stakeholder.consequences.length > 0 
            ? totalSeverity / stakeholder.consequences.length 
            : 0;
        
        // Determine overall impact
        if (stakeholder.positiveImpacts > stakeholder.negativeImpacts) {
            stakeholder.overallImpact = 'positive';
        } else if (stakeholder.negativeImpacts > stakeholder.positiveImpacts) {
            stakeholder.overallImpact = 'negative';
        } else if (stakeholder.mixedImpacts > 0) {
            stakeholder.overallImpact = 'mixed';
        } else {
            stakeholder.overallImpact = 'neutral';
        }
        
        return stakeholder;
    });
    
    // Sort stakeholders by impact count (most impacted first)
    stakeholders.sort((a, b) => b.totalImpacts - a.totalImpacts);
    
    return {
        stakeholders,
        totalStakeholders: stakeholders.length,
        mostImpacted: stakeholders.length > 0 ? stakeholders[0].id : null,
        mostPositivelyImpacted: [...stakeholders].sort((a, b) => b.positiveImpacts - a.positiveImpacts)[0]?.id || null,
        mostNegativelyImpacted: [...stakeholders].sort((a, b) => b.negativeImpacts - a.negativeImpacts)[0]?.id || null
    };
}

/**
 * Analyze timeframes of consequences (basic version)
 * @param {Array} consequences - Array of consequence objects
 * @returns {Object} Timeframe analysis
 */
function analyzeTimeframesBasic(consequences) {
    if (!consequences || consequences.length === 0) {
        return { timeframes: {} };
    }
    
    // Count consequences by timeframe
    const timeframeCounts = {
        immediate: 0,
        'short-term': 0,
        'medium-term': 0,
        'long-term': 0,
        unknown: 0
    };
    
    // Collect consequences by timeframe
    const consequencesByTimeframe = {
        immediate: [],
        'short-term': [],
        'medium-term': [],
        'long-term': [],
        unknown: []
    };
    
    for (const consequence of consequences) {
        const timeframe = consequence.timeframe || 'unknown';
        
        // Increment count
        timeframeCounts[timeframe] = (timeframeCounts[timeframe] || 0) + 1;
        
        // Add to collection
        if (!consequencesByTimeframe[timeframe]) {
            consequencesByTimeframe[timeframe] = [];
        }
        
        consequencesByTimeframe[timeframe].push({
            description: consequence.description,
            severity: consequence.severity,
            likelihood: consequence.likelihood,
            valence: consequence.valence
        });
    }
    
    // Calculate average severity by timeframe
    const severityByTimeframe = {};
    
    for (const [timeframe, timeframeConsequences] of Object.entries(consequencesByTimeframe)) {
        if (timeframeConsequences.length > 0) {
            const totalSeverity = timeframeConsequences.reduce(
                (sum, consequence) => sum + (consequence.severity || 0), 
                0
            );
            
            severityByTimeframe[timeframe] = totalSeverity / timeframeConsequences.length;
        } else {
            severityByTimeframe[timeframe] = 0;
        }
    }
    
    // Determine dominant timeframe
    let dominantTimeframe = 'unknown';
    let maxCount = 0;
    
    for (const [timeframe, count] of Object.entries(timeframeCounts)) {
        if (timeframe !== 'unknown' && count > maxCount) {
            dominantTimeframe = timeframe;
            maxCount = count;
        }
    }
    
    return {
        timeframeCounts,
        severityByTimeframe,
        dominantTimeframe,
        consequencesByTimeframe
    };
}

/**
 * Analyze consequence types
 * @param {Array} consequences - Array of consequence objects
 * @returns {Object} Consequence type analysis
 */
function analyzeConsequenceTypes(consequences) {
    if (!consequences || consequences.length === 0) {
        return { types: {} };
    }
    
    // Count consequences by type
    const typeCounts = {
        economic: 0,
        social: 0,
        health: 0,
        environmental: 0,
        rights: 0,
        security: 0,
        general: 0,
        unknown: 0
    };
    
    // Collect consequences by type
    const consequencesByType = {
        economic: [],
        social: [],
        health: [],
        environmental: [],
        rights: [],
        security: [],
        general: [],
        unknown: []
    };
    
    for (const consequence of consequences) {
        const type = consequence.type || 'unknown';
        
        // Increment count
        typeCounts[type] = (typeCounts[type] || 0) + 1;
        
        // Add to collection
        if (!consequencesByType[type]) {
            consequencesByType[type] = [];
        }
        
        consequencesByType[type].push({
            description: consequence.description,
            severity: consequence.severity,
            likelihood: consequence.likelihood,
            valence: consequence.valence,
            timeframe: consequence.timeframe
        });
    }
    
    // Calculate average severity by type
    const severityByType = {};
    
    for (const [type, typeConsequences] of Object.entries(consequencesByType)) {
        if (typeConsequences.length > 0) {
            const totalSeverity = typeConsequences.reduce(
                (sum, consequence) => sum + (consequence.severity || 0), 
                0
            );
            
            severityByType[type] = totalSeverity / typeConsequences.length;
        } else {
            severityByType[type] = 0;
        }
    }
    
    // Determine dominant type
    let dominantType = 'unknown';
    let maxCount = 0;
    
    for (const [type, count] of Object.entries(typeCounts)) {
        if (type !== 'unknown' && type !== 'general' && count > maxCount) {
            dominantType = type;
            maxCount = count;
        }
    }
    
    return {
        typeCounts,
        severityByType,
        dominantType,
        consequencesByType
    };
}

/**
 * Deduplicate consequences based on description similarity
 * @param {Array} consequences - Array of consequence objects
 * @returns {Array} Deduplicated array of consequences
 */
function deduplicateConsequences(consequences) {
    if (!consequences || consequences.length === 0) {
        return [];
    }
    
    const uniqueConsequences = [];
    const descriptions = new Set();
    
    for (const consequence of consequences) {
        // Simple deduplication based on exact description match
        if (!descriptions.has(consequence.description)) {
            descriptions.add(consequence.description);
            uniqueConsequences.push(consequence);
        }
    }
    
    return uniqueConsequences;
}

function extractCareConsiderations(path) {
    // Implementation would extract care considerations from a care ethics path
    if (!path || !path.argument) {
        return { 
            careConsiderations: [], 
            relationships: [], 
            contextual: [], 
            empathy: [] 
        };
    }
    
    const careConsiderations = [];
    const relationships = [];
    const contextual = [];
    const empathy = [];
    
    // Extract text from the path's argument
    const text = path.argument || '';
    
    // Keywords that indicate care considerations
    const careKeywords = [
        'care', 'caring', 'attentiveness', 'responsiveness', 'responsibility',
        'compassion', 'empathy', 'sympathy', 'concern', 'nurture', 'support'
    ];
    
    // Keywords that indicate relationship considerations
    const relationshipKeywords = [
        'relationship', 'connection', 'interdependence', 'bond', 'attachment',
        'network', 'community', 'family', 'friend', 'loved one', 'interpersonal'
    ];
    
    // Keywords that indicate contextual considerations
    const contextualKeywords = [
        'context', 'situation', 'circumstance', 'particular', 'specific',
        'concrete', 'unique', 'individual', 'personal', 'detail'
    ];
    
    // Keywords that indicate empathy considerations
    const empathyKeywords = [
        'empathy', 'empathic', 'empathize', 'understand', 'perspective',
        'feeling', 'emotion', 'sentiment', 'compassion', 'sympathy'
    ];
    
    // Split text into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Process each sentence
    sentences.forEach(sentence => {
        const lowerSentence = sentence.toLowerCase();
        
        // Check for care considerations
        if (careKeywords.some(keyword => lowerSentence.includes(keyword))) {
            careConsiderations.push(sentence.trim());
        }
        
        // Check for relationship considerations
        if (relationshipKeywords.some(keyword => lowerSentence.includes(keyword))) {
            relationships.push(sentence.trim());
        }
        
        // Check for contextual considerations
        if (contextualKeywords.some(keyword => lowerSentence.includes(keyword))) {
            contextual.push(sentence.trim());
        }
        
        // Check for empathy considerations
        if (empathyKeywords.some(keyword => lowerSentence.includes(keyword))) {
            empathy.push(sentence.trim());
        }
    });
    
    // Create a summary of the extraction
    const summary = {
        totalCareConsiderations: careConsiderations.length,
        totalRelationships: relationships.length,
        totalContextual: contextual.length,
        totalEmpathy: empathy.length
    };
    
    return { 
        careConsiderations, 
        relationships, 
        contextual, 
        empathy,
        summary
    };
}

function extractJusticePrinciples(path) {
    // Implementation would extract justice principles from a justice-based path
    if (!path || !path.argument) {
        return { 
            justicePrinciples: [], 
            fairness: [], 
            rights: [], 
            equality: [] 
        };
    }
    
    const justicePrinciples = [];
    const fairness = [];
    const rights = [];
    const equality = [];
    
    // Extract text from the path's argument
    const text = path.argument || '';
    
    // Keywords that indicate justice principles
    const justiceKeywords = [
        'justice', 'just', 'fairness', 'fair', 'impartial', 'impartiality',
        'equitable', 'equity', 'desert', 'merit', 'due', 'rightful'
    ];
    
    // Keywords that indicate fairness considerations
    const fairnessKeywords = [
        'fairness', 'fair', 'unfair', 'bias', 'impartial', 'neutral',
        'objective', 'balanced', 'reasonable', 'proportional', 'appropriate'
    ];
    
    // Keywords that indicate rights considerations
    const rightsKeywords = [
        'right', 'rights', 'entitlement', 'claim', 'liberty', 'freedom',
        'autonomy', 'dignity', 'respect', 'protection', 'guarantee'
    ];
    
    // Keywords that indicate equality considerations
    const equalityKeywords = [
        'equality', 'equal', 'inequality', 'unequal', 'parity', 'equivalence',
        'sameness', 'uniformity', 'consistency', 'egalitarian', 'equitable'
    ];
    
    // Split text into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Process each sentence
    sentences.forEach(sentence => {
        const lowerSentence = sentence.toLowerCase();
        
        // Check for justice principles
        if (justiceKeywords.some(keyword => lowerSentence.includes(keyword))) {
            justicePrinciples.push(sentence.trim());
        }
        
        // Check for fairness considerations
        if (fairnessKeywords.some(keyword => lowerSentence.includes(keyword))) {
            fairness.push(sentence.trim());
        }
        
        // Check for rights considerations
        if (rightsKeywords.some(keyword => lowerSentence.includes(keyword))) {
            rights.push(sentence.trim());
        }
        
        // Check for equality considerations
        if (equalityKeywords.some(keyword => lowerSentence.includes(keyword))) {
            equality.push(sentence.trim());
        }
    });
    
    // Create a summary of the extraction
    const summary = {
        totalJusticePrinciples: justicePrinciples.length,
        totalFairness: fairness.length,
        totalRights: rights.length,
        totalEquality: equality.length
    };
    
    return { 
        justicePrinciples, 
        fairness, 
        rights, 
        equality,
        summary
    };
}

/**
 * Integrate care considerations with justice principles
 * @param {Object} careConsiderations - Extracted care considerations
 * @param {Object} justicePrinciples - Extracted justice principles
 * @returns {Object} Object containing integrated principles
 */
function integrateCarePrinciples(careConsiderations, justicePrinciples) {
    if (!careConsiderations || !justicePrinciples) {
        return { 
            integratedPrinciples: [], 
            enhancedJusticePrinciples: [], 
            contextualizedRights: [] 
        };
    }
    
    const integratedPrinciples = [];
    const enhancedJusticePrinciples = [];
    const contextualizedRights = [];
    
    // Extract all care considerations
    const allCareConsiderations = [
        ...(careConsiderations.careConsiderations || []),
        ...(careConsiderations.relationships || []),
        ...(careConsiderations.contextual || [])
    ];
    
    // Extract all justice principles
    const allJusticePrinciples = [
        ...(justicePrinciples.justicePrinciples || []),
        ...(justicePrinciples.fairness || [])
    ];
    
    // Extract rights considerations separately
    const allRights = justicePrinciples.rights || [];
    
    // If no care considerations or justice principles, return empty result
    if (allCareConsiderations.length === 0 || 
        (allJusticePrinciples.length === 0 && allRights.length === 0)) {
        return { 
            integratedPrinciples, 
            enhancedJusticePrinciples, 
            contextualizedRights 
        };
    }
    
    // Keywords that indicate potential integration points
    const integrationKeywords = [
        'relationship', 'context', 'care', 'need', 'vulnerability',
        'connection', 'interdependence', 'responsibility', 'attentiveness'
    ];
    
    // Keywords that indicate justice concepts
    const justiceKeywords = [
        'justice', 'fairness', 'equality', 'rights', 'impartiality',
        'distribution', 'desert', 'merit', 'entitlement'
    ];
    
    // Integrate care considerations with justice principles
    allJusticePrinciples.forEach(principle => {
        const lowerPrinciple = principle.toLowerCase();
        
        // Find relevant care considerations for this principle
        const relevantCareConsiderations = allCareConsiderations.filter(care => {
            const lowerCare = care.toLowerCase();
            
            // Check if care consideration shares keywords with principle
            return integrationKeywords.some(keyword => lowerCare.includes(keyword)) &&
                   justiceKeywords.some(keyword => lowerPrinciple.includes(keyword));
        });
        
        if (relevantCareConsiderations.length > 0) {
            // Create enhanced justice principle
            const enhancedPrinciple = {
                originalPrinciple: principle,
                careConsiderations: relevantCareConsiderations,
                enhancedFormulation: `${principle} (Enhanced with care considerations: ${relevantCareConsiderations.map(c => `"${c}"`).join(', ')})`
            };
            
            enhancedJusticePrinciples.push(enhancedPrinciple);
            integratedPrinciples.push(enhancedPrinciple.enhancedFormulation);
        } else {
            // If no relevant care considerations, still include the original principle
            integratedPrinciples.push(principle);
        }
    });
    
    // Contextualize rights with care considerations
    allRights.forEach(right => {
        const lowerRight = right.toLowerCase();
        
        // Find relevant care considerations for this right
        const relevantCareConsiderations = allCareConsiderations.filter(care => {
            const lowerCare = care.toLowerCase();
            
            // Check if care consideration is relevant to this right
            return integrationKeywords.some(keyword => lowerCare.includes(keyword)) &&
                   lowerRight.includes('right');
        });
        
        if (relevantCareConsiderations.length > 0) {
            // Create contextualized right
            const contextualizedRight = {
                originalRight: right,
                careConsiderations: relevantCareConsiderations,
                contextualizedFormulation: `${right} (Contextualized with care considerations: ${relevantCareConsiderations.map(c => `"${c}"`).join(', ')})`
            };
            
            contextualizedRights.push(contextualizedRight);
            integratedPrinciples.push(contextualizedRight.contextualizedFormulation);
        } else {
            // If no relevant care considerations, still include the original right
            integratedPrinciples.push(right);
        }
    });
    
    // Add care considerations that weren't integrated
    const integratedCareTexts = [
        ...enhancedJusticePrinciples.flatMap(p => p.careConsiderations),
        ...contextualizedRights.flatMap(r => r.careConsiderations)
    ];
    
    const nonIntegratedCare = allCareConsiderations.filter(care => 
        !integratedCareTexts.includes(care)
    );
    
    // Add non-integrated care considerations as standalone principles
    nonIntegratedCare.forEach(care => {
        integratedPrinciples.push(`Care consideration (standalone): ${care}`);
    });
    
    // Create a summary of the integration
    const summary = {
        totalJusticePrinciples: allJusticePrinciples.length,
        totalRights: allRights.length,
        totalCareConsiderations: allCareConsiderations.length,
        enhancedPrinciples: enhancedJusticePrinciples.length,
        contextualizedRights: contextualizedRights.length,
        nonIntegratedCare: nonIntegratedCare.length,
        integratedPrinciplesCount: integratedPrinciples.length
    };
    
    return { 
        integratedPrinciples, 
        enhancedJusticePrinciples, 
        contextualizedRights,
        nonIntegratedCare,
        summary
    };
}

/**
 * Evaluate consequences through the lens of virtues
 * @param {Array} consequences - Array of consequence objects
 * @param {Array} virtues - Array of virtue objects
 * @returns {Object} Evaluation results
 */
function evaluateConsequencesWithVirtues(consequences, virtues) {
    if (!consequences || !Array.isArray(consequences) || consequences.length === 0) {
        return { alignments: [], conflicts: [] };
    }
    
    if (!virtues || !Array.isArray(virtues) || virtues.length === 0) {
        return { alignments: [], conflicts: [] };
    }
    
    const alignments = [];
    const conflicts = [];
    
    // For each consequence, check alignment with each virtue
    for (const consequence of consequences) {
        for (const virtue of virtues) {
            // Check if consequence aligns with virtue
            const alignment = checkVirtueAlignment(consequence, virtue);
            
            if (alignment.aligned) {
                alignments.push({
                    consequence: consequence.description,
                    virtue: virtue.name,
                    reason: alignment.reason
                });
            } else if (alignment.conflicted) {
                conflicts.push({
                    consequence: consequence.description,
                    virtue: virtue.name,
                    reason: alignment.reason
                });
            }
        }
    }
    
    return {
        alignments,
        conflicts,
        summary: generateVirtueEvaluationSummary(alignments, conflicts)
    };
}

/**
 * Check if a consequence aligns with a virtue
 * @param {Object} consequence - Consequence object
 * @param {Object} virtue - Virtue object
 * @returns {Object} Alignment result
 */
function checkVirtueAlignment(consequence, virtue) {
    // Default result
    const result = {
        aligned: false,
        conflicted: false,
        reason: ''
    };
    
    // Simple keyword matching for demonstration
    // In a real implementation, this would use more sophisticated NLP
    const virtueKeywords = {
        'honesty': ['truth', 'honest', 'transparent', 'openness'],
        'compassion': ['care', 'empathy', 'kindness', 'support', 'help'],
        'justice': ['fair', 'equitable', 'rights', 'equality'],
        'courage': ['brave', 'stand up', 'risk', 'face danger'],
        'temperance': ['moderation', 'restraint', 'balance', 'self-control'],
        'wisdom': ['knowledge', 'understanding', 'insight', 'judgment'],
        'integrity': ['principle', 'moral', 'ethical', 'consistent']
    };
    
    // Get keywords for this virtue
    const keywords = virtueKeywords[virtue.name.toLowerCase()] || [];
    
    // Check if consequence description contains any virtue keywords
    const containsKeyword = keywords.some(keyword => 
        consequence.description.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Check if consequence valence aligns with virtue
    // Positive consequences generally align with virtues
    if (containsKeyword && consequence.valence === 'positive') {
        result.aligned = true;
        result.reason = `The ${consequence.valence} consequence "${consequence.description}" aligns with the virtue of ${virtue.name}`;
    } 
    // Negative consequences generally conflict with virtues
    else if (containsKeyword && consequence.valence === 'negative') {
        result.conflicted = true;
        result.reason = `The ${consequence.valence} consequence "${consequence.description}" conflicts with the virtue of ${virtue.name}`;
    }
    
    return result;
}

/**
 * Generate a summary of virtue evaluation
 * @param {Array} alignments - Array of alignments
 * @param {Array} conflicts - Array of conflicts
 * @returns {string} Summary text
 */
function generateVirtueEvaluationSummary(alignments, conflicts) {
    if (alignments.length === 0 && conflicts.length === 0) {
        return "No clear virtue alignments or conflicts identified.";
    }
    
    let summary = "";
    
    if (alignments.length > 0) {
        summary += `Found ${alignments.length} virtue alignments. `;
        
        // Group by virtue
        const virtueGroups = {};
        for (const alignment of alignments) {
            if (!virtueGroups[alignment.virtue]) {
                virtueGroups[alignment.virtue] = [];
            }
            virtueGroups[alignment.virtue].push(alignment);
        }
        
        // Summarize by virtue
        for (const [virtue, alignmentGroup] of Object.entries(virtueGroups)) {
            summary += `${virtue}: ${alignmentGroup.length} aligned consequences. `;
        }
    }
    
    if (conflicts.length > 0) {
        summary += `Found ${conflicts.length} virtue conflicts. `;
        
        // Group by virtue
        const virtueGroups = {};
        for (const conflict of conflicts) {
            if (!virtueGroups[conflict.virtue]) {
                virtueGroups[conflict.virtue] = [];
            }
            virtueGroups[conflict.virtue].push(conflict);
        }
        
        // Summarize by virtue
        for (const [virtue, conflictGroup] of Object.entries(virtueGroups)) {
            summary += `${virtue}: ${conflictGroup.length} conflicting consequences. `;
        }
    }
    
    return summary;
}

function createFallbackHybrid(path1, path2, hybridName, description) {
    // Use whatever paths we have
    const firstPath = path1 || { framework: "Unknown Framework", action: "Unspecified action" };
    const secondPath = path2 || { framework: "Alternative Framework", action: "Alternative action" };
    
    const fw1 = firstPath.framework || "Unknown Framework";
    const fw2 = secondPath.framework || "Alternative Framework";
    
    // Create argument text
    const argumentText = `
This ${hybridName} approach attempts to resolve ethical conflicts by ${description}

Due to the nature of the frameworks involved (${fw1} and ${fw2}), a standard hybrid implementation is being adapted.

This hybrid approach recognizes that ethical assessment benefits from drawing on multiple traditions and perspectives rather than relying on a single framework.
`.trim();
    
    // Create a new hybrid path
    return {
        id: `hybrid-fallback-${Date.now()}`,
        framework: `Hybrid: ${hybridName}`,
        action: firstPath.action || secondPath.action || "Unspecified action",
        strength: Math.max(firstPath.strength || 0.7, secondPath.strength || 0.7),
        argument: argumentText,
        conclusion: `The ${hybridName} approach suggests a nuanced ethical assessment that draws from multiple traditions.`,
        original_paths: [firstPath, secondPath]
    };
}

function analyzeStatement(text, schema) {
    const defaultValues = schema.getDefaultValues();
    const metadata = { ...defaultValues };
    
    // Detect type
    if (/outcome|result|effect|impact/i.test(text)) {
        metadata.type = 'outcome';
    } else if (/fair|equal|equit|justice/i.test(text)) {
        metadata.type = 'equity';
    } else if (/right|freedom|liberty|privacy/i.test(text)) {
        metadata.type = 'rights';
    } else if (/institution|system|process|organization/i.test(text)) {
        metadata.type = 'institutional';
    } else if (/social|community|public|society/i.test(text)) {
        metadata.type = 'social';
    } else if (/medical|health|clinical|patient/i.test(text)) {
        metadata.type = 'medical';
    } else if (/moral|ethic|value|principle/i.test(text)) {
        metadata.type = 'ethical';
    }
    
    // Detect timeframe
    if (/immediate|instantly|directly/i.test(text)) {
        metadata.timeframe = 'immediate';
    } else if (/short[- ]term|soon|quickly/i.test(text)) {
        metadata.timeframe = 'short-term';
    } else if (/medium[- ]term|months|year/i.test(text)) {
        metadata.timeframe = 'medium-term';
    } else if (/long[- ]term|years|permanent|lasting/i.test(text)) {
        metadata.timeframe = 'long-term';
    }
    
    // Detect valence
    if (/benefit|improve|enhance|positive|better/i.test(text)) {
        metadata.valence = 'positive';
    } else if (/harm|damage|worsen|negative|worse/i.test(text)) {
        metadata.valence = 'negative';
    } else if (/mixed|both|while|however|but/i.test(text)) {
        metadata.valence = 'mixed';
    }
    
    // Detect domain
    if (/medical|health|clinical|patient/i.test(text)) {
        metadata.domain = 'medical';
    } else if (/social|community|public|society/i.test(text)) {
        metadata.domain = 'social';
    } else if (/right|freedom|liberty|privacy/i.test(text)) {
        metadata.domain = 'rights';
    } else if (/institution|system|process/i.test(text)) {
        metadata.domain = 'institutional';
    } else if (/technical|implement|algorithm/i.test(text)) {
        metadata.domain = 'technical';
    } else if (/legal|law|regulation|compliance/i.test(text)) {
        metadata.domain = 'legal';
    }
    
    // Detect reversibility
    if (/permanent|irreversible|cannot be undone/i.test(text)) {
        metadata.reversibility = 'irreversible';
    } else if (/temporary|reversible|can be undone/i.test(text)) {
        metadata.reversibility = 'reversible';
    }
    
    // Extract consequence
    metadata.consequence = text.replace(/^.*?(leads to|results in|causes|enables|allows|therefore|thus|consequently|hence|so)\s+/i, '');
    
    // Identify stakeholders
    metadata.stakeholders = extractStakeholders(text);
    
    return metadata;
}

function extractStakeholders(text) {
    const stakeholders = [];
    
    // Look for stakeholder mentions
    const patterns = [
        { regex: /patient|individual|person/i, id: 'patients', category: 'direct' },
        { regex: /medical staff|healthcare worker|doctor|nurse/i, id: 'medical_staff', category: 'direct' },
        { regex: /disadvantaged|vulnerable|underserved/i, id: 'vulnerable_groups', category: 'vulnerable' },
        { regex: /public|community|society/i, id: 'general_public', category: 'public' },
        { regex: /institution|system|hospital/i, id: 'healthcare_system', category: 'system' },
        { regex: /regulator|authority|government/i, id: 'regulators', category: 'governance' }
    ];
    
    patterns.forEach(pattern => {
        if (pattern.regex.test(text)) {
            stakeholders.push({
                id: pattern.id,
                category: pattern.category,
                impact: determineImpact(text)
            });
        }
    });
    
    return stakeholders;
}

function determineImpact(text) {
    if (/benefit|improve|enhance|positive|better/i.test(text)) {
        return 'positive';
    } else if (/harm|damage|worsen|negative|worse/i.test(text)) {
        return 'negative';
    } else if (/mixed|both|while|however|but/i.test(text)) {
        return 'mixed';
    }
    return 'neutral';
}

function analyzeTypes(consequences, schema) {
    const typeCounts = {};
    const severityByType = {};
    
    schema.types.forEach(type => {
        typeCounts[type] = 0;
        severityByType[type] = 0;
    });
    
    consequences.forEach(consequence => {
        if (consequence.type && typeCounts[consequence.type] !== undefined) {
            typeCounts[consequence.type]++;
            severityByType[consequence.type] += consequence.severity || 0;
        }
    });
    
    // Calculate average severity for each type
    Object.keys(severityByType).forEach(type => {
        if (typeCounts[type] > 0) {
            severityByType[type] /= typeCounts[type];
        }
    });
    
    // Find dominant type
    const dominantType = Object.entries(typeCounts)
        .reduce((a, b) => (b[1] > a[1] ? b : a))[0];
    
    return {
        typeCounts,
        severityByType,
        dominantType
    };
}

function analyzeTimeframes(consequences, schema) {
    const timeframeCounts = {};
    const severityByTimeframe = {};
    
    schema.timeframes.forEach(timeframe => {
        timeframeCounts[timeframe] = 0;
        severityByTimeframe[timeframe] = 0;
    });
    
    consequences.forEach(consequence => {
        if (consequence.timeframe && timeframeCounts[consequence.timeframe] !== undefined) {
            timeframeCounts[consequence.timeframe]++;
            severityByTimeframe[consequence.timeframe] += consequence.severity || 0;
        }
    });
    
    // Calculate average severity for each timeframe
    Object.keys(severityByTimeframe).forEach(timeframe => {
        if (timeframeCounts[timeframe] > 0) {
            severityByTimeframe[timeframe] /= timeframeCounts[timeframe];
        }
    });
    
    // Find dominant timeframe
    const dominantTimeframe = Object.entries(timeframeCounts)
        .reduce((a, b) => (b[1] > a[1] ? b : a))[0];
    
    return {
        timeframeCounts,
        severityByTimeframe,
        dominantTimeframe
    };
}

function calculateCausalityScore(causalStatements) {
    if (!causalStatements.length) return 0;
    
    // Average confidence across all statements
    const averageConfidence = causalStatements.reduce((sum, statement) => 
        sum + statement.confidence, 0) / causalStatements.length;
    
    // Adjust based on number of statements
    const coverageBonus = Math.min(causalStatements.length / 10, 0.5);
    
    return Math.min(averageConfidence + coverageBonus, 1.0);
}

/**
 * Generate nuanced medical recommendation based on two competing approaches
 * @param {string} primaryAction - The primary recommended action
 * @param {string} secondaryAction - The secondary/alternative action
 * @param {number} nuanceRatio - Number between 0-1 indicating how nuanced (1=fully balanced)
 * @param {Object} dilemma - The dilemma context
 * @returns {Object} Nuanced recommendation object
 */
function generateNuancedMedicalRecommendation(primaryAction, secondaryAction, nuanceRatio, dilemma) {
  // Convert binary actions to nuanced hybrid approach
  
  // Skip if not in medical domain
  if (!isMedicalDomain(dilemma)) {
    return {
      action: primaryAction,
      isNuanced: false,
      reasoning: "Standard binary recommendation for non-medical context"
    };
  }
  
  // Don't create nuance if the actions are the same
  if (primaryAction === secondaryAction) {
    return {
      action: primaryAction,
      isNuanced: false,
      reasoning: "No competing actions to balance"
    };
  }
  
  // Create standard hybrid mapping for common medical actions
  const hybridMappings = {
    // Format: [action1, action2] -> hybridAction
    ["approve_option_a|negotiate_compromises"]: "phased_approval", 
    ["negotiate_compromises|approve_option_a"]: "phased_approval",
    
    ["approve_option_a|approve_option_b"]: "conditional_treatment",
    ["approve_option_b|approve_option_a"]: "conditional_treatment",
    
    ["approve_option_a|gather_more_information"]: "approval_with_monitoring",
    ["gather_more_information|approve_option_a"]: "approval_with_monitoring",
    
    ["extend_treatment|withhold_treatment"]: "partial_treatment",
    ["withhold_treatment|extend_treatment"]: "partial_treatment",
    
    ["extend_resources|limited_resources"]: "tiered_resource_allocation",
    ["limited_resources|extend_resources"]: "tiered_resource_allocation"
  };
  
  // Check if we have a predefined mapping
  const actionPair = `${primaryAction}|${secondaryAction}`;
  let hybridAction = hybridMappings[actionPair];
  
  // If no predefined mapping, create a generic hybrid
  if (!hybridAction) {
    hybridAction = `balanced_${primaryAction}_with_${secondaryAction}`;
  }
  
  // Generate detailed reasoning for the hybrid approach
  let reasoning = "";
  
  switch (hybridAction) {
    case "phased_approval":
      reasoning = "A staged approach that begins with conditional approval while incorporating negotiated safeguards and monitoring protocols. This balances immediate needs with ethical safeguards.";
      break;
    case "conditional_treatment":
      reasoning = "Treatment is approved with specific conditions that must be met throughout the process. This incorporates elements of both treatment options with appropriate risk management.";
      break;
    case "approval_with_monitoring":
      reasoning = "Proceed with treatment while implementing a robust monitoring system to gather additional data and adjust the approach if needed. This balances immediate action with ongoing information gathering.";
      break;
    case "partial_treatment":
      reasoning = "Provide limited treatment while reserving full intervention, creating a middle path that respects resource constraints while providing essential care.";
      break;
    case "tiered_resource_allocation":
      reasoning = "Implement a multi-tiered resource allocation system with priority categories based on clinical need, creating a balanced approach between full resource extension and severe limitations.";
      break;
    default:
      reasoning = `A balanced approach that primarily follows ${primaryAction} while incorporating elements of ${secondaryAction} where appropriate. This nuanced approach better addresses the complex medical context.`;
  }
  
  // Create the nuanced recommendation
  return {
    action: hybridAction,
    primaryAction: primaryAction,
    secondaryAction: secondaryAction,
    nuanceRatio: nuanceRatio,
    isNuanced: true,
    reasoning: reasoning,
    medicalContext: true
  };
}

/**
 * Check if a dilemma is in the medical domain
 * @param {Object} dilemma - The dilemma to check
 * @returns {boolean} - Whether this is a medical dilemma
 */
function isMedicalDomain(dilemma) {
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

export {
    applyDutyBoundedUtilitarianism,
    applyVirtueGuidedConsequentialism,
    applyCareBasedJustice,
    isDeonPath,
    isUtilPath,
    isVirtuePath,
    isConsequentialistPath,
    isCarePath,
    isJusticePath,
    extractDuties,
    extractUtilities,
    extractVirtues,
    extractConsequences,
    extractCareConsiderations,
    extractJusticePrinciples,
    applyConstraints,
    evaluateConsequencesWithVirtues,
    integrateCarePrinciples,
    generateNuancedMedicalRecommendation
}; 