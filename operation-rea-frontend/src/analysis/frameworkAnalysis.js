/**
 * Framework Analysis Module
 * Contains functions for analyzing interactions between ethical frameworks
 */

/**
 * Analyzes the interactions between different ethical frameworks
 * @param {Object} frameworkAnalyses - The results from analyzing each framework
 * @returns {Object} The interaction analysis
 */
export function analyzeFrameworkInteractions(frameworkAnalyses) {
  const frameworks = Object.keys(frameworkAnalyses);
  const interactions = {};
  
  for (let i = 0; i < frameworks.length; i++) {
    const framework1 = frameworks[i];
    interactions[framework1] = {};
    
    for (let j = 0; j < frameworks.length; j++) {
      if (i === j) continue;
      
      const framework2 = frameworks[j];
      interactions[framework1][framework2] = analyzeFrameworkInteraction(
        framework1, 
        framework2, 
        frameworkAnalyses[framework1], 
        frameworkAnalyses[framework2]
      );
    }
  }
  
  return {
    interactions: interactions,
    summaries: generateInteractionSummaries(interactions)
  };
}

/**
 * Analyzes the interaction between two specific ethical frameworks
 * @param {string} framework1 - The first framework
 * @param {string} framework2 - The second framework
 * @param {Object} analysis1 - The analysis results for the first framework
 * @param {Object} analysis2 - The analysis results for the second framework
 * @param {Object} dilemma - The ethical dilemma (optional)
 * @returns {Object} The interaction analysis between the two frameworks
 */
export function analyzeFrameworkInteraction(framework1, framework2, analysis1, analysis2, dilemma = null) {
  // Initialize the interaction analysis
  const interaction = {
    agreement: false,
    agreementStrength: 0,
    conflictAreas: [],
    complementaryInsights: [],
    reasoningDifferences: []
  };
  
  // Check if recommendations agree
  if (analysis1.recommendedAction === analysis2.recommendedAction) {
    interaction.agreement = true;
    interaction.agreementStrength = calculateAgreementStrength(analysis1, analysis2);
  } else {
    // Extract conflict areas
    interaction.conflictAreas = identifyConflictAreas(framework1, framework2, analysis1, analysis2);
  }
  
  // Identify complementary insights
  interaction.complementaryInsights = findComplementaryInsights(framework1, framework2, analysis1, analysis2);
  
  // Analyze reasoning differences
  interaction.reasoningDifferences = analyzeReasoningDifferences(framework1, framework2, analysis1, analysis2);
  
  // Add framework-specific interaction factors
  addFrameworkSpecificInteractions(interaction, framework1, framework2, analysis1, analysis2);
  
  return interaction;
}

/**
 * Collects critical parameters from the analysis results
 * @param {Object} results - The analysis results
 * @param {Object} resolution - The conflict resolution if available
 * @returns {Array} List of critical parameters
 */
export function collectCriticalParameters(results, resolution = null) {
  const criticalParameters = [];
  
  // Extract critical parameters from framework analyses
  if (results.frameworks) {
    for (const framework in results.frameworks) {
      const analysis = results.frameworks[framework];
      
      // Check parameter sensitivities
      if (analysis.parameter_sensitivities) {
        for (const param of analysis.parameter_sensitivities) {
          if (!criticalParameters.includes(param)) {
            criticalParameters.push(param);
          }
        }
      }
      
      // Check sensitivity thresholds
      if (analysis.sensitivity_thresholds) {
        for (const param in analysis.sensitivity_thresholds) {
          if (!criticalParameters.includes(param)) {
            criticalParameters.push(param);
          }
        }
      }
    }
  }
  
  // Extract critical parameters from resolution
  if (resolution && resolution.criticalParameters) {
    for (const param of resolution.criticalParameters) {
      if (!criticalParameters.includes(param)) {
        criticalParameters.push(param);
      }
    }
  }
  
  return criticalParameters;
}

// Helper functions

/**
 * Calculates the strength of agreement between two framework analyses
 * @param {Object} analysis1 - The first framework analysis
 * @param {Object} analysis2 - The second framework analysis
 * @returns {number} Agreement strength between 0 and 1
 */
function calculateAgreementStrength(analysis1, analysis2) {
  // Compare confidences
  const confidenceDifference = Math.abs(
    (analysis1.confidence || 0.5) - (analysis2.confidence || 0.5)
  );
  
  // Compare reasoning (simple text similarity)
  const reasoning1 = analysis1.justification || '';
  const reasoning2 = analysis2.justification || '';
  const reasoningSimilarity = calculateTextSimilarity(reasoning1, reasoning2);
  
  // Create a weighted average
  return (1 - confidenceDifference * 0.5) * 0.3 + reasoningSimilarity * 0.7;
}

/**
 * Identifies areas of conflict between two frameworks
 * @param {string} framework1 - The first framework
 * @param {string} framework2 - The second framework
 * @param {Object} analysis1 - The first framework analysis
 * @param {Object} analysis2 - The second framework analysis
 * @returns {Array} Areas of conflict
 */
function identifyConflictAreas(framework1, framework2, analysis1, analysis2) {
  const conflicts = [];
  
  // Compare values emphasized
  if (analysis1.values_emphasized && analysis2.values_emphasized) {
    const uniqueValues1 = analysis1.values_emphasized.filter(v => 
      !analysis2.values_emphasized.includes(v)
    );
    
    const uniqueValues2 = analysis2.values_emphasized.filter(v => 
      !analysis1.values_emphasized.includes(v)
    );
    
    if (uniqueValues1.length > 0 || uniqueValues2.length > 0) {
      conflicts.push({
        type: 'value_conflict',
        description: `${framework1} emphasizes ${uniqueValues1.join(', ')} while ${framework2} emphasizes ${uniqueValues2.join(', ')}`
      });
    }
  }
  
  // Compare methodology
  if (analysis1.methodology && analysis2.methodology && 
      analysis1.methodology !== analysis2.methodology) {
    conflicts.push({
      type: 'methodological_conflict',
      description: `${framework1} uses ${analysis1.methodology} while ${framework2} uses ${analysis2.methodology}`
    });
  }
  
  return conflicts;
}

/**
 * Finds complementary insights between two frameworks
 * @param {string} framework1 - The first framework
 * @param {string} framework2 - The second framework
 * @param {Object} analysis1 - The first framework analysis
 * @param {Object} analysis2 - The second framework analysis
 * @returns {Array} Complementary insights
 */
function findComplementaryInsights(framework1, framework2, analysis1, analysis2) {
  const insights = [];
  
  // Compare insights
  if (analysis1.insights && analysis2.insights) {
    for (const insight1 of analysis1.insights) {
      // Look for complementary insights in the second framework
      for (const insight2 of analysis2.insights) {
        if (areInsightsComplementary(insight1, insight2)) {
          insights.push({
            description: `${framework1}'s insight "${insight1}" complements ${framework2}'s insight "${insight2}"`,
            strength: calculateInsightComplementarity(insight1, insight2)
          });
        }
      }
    }
  }
  
  return insights;
}

/**
 * Analyzes differences in reasoning between two frameworks
 * @param {string} framework1 - The first framework
 * @param {string} framework2 - The second framework
 * @param {Object} analysis1 - The first framework analysis
 * @param {Object} analysis2 - The second framework analysis
 * @returns {Array} Reasoning differences
 */
function analyzeReasoningDifferences(framework1, framework2, analysis1, analysis2) {
  const differences = [];
  
  // Compare justifications
  const justification1 = analysis1.justification || '';
  const justification2 = analysis2.justification || '';
  
  if (justification1 && justification2) {
    differences.push({
      type: 'justification_comparison',
      description: `${framework1} justifies its recommendation based on ${extractMainReasoning(justification1)}, while ${framework2} focuses on ${extractMainReasoning(justification2)}`
    });
  }
  
  return differences;
}

/**
 * Adds framework-specific interaction factors
 * @param {Object} interaction - The interaction object to modify
 * @param {string} framework1 - The first framework
 * @param {string} framework2 - The second framework
 * @param {Object} analysis1 - The first framework analysis
 * @param {Object} analysis2 - The second framework analysis
 */
function addFrameworkSpecificInteractions(interaction, framework1, framework2, analysis1, analysis2) {
  // Add framework-specific interaction patterns
  const knownInteractions = {
    'utilitarian_deontology': {
      pattern: 'consequences_vs_duties',
      description: 'Tension between consequentialist and duty-based reasoning'
    },
    'utilitarian_virtue_ethics': {
      pattern: 'outcomes_vs_character',
      description: 'Focus on outcomes versus focus on character development'
    },
    'deontology_virtue_ethics': {
      pattern: 'rules_vs_virtues',
      description: 'Emphasis on rules versus emphasis on virtues'
    },
    'justice_care_ethics': {
      pattern: 'rights_vs_relationships',
      description: 'Focus on rights and fairness versus focus on relationships and care'
    }
  };
  
  const key1 = `${framework1}_${framework2}`;
  const key2 = `${framework2}_${framework1}`;
  
  if (knownInteractions[key1]) {
    interaction.knownPattern = knownInteractions[key1];
  } else if (knownInteractions[key2]) {
    interaction.knownPattern = knownInteractions[key2];
  }
}

/**
 * Generates summaries of framework interactions
 * @param {Object} interactions - The interactions object
 * @returns {Array} Summaries of key interactions
 */
function generateInteractionSummaries(interactions) {
  const summaries = [];
  
  // Process interaction pairs
  for (const framework1 in interactions) {
    for (const framework2 in interactions[framework1]) {
      const interaction = interactions[framework1][framework2];
      
      if (interaction.agreement) {
        summaries.push(`${framework1} and ${framework2} agree on the recommended action with strength ${Math.round(interaction.agreementStrength * 100)}%`);
      } else if (interaction.conflictAreas.length > 0) {
        const conflictTypes = interaction.conflictAreas.map(c => c.type).join(', ');
        summaries.push(`${framework1} and ${framework2} disagree due to ${conflictTypes}`);
      }
      
      if (interaction.complementaryInsights.length > 0) {
        summaries.push(`${framework1} and ${framework2} offer ${interaction.complementaryInsights.length} complementary insights`);
      }
    }
  }
  
  return summaries;
}

/**
 * Determines if two insights are complementary
 * @param {string} insight1 - The first insight
 * @param {string} insight2 - The second insight
 * @returns {boolean} True if insights are complementary
 */
function areInsightsComplementary(insight1, insight2) {
  // Simple implementation - check if insights don't contradict each other
  // and cover different aspects
  return !insight2.includes(`not ${insight1}`) && 
         !insight1.includes(`not ${insight2}`) &&
         calculateTextSimilarity(insight1, insight2) < 0.7;
}

/**
 * Calculates the complementarity strength between two insights
 * @param {string} insight1 - The first insight
 * @param {string} insight2 - The second insight
 * @returns {number} Complementarity strength between 0 and 1
 */
function calculateInsightComplementarity(insight1, insight2) {
  // Simple implementation - higher complementarity when insights
  // are different but not contradictory
  const similarity = calculateTextSimilarity(insight1, insight2);
  return 1 - Math.abs(similarity - 0.3);
}

/**
 * Calculates text similarity between two strings
 * @param {string} text1 - The first text
 * @param {string} text2 - The second text
 * @returns {number} Similarity between 0 and 1
 */
function calculateTextSimilarity(text1, text2) {
  // Simple implementation using Jaccard similarity
  const words1 = new Set(text1.toLowerCase().split(/\W+/).filter(w => w.length > 3));
  const words2 = new Set(text2.toLowerCase().split(/\W+/).filter(w => w.length > 3));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / (union.size || 1);
}

/**
 * Extracts the main reasoning from a justification text
 * @param {string} justification - The justification text
 * @returns {string} The main reasoning
 */
function extractMainReasoning(justification) {
  // Simple implementation - extract first sentence or truncate
  const firstSentence = justification.split(/[.!?]/, 1)[0];
  return firstSentence || justification.substring(0, 50) + '...';
} 