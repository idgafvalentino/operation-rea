/**
 * Causal Graph Module
 * 
 * This module implements a causal graph for tracking cause-effect relationships.
 */

/**
 * Causal Graph class for tracking cause-effect relationships
 */
export class CausalGraph {
  constructor() {
    this.nodes = new Map(); // Map of node ids to node data
    this.edges = []; // Array of edges (cause-effect relationships)
  }
  
  /**
   * Add a causal relation to the graph
   * @param {string} cause - The cause
   * @param {string} effect - The effect
   * @param {number} confidence - Confidence in the causal relationship
   * @param {string} text - Original text describing the relationship
   * @param {Array} stakeholders - Affected stakeholders
   * @param {Object} metadata - Additional metadata
   */
  addCausalRelation(cause, effect, confidence, text, stakeholders = [], metadata = {}) {
    // Add or update nodes
    if (!this.nodes.has(cause)) {
      this.nodes.set(cause, { id: cause, type: 'cause' });
    }
    
    if (!this.nodes.has(effect)) {
      this.nodes.set(effect, { id: effect, type: 'effect' });
    }
    
    // Add edge
    this.edges.push({
      from: cause,
      to: effect,
      confidence: confidence || 0.5,
      text: text || '',
      stakeholders: stakeholders || [],
      metadata: metadata || {}
    });
  }
  
  /**
   * Get all consequences for a given cause
   * @param {string} cause - The cause to find consequences for
   * @returns {Array} Array of consequence objects
   */
  getConsequences(cause) {
    if (!cause) return [];
    
    return this.edges
      .filter(edge => edge.from === cause)
      .map(edge => ({
        consequence: edge.to,
        confidence: edge.confidence,
        text: edge.text,
        stakeholders: edge.stakeholders,
        ...edge.metadata
      }));
  }
  
  /**
   * Determine the type of consequence based on text
   * @param {string} text - Text to analyze
   * @returns {string} Consequence type
   */
  determineConsequenceType(text) {
    if (!text) return 'general';
    
    const textLower = text.toLowerCase();
    
    if (/econom|financ|cost|money|budget|resource|fund/i.test(textLower)) {
      return 'economic';
    }
    if (/social|societ|communit|relationship|cultural/i.test(textLower)) {
      return 'social';
    }
    if (/health|medic|disease|illness|patient|doctor|treatment|cure/i.test(textLower)) {
      return 'health';
    }
    if (/environment|climate|pollution|ecosystem|sustainab/i.test(textLower)) {
      return 'environmental';
    }
    if (/right|freedom|liberty|privacy|autonomy|dignity/i.test(textLower)) {
      return 'rights';
    }
    if (/secur|safe|protect|danger|threat|risk|harm/i.test(textLower)) {
      return 'security';
    }
    
    return 'general';
  }
  
  /**
   * Determine the timeframe of a consequence based on text
   * @param {string} text - Text to analyze
   * @returns {string} Timeframe
   */
  determineTimeframe(text) {
    if (!text) return 'unknown';
    
    const textLower = text.toLowerCase();
    
    if (/immediate|instantly|direct|right away|promptly|at once/i.test(textLower)) {
      return 'immediate';
    }
    if (/short[- ]term|soon|quickly|days|weeks|month/i.test(textLower)) {
      return 'short-term';
    }
    if (/medium[- ]term|months|year/i.test(textLower)) {
      return 'medium-term';
    }
    if (/long[- ]term|years|decade|permanent|lasting/i.test(textLower)) {
      return 'long-term';
    }
    
    return 'unknown';
  }
  
  /**
   * Determine the valence of a consequence based on text
   * @param {string} text - Text to analyze
   * @returns {string} Valence
   */
  determineValence(text) {
    if (!text) return 'neutral';
    
    const textLower = text.toLowerCase();
    
    const positiveTerms = /benefit|improv|enhanc|positive|better|good|helpful|advantage/i;
    const negativeTerms = /harm|damag|worsen|negative|worse|bad|detrimental|disadvantage/i;
    
    const hasPositive = positiveTerms.test(textLower);
    const hasNegative = negativeTerms.test(textLower);
    
    if (hasPositive && hasNegative) {
      return 'mixed';
    } else if (hasPositive) {
      return 'positive';
    } else if (hasNegative) {
      return 'negative';
    }
    
    return 'neutral';
  }
  
  /**
   * Extract stakeholders from text
   * @param {string} text - Text to analyze
   * @returns {Array} Array of stakeholder IDs
   */
  extractStakeholders(text) {
    if (!text) return [];
    
    const textLower = text.toLowerCase();
    const stakeholders = [];
    
    // Simple stakeholder detection
    if (/patient|individual|person/i.test(textLower)) {
      stakeholders.push('patients');
    }
    if (/doctor|physician|nurse|medical staff|healthcare worker/i.test(textLower)) {
      stakeholders.push('medical_staff');
    }
    if (/family|relative|loved one/i.test(textLower)) {
      stakeholders.push('families');
    }
    if (/hospital|clinic|institution|facility/i.test(textLower)) {
      stakeholders.push('healthcare_institutions');
    }
    if (/community|public|society|population/i.test(textLower)) {
      stakeholders.push('general_public');
    }
    if (/government|regulator|authority/i.test(textLower)) {
      stakeholders.push('regulators');
    }
    if (/vulnerable|marginalized|disadvantaged|underserved/i.test(textLower)) {
      stakeholders.push('vulnerable_groups');
    }
    
    return stakeholders;
  }
  
  /**
   * Assess likelihood of a consequence based on text and confidence
   * @param {number} confidence - Base confidence value
   * @param {string} text - Text to analyze
   * @returns {number} Likelihood score (0-1)
   */
  assessLikelihood(confidence, text) {
    if (!text) return confidence || 0.5;
    
    const textLower = text.toLowerCase();
    let modifier = 0;
    
    // Increase likelihood for strong causal language
    if (/definitely|certainly|always|inevitably|necessarily|undoubtedly/i.test(textLower)) {
      modifier += 0.2;
    }
    
    // Decrease likelihood for uncertain language
    if (/possibly|perhaps|maybe|might|could|potentially|uncertain/i.test(textLower)) {
      modifier -= 0.2;
    }
    
    // Calculate final likelihood with bounds
    const baseLikelihood = confidence || 0.5;
    return Math.min(1, Math.max(0, baseLikelihood + modifier));
  }
  
  /**
   * Identify key stakeholders affected by a cause
   * @param {string} cause - The cause to analyze
   * @returns {Object} Key stakeholders and their impact counts
   */
  identifyKeyStakeholders(cause) {
    const consequences = this.getConsequences(cause);
    const stakeholderCounts = {};
    
    // Count mentions of each stakeholder
    consequences.forEach(consequence => {
      (consequence.stakeholders || []).forEach(stakeholder => {
        stakeholderCounts[stakeholder] = (stakeholderCounts[stakeholder] || 0) + 1;
      });
    });
    
    // Sort by count
    const sortedStakeholders = Object.entries(stakeholderCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([stakeholder, count]) => ({
        id: stakeholder,
        count: count,
        percentage: consequences.length > 0 
          ? (count / consequences.length) * 100 
          : 0
      }));
    
    return {
      keyStakeholders: sortedStakeholders,
      totalConsequences: consequences.length
    };
  }
} 