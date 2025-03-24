/**
 * Dilemma Adapter Registry
 * 
 * Provides a standardized interface for adapting various dilemma formats.
 */

/**
 * Registry of dilemma adapters
 */
class DilemmaAdapter {
  constructor() {
    this.adapters = new Map();
    this.defaultAdapter = this.createDefaultAdapter();
  }

  /**
   * Register a new adapter
   * @param {string} dilemmaType - Type of dilemma
   * @param {Function} adapter - Adapter function
   */
  registerAdapter(dilemmaType, adapter) {
    this.adapters.set(dilemmaType, adapter);
  }

  /**
   * Get adapter for a dilemma type
   * @param {string} dilemmaType - Type of dilemma
   * @returns {Function} Adapter function
   */
  getAdapter(dilemmaType) {
    return this.adapters.get(dilemmaType) || this.defaultAdapter;
  }

  /**
   * Create default adapter that doesn't modify the dilemma
   * @returns {Function} Default adapter
   */
  createDefaultAdapter() {
    return (dilemma) => dilemma;
  }

  /**
   * Standardize a dilemma using the appropriate adapter
   * @param {Object} dilemma - Dilemma to standardize
   * @returns {Object} Standardized dilemma
   */
  standardizeDilemma(dilemma) {
    if (!dilemma) {
      return { id: 'empty', title: 'Empty Dilemma', description: 'No dilemma data provided' };
    }
    
    const dilemmaType = dilemma.id || 'generic';
    const adapter = this.getAdapter(dilemmaType);
    
    try {
      const standardized = adapter(dilemma);
      
      // Ensure required fields exist
      return {
        id: standardized.id || dilemma.id || 'unknown',
        title: standardized.title || dilemma.title || 'Untitled Dilemma',
        description: standardized.description || dilemma.description || 'No description provided',
        parameters: standardized.parameters || dilemma.parameters || {},
        possible_actions: standardized.possible_actions || dilemma.possible_actions || [],
        stakeholders: standardized.stakeholders || dilemma.stakeholders || [],
        ...standardized
      };
    } catch (error) {
      console.error(`Error standardizing dilemma: ${error.message}`);
      return {
        id: dilemma.id || 'error',
        title: dilemma.title || 'Error Dilemma',
        description: `Error standardizing dilemma: ${error.message}`,
        parameters: dilemma.parameters || {},
        possible_actions: dilemma.possible_actions || [],
        stakeholders: dilemma.stakeholders || []
      };
    }
  }
}

// Create and export singleton instance
export const dilemmaAdapter = new DilemmaAdapter(); 