/**
 * Causal Detection Module
 * 
 * This module contains functions for detecting causal relationships in text.
 */

/**
 * Detect causal language in text
 * @param {string} text - The text to analyze
 * @returns {Object} Result containing causal statements
 */
export function detectCausalLanguage(text) {
  if (!text) {
    return { causalStatements: [] };
  }

  const causalStatements = [];
  
  // Split text into sentences
  const sentences = text.split(/[.!?]\s+/);
  
  // Simple causal phrases to detect
  const causalPhrases = [
    'leads to', 'results in', 'causes', 'because', 'therefore',
    'consequently', 'as a result', 'thus', 'hence', 'due to',
    'effects', 'impacts', 'influences', 'determines', 'produces',
    'generates', 'creates', 'enables', 'prevents', 'allows'
  ];
  
  // Analyze each sentence for causal relationships
  sentences.forEach(sentence => {
    // Skip short sentences
    if (sentence.length < 10) return;
    
    // Check for causal phrases
    const phrasesFound = causalPhrases.filter(phrase => 
      sentence.toLowerCase().includes(phrase)
    );
    
    if (phrasesFound.length > 0) {
      // Simple extraction - split on first causal phrase found
      const phrase = phrasesFound[0];
      const parts = sentence.split(new RegExp(phrase, 'i'));
      
      if (parts.length >= 2) {
        causalStatements.push({
          text: sentence,
          cause: parts[0].trim(),
          effect: parts.slice(1).join(phrase).trim(),
          confidence: 0.7,
          phrase: phrase
        });
      }
    }
  });
  
  return { 
    causalStatements,
    analysisConfidence: causalStatements.length > 0 ? 0.7 : 0.3
  };
}

/**
 * Extract causal statements from text
 * @param {string} text - Text to analyze
 * @returns {Array} Array of causal statements
 */
export function extractCausalStatements(text) {
  const result = detectCausalLanguage(text);
  return result.causalStatements;
} 