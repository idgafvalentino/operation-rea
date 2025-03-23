/**
 * REA System - Dilemma Analysis Tool
 * 
 * This script processes ethical dilemmas through the REA system using the full analysis pipeline:
 * 1. Dilemma processing and framework analysis
 * 2. Stakeholder impact assessment
 * 3. Conflict detection
 * 4. Conflict resolution
 * 
 * Usage: node process-dilemma-direct.js path/to/dilemma.json [--format=json|text|csv] [--no-color]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  processEthicalDilemma, 
  detectConflicts, 
  resolveConflicts 
} from './src/testing/reaTestAdapter.js';
import {
  validateDilemma,
  standardizeResolutionDetail,
  verifyOutputQuality,
  standardizeProcessingMode,
  DETAIL_LEVEL_SPECIFICATIONS,
  validateComponentStructure
} from './src/testing/reaTestFramework.js';
import {
  formatConsoleOutput,
  formatOutput,
  DISPLAY_FORMAT_CONFIG,
  setColorOutput
} from './src/utils/logging.js';

// Only import these when testing causal detection
import { detectCausalLanguage, extractCausalStatements } from './src/analysis/causalDetection.js';
// Import similarity metrics for testing
import { calculateSimilarity, calculateContainment, calculateWordOverlap, calculateEditSimilarity, calculateSemanticSimilarity } from './src/utils/general.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get dilemma path from command line arguments
const dilemmaArg = process.argv[2];
if (!dilemmaArg) {
  console.error('Please provide a path to the dilemma JSON file');
  console.error('Usage: node process-dilemma-direct.js path/to/dilemma.json [--format=json|text|csv] [--no-color]');
  process.exit(1);
}

// Resolve dilemma path
const dilemmaPath = path.resolve(dilemmaArg);

// Parse command-line options
const options = {
  format: 'text',
  color: true,
  width: DISPLAY_FORMAT_CONFIG.defaultConsoleWidth,
  testCausal: false,
  testSimilarity: false
};

process.argv.slice(3).forEach(arg => {
  if (arg.startsWith('--format=')) {
    options.format = arg.split('=')[1];
  } else if (arg === '--no-color') {
    options.color = false;
  } else if (arg.startsWith('--width=')) {
    options.width = parseInt(arg.split('=')[1], 10);
  } else if (arg === '--test-causal') {
    options.testCausal = true;
  } else if (arg === '--test-similarity') {
    options.testSimilarity = true;
  }
});

// Configure display formatting
setColorOutput(options.color);
DISPLAY_FORMAT_CONFIG.dynamicWidth = true;
if (options.width) {
  DISPLAY_FORMAT_CONFIG.defaultConsoleWidth = options.width;
}

// Helper function to format and print output
function printFormatted(title, content, indent = 0) {
  const indentation = ' '.repeat(indent);
  console.log(formatConsoleOutput(`\n${indentation}=== ${title} ===\n`));
  if (typeof content === 'string') {
    console.log(formatConsoleOutput(`${indentation}${content}`));
  } else {
    console.log(formatConsoleOutput(content));
  }
}

// Test causal detection if specified as a command-line option
if (options.testCausal) {
  testCausalDetection(dilemmaPath);
  process.exit(0);
}

// Test similarity metrics if specified as a command-line option
if (options.testSimilarity) {
  testSimilarityMetrics(dilemmaPath);
  process.exit(0);
}

// Load the dilemma
console.log(formatConsoleOutput(`Loading dilemma from: ${dilemmaPath}`));

try {
  // Read and parse the dilemma file
  const dilemmaData = fs.readFileSync(dilemmaPath, 'utf8');
  const dilemma = JSON.parse(dilemmaData);
  
  // Validate the dilemma
  const validationResult = validateDilemma(dilemma);
  if (!validationResult.isValid) {
    printFormatted('VALIDATION ISSUES', 
      `Found ${validationResult.errors.length} validation issues (${validationResult.severityCounts.critical} critical, ${validationResult.severityCounts.moderate} moderate, ${validationResult.severityCounts.minor} minor)`);
    
    // Display validation errors by severity
    if (validationResult.severityCounts.critical > 0) {
      console.log(formatConsoleOutput('\nCRITICAL ISSUES:'));
      validationResult.errors
        .filter(err => err.severity === 'critical' || err.severity.startsWith('critical'))
        .forEach(err => console.log(formatConsoleOutput(`  - ${err.message}`)));
    }
    
    if (validationResult.severityCounts.moderate > 0) {
      console.log(formatConsoleOutput('\nMODERATE ISSUES:'));
      validationResult.errors
        .filter(err => err.severity === 'moderate' || err.severity.startsWith('moderate'))
        .forEach(err => console.log(formatConsoleOutput(`  - ${err.message}`)));
    }
    
    if (validationResult.severityCounts.minor > 0) {
      console.log(formatConsoleOutput('\nMINOR ISSUES:'));
      validationResult.errors
        .filter(err => err.severity === 'minor' || err.severity.startsWith('minor'))
        .forEach(err => console.log(formatConsoleOutput(`  - ${err.message}`)));
    }
    
    // Show auto-corrections if any were applied
    if (validationResult.autoCorrections.applied > 0) {
      console.log(formatConsoleOutput('\nAUTO-CORRECTIONS APPLIED:'));
      validationResult.autoCorrections.details
        .filter(corr => corr.success)
        .forEach(corr => console.log(formatConsoleOutput(`  - ${corr.error} → ${corr.correction}`)));
    }
    
    if (!validationResult.fixed && validationResult.severityCounts.critical > 0) {
      console.error(formatConsoleOutput('\nCritical validation issues could not be auto-corrected. Please fix them manually and try again.'));
      process.exit(1);
    }
  }
  
  // Standardize processing mode
  const processingModeResult = standardizeProcessingMode(dilemma, dilemma.processing_mode || "standard");
  if (processingModeResult.issues.length > 0) {
    console.warn(formatConsoleOutput('Processing mode standardization found issues:'));
    processingModeResult.issues.forEach(issue => console.warn(formatConsoleOutput(` - ${issue}`)));
  }
  
  // Use the standardized dilemma
  const standardizedDilemma = processingModeResult.standardizedDilemma;
  
  printFormatted('DILEMMA', `${standardizedDilemma.title}`);
  console.log(formatConsoleOutput(`Description: ${standardizedDilemma.description}\n`));
  
  // STEP 1: Framework Analysis
  console.log(formatConsoleOutput('STEP 1: Processing dilemma through framework analysis...'));
  const results = processEthicalDilemma(standardizedDilemma);
  
  // Display framework recommendations
  printFormatted('FRAMEWORK RECOMMENDATIONS', '');
  if (results.frameworks) {
    Object.entries(results.frameworks).forEach(([framework, analysis]) => {
      // Validate framework results
      const frameworkValidation = validateComponentStructure(analysis, 'framework');
      
      console.log(formatConsoleOutput(`--- ${framework.toUpperCase()} FRAMEWORK ---`));
      console.log(formatConsoleOutput(`Recommended Action: ${analysis.recommendedAction}`));
      console.log(formatConsoleOutput(`Justification: ${analysis.justification}`));
      
      // Display parameter sensitivities
      if (analysis.parameter_sensitivities && analysis.parameter_sensitivities.length > 0) {
        console.log(formatConsoleOutput(`\nParameter Sensitivities (ranked by impact):`));
        analysis.parameter_sensitivities.forEach(param => {
          const threshold = analysis.sensitivity_thresholds[param];
          if (!threshold) return;
          
          console.log(formatConsoleOutput(`  - ${param} (${threshold.description})`));
          console.log(formatConsoleOutput(`    Current value: ${threshold.original_value}`));
          console.log(formatConsoleOutput(`    Sensitivity score: ${threshold.sensitivity_score}`));
          
          if (threshold.decrease_threshold !== null) {
            console.log(formatConsoleOutput(`    If decreased to ${threshold.decrease_threshold}: Recommendation changes to "${threshold.action_changes.decrease}"`));
          }
          
          if (threshold.increase_threshold !== null) {
            console.log(formatConsoleOutput(`    If increased to ${threshold.increase_threshold}: Recommendation changes to "${threshold.action_changes.increase}"`));
          }
        });
      } else {
        console.log(formatConsoleOutput(`Parameter Sensitivities: None identified`));
      }
      
      console.log(); // Add a blank line between frameworks
    });
  } else {
    console.log(formatConsoleOutput('No framework recommendations found.'));
  }
  
  // Display stakeholder impacts
  printFormatted('STAKEHOLDER IMPACTS', '');
  if (results.stakeholderImpacts) {
    // Find the stakeholder with the highest impact to display first
    const stakeholderEntries = Object.entries(results.stakeholderImpacts);
    stakeholderEntries.sort((a, b) => b[1].impact - a[1].impact);
    
    stakeholderEntries.forEach(([stakeholderId, impact]) => {
      console.log(formatConsoleOutput(`--- ${stakeholderId} ---`));
      console.log(formatConsoleOutput(`Impact: ${impact.impact.toFixed(2)}`));
      console.log(formatConsoleOutput(`Explanation: ${impact.explanation}\n`));
    });
  } else {
    console.log(formatConsoleOutput('No stakeholder impact results found.'));
  }
  
  // STEP 2: Conflict Detection
  console.log(formatConsoleOutput('STEP 2: Detecting ethical conflicts and framework interactions...'));
  const conflicts = detectConflicts(standardizedDilemma);
  
  printFormatted('ETHICAL CONFLICTS', '');
  if (conflicts.conflicts && conflicts.conflicts.length > 0) {
    console.log(formatConsoleOutput(`Detected ${conflicts.conflicts.length} conflicts:\n`));
    
    conflicts.conflicts.forEach((conflict, index) => {
      // Validate conflict structure
      const conflictValidation = validateComponentStructure(conflict, 'conflict');
      
      console.log(formatConsoleOutput(`--- CONFLICT #${index + 1} ---`));
      console.log(formatConsoleOutput(`Type: ${conflict.type}`));
      
      // Handle different conflict types
      if (conflict.type === 'framework_conflict') {
        console.log(formatConsoleOutput(`Between: ${conflict.between.join(' and ')}`));
      } else if (conflict.type === 'multi_framework_conflict') {
        console.log(formatConsoleOutput('Between: Multiple frameworks'));
        console.log(formatConsoleOutput('Action Groups:'));
        for (const [action, frameworks] of Object.entries(conflict.action_groups)) {
          console.log(formatConsoleOutput(`  - ${action}: ${frameworks.join(', ')}`));
        }
      } else if (conflict.type === 'stakeholder_conflict') {
        console.log(formatConsoleOutput(`Between: ${conflict.between.join(' and ')}`));
      }
      
      console.log(formatConsoleOutput(`Description: ${conflict.description}`));
      console.log(formatConsoleOutput(`Severity: ${conflict.severity.toFixed(2)}\n`));
      
      if (conflict.concerns) {
        console.log(formatConsoleOutput(`Concerns: ${conflict.concerns.join(', ')}\n`));
      }
    });
  } else {
    console.log(formatConsoleOutput('No ethical conflicts detected in this dilemma.\n'));
  }
  
  // Display framework interactions
  printFormatted('FRAMEWORK INTERACTIONS', '');
  if (conflicts.interactions && conflicts.interactions.length > 0) {
    console.log(formatConsoleOutput(`Detected ${conflicts.interactions.length} framework interactions:\n`));
    
    conflicts.interactions.forEach((interaction, index) => {
      // Validate interaction structure
      const interactionValidation = validateComponentStructure(interaction, 'interaction');
      
      console.log(formatConsoleOutput(`--- INTERACTION #${index + 1} ---`));
      console.log(formatConsoleOutput(`Type: ${interaction.type}`));
      
      if (interaction.type === 'framework_interaction') {
        console.log(formatConsoleOutput(`Between: ${interaction.frameworks.join(' and ')}`));
        console.log(formatConsoleOutput(`Interaction Type: ${interaction.interaction_type}`));
        console.log(formatConsoleOutput(`Strength: ${interaction.strength.toFixed(2)}`));
        console.log(formatConsoleOutput(`Justification Similarity: ${interaction.justification_similarity.toFixed(2)}`));
      } else if (interaction.type === 'multi_framework_consensus') {
        console.log(formatConsoleOutput(`Frameworks: ${interaction.frameworks.join(', ')}`));
        console.log(formatConsoleOutput(`Consensus Strength: ${interaction.strength.toFixed(2)}`));
        console.log(formatConsoleOutput(`Recommended Action: ${interaction.recommendedAction}`));
      }
      
      console.log(formatConsoleOutput(`Description: ${interaction.description}\n`));
      
      if (interaction.shared_ethical_dimensions && interaction.shared_ethical_dimensions.length > 0) {
        console.log(formatConsoleOutput(`Shared Ethical Dimensions: ${interaction.shared_ethical_dimensions.join(', ')}\n`));
      }
    });
  } else {
    console.log(formatConsoleOutput('No framework interactions detected in this dilemma.\n'));
  }
  
  // STEP 3: Conflict Resolution
  let resolutions = { resolutions: [], metadata: { resolution_count: 0 } };
  
  if (conflicts.conflicts && conflicts.conflicts.length > 0) {
    console.log(formatConsoleOutput('STEP 3: Resolving ethical conflicts...'));
    resolutions = resolveConflicts(results, conflicts, standardizedDilemma);
    
    printFormatted('CONFLICT RESOLUTIONS', '');
    if (resolutions.resolutions && resolutions.resolutions.length > 0) {
      console.log(formatConsoleOutput(`Generated ${resolutions.resolutions.length} resolutions:\n`));
      
      resolutions.resolutions.forEach((resolution, index) => {
        // Standardize resolution detail level
        const standardizedResolution = standardizeResolutionDetail(resolution);
        
        // Validate resolution structure
        const resolutionValidation = validateComponentStructure(standardizedResolution, 'resolution');
        
        console.log(formatConsoleOutput(`--- RESOLUTION #${index + 1} ---`));
        // Fix: Extract strategy name from object if needed
        const strategyName = typeof standardizedResolution.resolution_strategy === 'object' 
          ? standardizedResolution.resolution_strategy.name || 'Unknown Strategy'
          : standardizedResolution.resolution_strategy;
        console.log(formatConsoleOutput(`Strategy: ${strategyName}`));
        console.log(formatConsoleOutput(`Description: ${standardizedResolution.description}`));
        
        // Display strategy-specific information
        if (strategyName === 'framework_balancing' || 
            strategyName === 'principled_priority') {
          console.log(formatConsoleOutput('Weights:'));
          if (standardizedResolution.weights) {
            for (const [framework, weight] of Object.entries(standardizedResolution.weights)) {
              // Skip the _originals property from display
              if (framework === '_originals') continue;
              console.log(formatConsoleOutput(`  ${framework}: ${weight.toFixed(2)}`));
            }
            
            // For advanced processing mode, also show original precise weights
            if (standardizedResolution.weights._originals && standardizedDilemma.processing_mode === 'advanced') {
              console.log(formatConsoleOutput('\nOriginal Precise Weights:'));
              for (const [framework, weight] of Object.entries(standardizedResolution.weights._originals)) {
                console.log(formatConsoleOutput(`  ${framework}: ${weight.toFixed(4)}`));
              }
            }
          } else {
            console.log(formatConsoleOutput('  No weights provided'));
          }
          
          // Additional principled_priority specific display
          if (strategyName === 'principled_priority') {
            if (standardizedResolution.priority_framework) {
              console.log(formatConsoleOutput(`\nPriority Framework: ${standardizedResolution.priority_framework}`));
            }
            if (standardizedResolution.priority_reason) {
              console.log(formatConsoleOutput(`Reason: ${standardizedResolution.priority_reason}`));
            }
            
            // Show the priority ratio if original weights are available
            if (standardizedResolution.weights && standardizedResolution.weights._originals && standardizedResolution.priority_framework) {
              const originals = standardizedResolution.weights._originals;
              const frameworks = Object.keys(originals).filter(k => k !== '_originals');
              if (frameworks.length === 2) {
                const priorityFW = standardizedResolution.priority_framework;
                const otherFW = frameworks.find(f => f !== priorityFW);
                if (otherFW) {
                  const ratio = (originals[priorityFW] / originals[otherFW]).toFixed(2);
                  console.log(formatConsoleOutput(`Priority Ratio: ${ratio}x (${priorityFW} vs ${otherFW})`));
                }
              }
            }
          }
        } else if (strategyName === 'multi_framework_integration') {
          console.log(formatConsoleOutput(`Meta-Recommendation: ${standardizedResolution.meta_recommendation}`));
          
          if (standardizedResolution.action_groups) {
            console.log(formatConsoleOutput('Action Groups:'));
            for (const [action, frameworks] of Object.entries(standardizedResolution.action_groups)) {
              console.log(formatConsoleOutput(`  - ${action}: ${frameworks.join(', ')}`));
            }
          }
        } else if (strategyName === 'compromise') {
          console.log(formatConsoleOutput(`Compromise Proposal: ${standardizedResolution.compromise_proposal || 'Not specified'}`));
        } else if (strategyName === 'procedural') {
          console.log(formatConsoleOutput(`Procedural Approach: ${standardizedResolution.procedural_proposal || 'Not specified'}`));
        } else if (strategyName === 'meta_ethical') {
          console.log(formatConsoleOutput(`Meta-Ethical Analysis: ${standardizedResolution.meta_analysis || 'Not specified'}`));
        } else if (strategyName === 'stakeholder_compromise') {
          console.log(formatConsoleOutput('Stakeholder Weights:'));
          if (standardizedResolution.weights) {
            for (const [stakeholder, weight] of Object.entries(standardizedResolution.weights)) {
              console.log(formatConsoleOutput(`  ${stakeholder}: ${weight.toFixed(2)}`));
            }
          } else {
            console.log(formatConsoleOutput('  No weights provided'));
          }
        } else if (strategyName === 'casuistry') {
          if (standardizedResolution.precedent_cases && standardizedResolution.precedent_cases.length > 0) {
            console.log(formatConsoleOutput('Precedent Cases:'));
            standardizedResolution.precedent_cases.forEach(precedent => {
              console.log(formatConsoleOutput(`  - ${precedent.title} (similarity: ${(precedent.similarity * 100).toFixed(0)}%)`));
              console.log(formatConsoleOutput(`    Resolution: ${precedent.resolution}`));
            });
          }
          
          if (standardizedResolution.casuistry_resolution) {
            console.log(formatConsoleOutput(`Casuistry Resolution: ${standardizedResolution.casuistry_resolution}`));
          }
          
          if (standardizedResolution.detailed_precedent_analysis) {
            console.log(formatConsoleOutput(`\nPrecedent Analysis:\n${standardizedResolution.detailed_precedent_analysis}`));
          }
        }
        
        // Display reasoning if available
        if (standardizedResolution.reasoning) {
          console.log(formatConsoleOutput(`\nReasoning:\n${standardizedResolution.reasoning}\n`));
        }
        
        // Display validation issues if any
        if (resolutionValidation && !resolutionValidation.isValid) {
          console.log(formatConsoleOutput('\nValidation Issues:'));
          console.log(formatConsoleOutput(resolutionValidation.summary));
        }
        
        console.log(); // Add a blank line between resolutions
      });
    } else {
      console.log(formatConsoleOutput('No resolutions generated for this dilemma.\n'));
    }
    
    // Display framework interaction insights
    if (resolutions.interaction_insights && resolutions.interaction_insights.length > 0) {
      printFormatted('FRAMEWORK INTERACTION INSIGHTS', '');
      console.log(formatConsoleOutput(`Generated ${resolutions.interaction_insights.length} interaction insights:\n`));
      
      resolutions.interaction_insights.forEach((insight, index) => {
        console.log(formatConsoleOutput(`--- INSIGHT #${index + 1} ---`));
        console.log(formatConsoleOutput(`Type: ${insight.insight_type}`));
        
        if (insight.interaction_reference.type === 'framework_interaction') {
          console.log(formatConsoleOutput(`Frameworks: ${insight.interaction_reference.frameworks.join(' and ')}`));
        } else if (insight.interaction_reference.type === 'multi_framework_consensus') {
          console.log(formatConsoleOutput(`Frameworks: ${insight.interaction_reference.frameworks.join(', ')}`));
        }
        
        console.log(formatConsoleOutput(`Strength: ${insight.strength ? insight.strength.toFixed(2) : (insight.consensus_strength ? insight.consensus_strength.toFixed(2) : 'N/A')}`));
        
        if (insight.ethical_dimensions && insight.ethical_dimensions.length > 0) {
          console.log(formatConsoleOutput(`Ethical Dimensions: ${insight.ethical_dimensions.join(', ')}`));
        }
        
        console.log(formatConsoleOutput(`\nDescription:\n${insight.description}\n`));
      });
    }
    
    // Display final recommendation if available
    if (resolutions.finalRecommendation || resolutions.final_recommendation) {
      // Use whichever property is available
      const finalRec = resolutions.final_recommendation || resolutions.finalRecommendation;
      
      printFormatted('FINAL RECOMMENDATION', '');
      console.log(formatConsoleOutput(`Recommended Action: ${finalRec.action}`));
      console.log(formatConsoleOutput(`Confidence: ${(finalRec.confidence * 100).toFixed(1)}%`));
      console.log(formatConsoleOutput(`Supporting Frameworks: ${finalRec.supporting_frameworks.join(', ')}`));
      console.log(formatConsoleOutput(`Opposing Frameworks: ${finalRec.opposing_frameworks.join(', ')}`));
      
      console.log(formatConsoleOutput(`\nConfidence Factors:`));
      if (finalRec.confidence_factors) {
        for (const [factor, value] of Object.entries(finalRec.confidence_factors)) {
          console.log(formatConsoleOutput(`  - ${factor.replace(/_/g, ' ')}: ${(value * 100).toFixed(1)}%`));
        }
      }
      
      console.log(formatConsoleOutput(`\nFramework Interactions:`));
      if (finalRec.framework_interactions &&
          finalRec.framework_interactions.length > 0) {
        console.log(formatConsoleOutput(``));
        finalRec.framework_interactions.forEach(interaction => {
          console.log(formatConsoleOutput(`  - ${interaction}`));
        });
      } else {
        console.log(formatConsoleOutput(`  No significant framework interactions found`));
      }
      
      console.log(formatConsoleOutput(`\nReasoning:\n`));
      console.log(formatConsoleOutput(finalRec.reasoning));
      
      console.log(formatConsoleOutput(`\nCritical Parameters:`));
      if (finalRec.critical_parameters && finalRec.critical_parameters.length > 0) {
        console.log(formatConsoleOutput(``));
        finalRec.critical_parameters.forEach(param => {
          console.log(formatConsoleOutput(`  - ${param}`));
        });
      } else {
        console.log(formatConsoleOutput(`  No critical parameters identified`));
      }
    }
  } else {
    console.log(formatConsoleOutput('STEP 3: No conflicts to resolve.'));
  }
  
  // Prepare complete results
  const completeResults = {
    dilemma: {
      id: standardizedDilemma.id,
      title: standardizedDilemma.title,
      description: standardizedDilemma.description
    },
    processing: results,
    conflicts: conflicts,
    resolutions: resolutions,
    // Use whichever format is available (preference for underscore format)
    finalRecommendation: resolutions.final_recommendation || resolutions.finalRecommendation
  };
  
  // Post-process to ensure strategy-specific fields are preserved
  if (completeResults.resolutions && completeResults.resolutions.resolutions) {
    // Create a default configuration object if it doesn't exist
    const defaultConfig = {
      advancedFeatures: {
        useAdvancedFrameworkModeling: true
      }
    };
    
    completeResults.resolutions.resolutions = completeResults.resolutions.resolutions.map(resolution => {
      // Create a new object with all fields from the resolution
      const enhancedResolution = { ...resolution };
      
      // Add a processing_mode field to clearly indicate the current processing mode
      enhancedResolution.processing_mode = 'advanced';
      
      // Add standardized detail level indicator if not present
      if (!enhancedResolution.detail_level) {
        enhancedResolution.detail_level = getStrategyDetailLevel(resolution.resolution_strategy);
      }
      
      // Add strategy-specific fields if missing
      if (resolution.resolution_strategy === 'casuistry') {
        // Enhanced fields with prefix
        if (!enhancedResolution.casuistry_precedent_cases && resolution.casuistry_precedent_cases) {
          enhancedResolution.casuistry_precedent_cases = resolution.casuistry_precedent_cases;
        }
        if (!enhancedResolution.casuistry_resolution && resolution.casuistry_resolution) {
          enhancedResolution.casuistry_resolution = resolution.casuistry_resolution;
        }
        if (!enhancedResolution.casuistry_detailed_analysis && resolution.casuistry_detailed_analysis) {
          enhancedResolution.casuistry_detailed_analysis = resolution.casuistry_detailed_analysis;
        }
        
        // Legacy fields without prefix
        if (!enhancedResolution.precedent_cases && resolution.precedent_cases) {
          enhancedResolution.precedent_cases = resolution.precedent_cases;
        }
        if (!enhancedResolution.detailed_precedent_analysis && resolution.detailed_precedent_analysis) {
          enhancedResolution.detailed_precedent_analysis = resolution.detailed_precedent_analysis;
        }
      } else if (resolution.resolution_strategy === 'principled_priority') {
        // Enhanced fields with prefix
        if (!enhancedResolution.principled_weights && resolution.principled_weights) {
          enhancedResolution.principled_weights = resolution.principled_weights;
        }
        if (!enhancedResolution.principled_reasoning && resolution.principled_reasoning) {
          enhancedResolution.principled_reasoning = resolution.principled_reasoning;
        }
        if (!enhancedResolution.principled_priority_framework && resolution.principled_priority_framework) {
          enhancedResolution.principled_priority_framework = resolution.principled_priority_framework;
        }
        if (!enhancedResolution.principled_priority_reason && resolution.principled_priority_reason) {
          enhancedResolution.principled_priority_reason = resolution.principled_priority_reason;
        }
        
        // Legacy fields without prefix
        if (!enhancedResolution.priority_framework && resolution.priority_framework) {
          enhancedResolution.priority_framework = resolution.priority_framework;
        }
        if (!enhancedResolution.priority_reason && resolution.priority_reason) {
          enhancedResolution.priority_reason = resolution.priority_reason;
        }
        if (!enhancedResolution.weights && resolution.weights) {
          enhancedResolution.weights = resolution.weights;
        }
      } else if (resolution.resolution_strategy === 'multi_framework_integration') {
        // Ensure multi-framework integration has standardized fields
        if (!enhancedResolution.integration_weights && resolution.weights) {
          enhancedResolution.integration_weights = resolution.weights;
        }
        if (!enhancedResolution.integration_meta_recommendation && resolution.meta_recommendation) {
          enhancedResolution.integration_meta_recommendation = resolution.meta_recommendation;
        }
      }
      
      return enhancedResolution;
    });
    
    // Add metadata about consistent detail levels
    completeResults.resolutions.metadata = {
      ...completeResults.resolutions.metadata,
      detail_standardization: true,
      processing_mode: 'advanced',
      detail_levels: {
        casuistry: 'high',
        principled_priority: 'medium',
        multi_framework_integration: 'high',
        framework_balancing: 'medium',
        compromise: 'medium',
        procedural: 'low',
        meta_ethical: 'high'
      }
    };
  }
  
  // Helper function to get standardized detail level for each strategy
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
  
  // Create results directory if it doesn't exist
  const resultsDir = path.join(__dirname, 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  // Save results in requested format
  const resultsBasePath = path.join(resultsDir, `${standardizedDilemma.id}-analysis`);
  
  // Generate different output formats if requested
  if (options.format === 'json' || options.format === 'all') {
    const jsonPath = `${resultsBasePath}.json`;
    fs.writeFileSync(jsonPath, JSON.stringify(completeResults, null, 2));
    console.log(formatConsoleOutput(`\n=== ANALYSIS COMPLETE ===`));
    console.log(formatConsoleOutput(`JSON results saved to: ${jsonPath}`));
  }
  
  if (options.format === 'csv' || options.format === 'all') {
    // CSV export for frameworks and stakeholders
    const csvPath = `${resultsBasePath}.csv`;
    
    // Create simple CSV for frameworks and recommendations
    const frameworksData = Object.entries(results.frameworks).map(([framework, data]) => ({
      Framework: framework,
      RecommendedAction: data.recommendedAction,
      Justification: data.justification.replace(/"/g, '""'),
      SensitivityCount: (data.parameter_sensitivities || []).length
    }));
    
    const frameworksCsv = formatOutput(frameworksData, 'csv');
    fs.writeFileSync(csvPath, frameworksCsv);
    
    console.log(formatConsoleOutput(`CSV results saved to: ${csvPath}`));
  }
  
  // Always save JSON as the default format
  if (options.format !== 'json' && options.format !== 'all') {
    const jsonPath = `${resultsBasePath}.json`;
    fs.writeFileSync(jsonPath, JSON.stringify(completeResults, null, 2));
    console.log(formatConsoleOutput(`\n=== ANALYSIS COMPLETE ===`));
    console.log(formatConsoleOutput(`Comprehensive analysis saved to: ${jsonPath}`));
  }
  
} catch (error) {
  console.error(formatConsoleOutput(`\nERROR: ${error.message}`));
  if (error.stack) {
    console.error(formatConsoleOutput(error.stack));
  }
  process.exit(1);
}

// Add this function at the end of the file
function testCausalDetection(dilemmaPath) {
  printFormatted("CAUSAL DETECTION TEST", "Testing enhanced causal detection functionality");

  // Sample text with various causal relationships
  const testText = `
If nurses are given proper equipment, then patient outcomes will improve.
The overcrowding causes increased stress on healthcare workers.
Due to the shortage of ventilators, patients with respiratory issues are at higher risk.
Providing additional training leads to better care for vulnerable patients.
As a result of the triage protocol, resources are allocated more efficiently.
The consequence of ignoring ethical guidelines is diminished trust.
The doctor's decision contributes to patient well-being.
Stress from long shifts influences medical decision-making quality.
  `;

  // Test causal language detection
  console.log(formatConsoleOutput("\nTesting detectCausalLanguage:"));
  const detection = detectCausalLanguage(testText);
  console.log(formatConsoleOutput(`Has causal language: ${detection.hasCausalLanguage}`));
  console.log(formatConsoleOutput(`Causal terms found: ${detection.causalTerms.join(", ")}`));
  console.log(formatConsoleOutput(`Causal patterns found: ${detection.causalPatterns.length}`));
  
  console.log(formatConsoleOutput("\nCausal statements (sample):"));
  // Show only a few unique statements to avoid duplicates
  const uniqueStatements = new Set();
  detection.causalStatements.forEach(statement => {
    uniqueStatements.add(statement.trim());
  });
  
  [...uniqueStatements].slice(0, 5).forEach((statement, index) => {
    console.log(formatConsoleOutput(`${index + 1}. ${statement}`));
  });

  // Test causal statement extraction
  console.log(formatConsoleOutput("\nTesting extractCausalStatements:"));
  const extracted = extractCausalStatements(testText);
  
  // Remove duplicates by statement
  const uniqueExtracted = [];
  const statementSet = new Set();
  
  extracted.forEach(item => {
    if (!statementSet.has(item.statement.trim())) {
      statementSet.add(item.statement.trim());
      uniqueExtracted.push(item);
    }
  });
  
  uniqueExtracted.forEach((item, index) => {
    console.log(formatConsoleOutput(`\nStatement #${index + 1}:`));
    console.log(formatConsoleOutput(`  Statement: ${item.statement.trim()}`));
    console.log(formatConsoleOutput(`  Cause: ${item.cause || "(not identified)"}`));
    console.log(formatConsoleOutput(`  Effect: ${item.effect || "(not identified)"}`));
    console.log(formatConsoleOutput(`  Relationship: ${item.relationship}`));
    console.log(formatConsoleOutput(`  Confidence: ${item.confidence.toFixed(2)}`));
  });

  // Extract causal statements from a dilemma description
  if (dilemmaPath) {
    try {
      const dilemmaData = fs.readFileSync(dilemmaPath, 'utf8');
      const dilemma = JSON.parse(dilemmaData);
      
      if (dilemma.description) {
        console.log(formatConsoleOutput("\nExtracted causal relationships from dilemma description:"));
        const dilemmaExtracted = extractCausalStatements(dilemma.description);
        
        if (dilemmaExtracted.length === 0) {
          console.log(formatConsoleOutput("No causal relationships detected in the dilemma description."));
        } else {
          // Remove duplicates
          const uniqueDilemmaExtracted = [];
          const dilemmaStatementSet = new Set();
          
          dilemmaExtracted.forEach(item => {
            const key = `${item.cause}:${item.effect}:${item.relationship}`;
            if (!dilemmaStatementSet.has(key)) {
              dilemmaStatementSet.add(key);
              uniqueDilemmaExtracted.push(item);
            }
          });
          
          uniqueDilemmaExtracted.forEach((item, index) => {
            console.log(formatConsoleOutput(`\nRelationship #${index + 1}:`));
            console.log(formatConsoleOutput(`  Statement: ${item.statement.trim()}`));
            console.log(formatConsoleOutput(`  Cause: ${item.cause || "(not identified)"}`));
            console.log(formatConsoleOutput(`  Effect: ${item.effect || "(not identified)"}`));
            console.log(formatConsoleOutput(`  Relationship: ${item.relationship}`));
            console.log(formatConsoleOutput(`  Confidence: ${item.confidence.toFixed(2)}`));
          });
        }
      }
    } catch (error) {
      console.error(formatConsoleOutput(`Error analyzing dilemma: ${error.message}`));
    }
  }
}

/**
 * Test similarity metrics functionality
 * @param {string} dilemmaPath - Path to the dilemma file for additional tests
 */
function testSimilarityMetrics(dilemmaPath) {
  printFormatted("SIMILARITY METRICS TEST", "Testing enhanced similarity metrics functionality");

  // Sample ethical terms to test similarity with
  const testPairs = [
    // Exact match
    { term1: "autonomy", term2: "autonomy", description: "Exact match" },
    
    // Ethical term synonyms
    { term1: "duty", term2: "obligation", description: "Ethical synonyms" },
    { term1: "good", term2: "beneficial", description: "Ethical synonyms" },
    { term1: "harm", term2: "damage", description: "Ethical synonyms" },
    { term1: "justice", term2: "fairness", description: "Ethical synonyms" },
    { term1: "care", term2: "compassion", description: "Ethical synonyms" },
    
    // Related but not synonyms
    { term1: "beneficence", term2: "non-maleficence", description: "Related ethical concepts" },
    { term1: "autonomy", term2: "freedom", description: "Related concepts" },
    
    // Different terms
    { term1: "confidentiality", term2: "honesty", description: "Different ethical concepts" },
    
    // Phrases
    { term1: "respect for autonomy", term2: "protecting patient autonomy", description: "Ethical phrases" },
    { term1: "prioritize vulnerable patients", term2: "focus on those most at risk", description: "Similar ethical statements" },
    { term1: "providing equitable care", term2: "ensuring just distribution of resources", description: "Similar ethical concepts in context" }
  ];
  
  console.log(formatConsoleOutput("\nTesting individual similarity components:"));
  console.log(formatConsoleOutput("Term 1\t\t\tTerm 2\t\t\tContainment\tWord Overlap\tEdit Sim\tSemantic Sim\tTotal"));
  console.log(formatConsoleOutput("-----------------------------------------------------------------------------------------------"));
  
  testPairs.forEach(pair => {
    // Calculate individual metrics
    const containment = calculateContainment(pair.term1, pair.term2);
    const wordOverlap = calculateWordOverlap(pair.term1, pair.term2);
    const editSim = calculateEditSimilarity(pair.term1, pair.term2);
    const semanticSim = calculateSemanticSimilarity(pair.term1, pair.term2);
    
    // Calculate total similarity
    const totalSim = calculateSimilarity(pair.term1, pair.term2);
    
    // Format for display
    const term1 = pair.term1.padEnd(20).substring(0, 20);
    const term2 = pair.term2.padEnd(20).substring(0, 20);
    
    console.log(formatConsoleOutput(
      `${term1}\t${term2}\t${containment.toFixed(2)}\t\t${wordOverlap.toFixed(2)}\t\t${editSim.toFixed(2)}\t${semanticSim.toFixed(2)}\t${totalSim.toFixed(2)}`
    ));
  });
  
  // Test with real dilemma data if available
  if (dilemmaPath) {
    try {
      const dilemmaData = fs.readFileSync(dilemmaPath, 'utf8');
      const dilemma = JSON.parse(dilemmaData);
      
      if (dilemma.framework_weights) {
        printFormatted("FRAMEWORK SIMILARITY TEST", "Testing framework description similarity");
        
        const frameworks = Object.keys(dilemma.framework_weights);
        
        // Get framework descriptions if available
        const frameworkDescriptions = {};
        frameworks.forEach(fw => {
          if (dilemma[fw] && dilemma[fw].description) {
            frameworkDescriptions[fw] = dilemma[fw].description;
          }
        });
        
        // If we have at least two framework descriptions, compare them
        const frameworkKeys = Object.keys(frameworkDescriptions);
        if (frameworkKeys.length >= 2) {
          console.log(formatConsoleOutput("\nFramework Description Similarities:"));
          
          for (let i = 0; i < frameworkKeys.length; i++) {
            for (let j = i + 1; j < frameworkKeys.length; j++) {
              const fw1 = frameworkKeys[i];
              const fw2 = frameworkKeys[j];
              
              const similarity = calculateSimilarity(
                frameworkDescriptions[fw1],
                frameworkDescriptions[fw2]
              );
              
              console.log(formatConsoleOutput(`${fw1} vs ${fw2}: ${similarity.toFixed(2)}`));
            }
          }
        } else {
          console.log(formatConsoleOutput("Not enough framework descriptions available for comparison."));
        }
      }
      
      // Compare stakeholder descriptions if available
      if (dilemma.stakeholders && dilemma.stakeholders.length >= 2) {
        printFormatted("STAKEHOLDER SIMILARITY TEST", "Testing stakeholder description similarity");
        
        // Extract stakeholder descriptions
        const stakeholderDescs = {};
        dilemma.stakeholders.forEach(stakeholder => {
          if (typeof stakeholder === 'object' && stakeholder.description) {
            stakeholderDescs[stakeholder.id || stakeholder.name] = stakeholder.description;
          }
        });
        
        const stakeholderKeys = Object.keys(stakeholderDescs);
        if (stakeholderKeys.length >= 2) {
          console.log(formatConsoleOutput("\nStakeholder Description Similarities:"));
          
          for (let i = 0; i < stakeholderKeys.length; i++) {
            for (let j = i + 1; j < stakeholderKeys.length; j++) {
              const s1 = stakeholderKeys[i];
              const s2 = stakeholderKeys[j];
              
              const similarity = calculateSimilarity(
                stakeholderDescs[s1],
                stakeholderDescs[s2]
              );
              
              console.log(formatConsoleOutput(`${s1} vs ${s2}: ${similarity.toFixed(2)}`));
            }
          }
        } else {
          console.log(formatConsoleOutput("Not enough stakeholder descriptions available for comparison."));
        }
      }
      
    } catch (error) {
      console.error(formatConsoleOutput(`Error analyzing dilemma for similarity metrics: ${error.message}`));
    }
  }
  
  printFormatted("SYNONYM RECOGNITION TEST", "Testing ethical term synonym recognition");
  
  // Define some ethical term pairs to test
  const synonymPairs = [
    { term1: "good", term2: "beneficial" },
    { term1: "duty", term2: "obligation" },
    { term1: "harm", term2: "injury" },
    { term1: "benefit", term2: "advantage" },
    { term1: "autonomy", term2: "freedom" },
    { term1: "justice", term2: "fairness" },
    { term1: "utility", term2: "usefulness" },
    // Non-synonyms for comparison
    { term1: "autonomy", term2: "harm" },
    { term1: "justice", term2: "care" },
    { term1: "utility", term2: "duty" }
  ];
  
  console.log(formatConsoleOutput("\nEthical Term Synonym Recognition:"));
  console.log(formatConsoleOutput("Term 1\t\tTerm 2\t\tSemantic Similarity"));
  console.log(formatConsoleOutput("-------------------------------------------"));
  
  synonymPairs.forEach(pair => {
    const semanticSim = calculateSemanticSimilarity(pair.term1, pair.term2);
    
    const term1 = pair.term1.padEnd(12);
    const term2 = pair.term2.padEnd(12);
    
    console.log(formatConsoleOutput(
      `${term1}\t${term2}\t${semanticSim.toFixed(2)}`
    ));
  });
} 