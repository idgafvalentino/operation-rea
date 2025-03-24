/**
 * Consequence Schema Module
 * 
 * Defines the schema for ethical consequences analysis.
 */

/**
 * Schema for consequence analysis
 */
export const ConsequenceSchema = {
  // Valid consequence types
  types: [
    'economic',
    'social',
    'health',
    'environmental',
    'rights',
    'security',
    'general',
    'unknown'
  ],
  
  // Valid consequence timeframes
  timeframes: [
    'immediate',
    'short-term',
    'medium-term',
    'long-term',
    'unknown'
  ],
  
  // Valid consequence valence values
  valences: [
    'positive',
    'negative',
    'mixed',
    'neutral',
    'unknown'
  ],
  
  // Domains for categorizing consequences
  domains: [
    'medical',
    'social',
    'rights',
    'institutional',
    'technical',
    'legal',
    'economic',
    'environmental',
    'general'
  ],
  
  /**
   * Get default values for a consequence
   * @returns {Object} Default values for consequence properties
   */
  getDefaultValues() {
    return {
      type: 'general',
      timeframe: 'unknown',
      valence: 'neutral',
      domain: 'general',
      reversibility: 'unknown',
      likelihood: 0.5,
      severity: 0.5,
      stakeholders: []
    };
  }
}; 