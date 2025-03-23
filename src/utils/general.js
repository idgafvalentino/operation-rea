/**
 * General utility functions
 */

/**
 * Creates a deep copy of an object, handling nested objects, arrays, dates and other common types
 * @param {*} obj - The object to deep copy
 * @returns {*} A deep copy of the input
 */
export function deepCopy(obj) {
    // Handle primitive types and null/undefined
    if (obj === null || obj === undefined || typeof obj !== 'object') {
        return obj;
    }

    // Handle Date objects
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }

    // Handle Array objects
    if (Array.isArray(obj)) {
        return obj.map(item => deepCopy(item));
    }

    // Handle Object objects
    const copy = {};
    // Use hasOwnProperty to avoid copying prototype properties
    Object.keys(obj).forEach(key => {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            copy[key] = deepCopy(obj[key]);
        }
    });
    
    return copy;
}

/**
 * Legacy alias for JSON-based deep clone (less robust but potentially faster for simple objects)
 * @param {*} obj - The object to clone 
 * @returns {*} A deep copy of the input
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Calculates the similarity between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity score between 0 and 1
 */
export function calculateStringSimilarity(str1, str2) {
    if (!str1 || !str2) {
        return 0;
    }
    
    if (str1 === str2) {
        return 1;
    }
    
    // Convert to lowercase for case-insensitive comparison
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    // Calculate Levenshtein distance
    const matrix = [];
    
    // Initialize matrix
    for (let i = 0; i <= s1.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= s2.length; j++) {
        matrix[0][j] = j;
    }
    
    // Fill matrix
    for (let i = 1; i <= s1.length; i++) {
        for (let j = 1; j <= s2.length; j++) {
            const cost = s1.charAt(i - 1) === s2.charAt(j - 1) ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // deletion
                matrix[i][j - 1] + 1,      // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }
    
    // Calculate similarity score
    const maxLength = Math.max(s1.length, s2.length);
    if (maxLength === 0) {
        return 1; // Both strings are empty
    }
    
    const distance = matrix[s1.length][s2.length];
    return 1 - distance / maxLength;
}

/**
 * Highlights changes between two texts
 * @param {string} originalText - Original text
 * @param {string} newText - New text
 * @returns {string} HTML with highlighted changes
 */
export function highlightChanges(originalText, newText) {
    if (!originalText || !newText) {
        return newText || originalText || '';
    }
    
    if (originalText === newText) {
        return newText;
    }
    
    // Simple word-by-word diff
    const originalWords = originalText.split(/\s+/);
    const newWords = newText.split(/\s+/);
    
    // Find common prefix
    let prefixLength = 0;
    while (prefixLength < originalWords.length && 
           prefixLength < newWords.length && 
           originalWords[prefixLength] === newWords[prefixLength]) {
        prefixLength++;
    }
    
    // Find common suffix
    let suffixLength = 0;
    while (suffixLength < originalWords.length - prefixLength && 
           suffixLength < newWords.length - prefixLength && 
           originalWords[originalWords.length - 1 - suffixLength] === newWords[newWords.length - 1 - suffixLength]) {
        suffixLength++;
    }
    
    // Extract changed parts
    const originalChanged = originalWords.slice(prefixLength, originalWords.length - suffixLength);
    const newChanged = newWords.slice(prefixLength, newWords.length - suffixLength);
    
    // Construct result with highlighting
    const prefix = originalWords.slice(0, prefixLength).join(' ');
    const suffix = originalWords.slice(originalWords.length - suffixLength).join(' ');
    
    let result = '';
    
    if (prefix) {
        result += prefix + ' ';
    }
    
    if (originalChanged.length > 0) {
        result += '[-' + originalChanged.join(' ') + '-] ';
    }
    
    if (newChanged.length > 0) {
        result += '[+' + newChanged.join(' ') + '+] ';
    }
    
    if (suffix) {
        result += suffix;
    }
    
    return result.trim();
}

/**
 * Capitalizes the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalizeFirstLetter(str) {
    if (!str || typeof str !== 'string' || str.length === 0) {
        return str;
    }
    
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Extracts the first sentence from a text
 * @param {string} text - Text to extract from
 * @returns {string} First sentence
 */
export function extractFirstSentence(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }
    
    const match = text.match(/^.*?[.!?](?:\s|$)/);
    return match ? match[0].trim() : text;
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, or empty object)
 * @param {*} value - Value to check
 * @returns {boolean} True if empty, false otherwise
 */
export function isEmpty(value) {
    if (value === null || value === undefined) {
        return true;
    }
    
    if (typeof value === 'string' && value.trim() === '') {
        return true;
    }
    
    if (Array.isArray(value) && value.length === 0) {
        return true;
    }
    
    if (typeof value === 'object' && Object.keys(value).length === 0) {
        return true;
    }
    
    return false;
}

/**
 * Safely parses JSON with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value to return on error
 * @returns {*} Parsed JSON or default value
 */
export function safeJsonParse(jsonString, defaultValue = {}) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return defaultValue;
    }
}

/**
 * Truncates a string to a maximum length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add if truncated
 * @returns {string} Truncated string
 */
export function truncateString(str, maxLength = 100, suffix = '...') {
    if (!str || str.length <= maxLength) {
        return str;
    }
    
    return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Extracts relevant keywords from a dilemma
 * @param {Object} dilemma - The dilemma to extract keywords from
 * @returns {Array<string>} Array of keywords
 */
export function extractKeywords(dilemma) {
    if (!dilemma) {
        return [];
    }

    const keywords = new Set();

    // Extract from title
    if (dilemma.title) {
        dilemma.title.toLowerCase().split(/\W+/).forEach(word => {
            if (word.length > 2) keywords.add(word);
        });
    }

    // Extract from description
    if (dilemma.description) {
        dilemma.description.toLowerCase().split(/\W+/).forEach(word => {
            if (word.length > 2) keywords.add(word);
        });
    }

    // Extract from context
    if (dilemma.context) {
        dilemma.context.toLowerCase().split(/\W+/).forEach(word => {
            if (word.length > 2) keywords.add(word);
        });
    }

    // Extract from stakeholders
    if (dilemma.stakeholders && Array.isArray(dilemma.stakeholders)) {
        dilemma.stakeholders.forEach(stakeholder => {
            if (typeof stakeholder === 'string') {
                stakeholder.toLowerCase().split(/\W+/).forEach(word => {
                    if (word.length > 2) keywords.add(word);
                });
            } else if (stakeholder.name) {
                stakeholder.name.toLowerCase().split(/\W+/).forEach(word => {
                    if (word.length > 2) keywords.add(word);
                });
            }
        });
    }

    // Extract from actions
    if (dilemma.possible_actions && Array.isArray(dilemma.possible_actions)) {
        dilemma.possible_actions.forEach(action => {
            if (typeof action === 'string') {
                action.toLowerCase().split(/\W+/).forEach(word => {
                    if (word.length > 2) keywords.add(word);
                });
            } else if (action.description) {
                action.description.toLowerCase().split(/\W+/).forEach(word => {
                    if (word.length > 2) keywords.add(word);
                });
            }
        });
    }

    return Array.from(keywords);
} 