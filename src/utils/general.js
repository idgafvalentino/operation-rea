/**
 * General utility functions for the REA system
 */

/**
 * Creates a deep copy of an object or array
 * @param {any} obj - Object to copy
 * @returns {any} Deep copy of the object
 */
function deepCopy(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => deepCopy(item));
    }
    
    const copy = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            copy[key] = deepCopy(obj[key]);
        }
    }
    
    return copy;
}

/**
 * Extracts keywords from a text string
 * @param {string} text - Text to extract keywords from
 * @returns {Array<string>} Array of keywords
 */
function extractKeywords(text) {
    if (!text || typeof text !== 'string') {
        return [];
    }
    
    // Convert to lowercase
    const lowercaseText = text.toLowerCase();
    
    // Remove common punctuation
    const cleanedText = lowercaseText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ');
    
    // Split into words
    const words = cleanedText.split(/\s+/);
    
    // Filter out common stopwords
    const stopwords = new Set([
        'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
        'be', 'been', 'being', 'to', 'of', 'for', 'in', 'on', 'at', 'by', 
        'with', 'about', 'against', 'between', 'into', 'through', 'during', 
        'before', 'after', 'above', 'below', 'from', 'up', 'down', 'out', 
        'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 
        'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 
        'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 
        'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 
        'will', 'just', 'don', 'should', 'now'
    ]);
    
    const keywords = words.filter(word => {
        // Filter out stopwords and words with less than 3 characters
        return word.length > 2 && !stopwords.has(word);
    });
    
    return keywords;
}

/**
 * Calculate similarity between two strings using multiple metrics
 * Enhanced with synonym recognition for ethical terminology
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity score between 0 and 1
 */
function calculateSimilarity(str1, str2) {
    if (!str1 || !str2) {
        return 0;
    }
    
    if (str1 === str2) {
        return 1;
    }
    
    // Convert to lowercase
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    // Calculate containment score
    const containment = calculateContainment(s1, s2);
    
    // Calculate word overlap
    const wordOverlap = calculateWordOverlap(s1, s2);
    
    // Calculate edit distance similarity
    const editSimilarity = calculateEditSimilarity(s1, s2);
    
    // Calculate semantic similarity with ethical term recognition
    const semanticSimilarity = calculateSemanticSimilarity(s1, s2);
    
    // Weighted average of all metrics
    // Giving more weight to semantic and word overlap for ethical concepts
    return (
        (containment * 0.2) + 
        (wordOverlap * 0.3) + 
        (editSimilarity * 0.2) + 
        (semanticSimilarity * 0.3)
    );
}

/**
 * Calculate containment score between two strings 
 * @param {string} s1 - First string
 * @param {string} s2 - Second string
 * @returns {number} Containment score between 0 and 1
 */
function calculateContainment(s1, s2) {
    if (s1.includes(s2)) {
        return 1;
    }
    
    if (s2.includes(s1)) {
        return 1;
    }
    
    return 0;
}

/**
 * Calculate word overlap between two strings
 * @param {string} s1 - First string
 * @param {string} s2 - Second string
 * @returns {number} Word overlap score between 0 and 1
 */
function calculateWordOverlap(s1, s2) {
    const words1 = extractKeywords(s1);
    const words2 = extractKeywords(s2);
    
    if (words1.length === 0 || words2.length === 0) {
        return 0;
    }
    
    // Count common words
    const words1Set = new Set(words1);
    const intersection = words2.filter(word => words1Set.has(word));
    
    // Calculate Jaccard similarity
    const union = new Set([...words1, ...words2]);
    return intersection.length / union.size;
}

/**
 * Calculate edit distance similarity using Levenshtein distance
 * @param {string} s1 - First string
 * @param {string} s2 - Second string
 * @returns {number} Edit similarity score between 0 and 1
 */
function calculateEditSimilarity(s1, s2) {
    const distance = levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    
    if (maxLength === 0) {
        return 1;
    }
    
    return 1 - (distance / maxLength);
}

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} s1 - First string
 * @param {string} s2 - Second string
 * @returns {number} Levenshtein distance
 */
function levenshteinDistance(s1, s2) {
    const m = s1.length;
    const n = s2.length;
    
    // Create matrix
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
    
    // Initialize first row and column
    for (let i = 0; i <= m; i++) {
        dp[i][0] = i;
    }
    
    for (let j = 0; j <= n; j++) {
        dp[0][j] = j;
    }
    
    // Fill matrix
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (s1[i - 1] === s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j],      // deletion
                    dp[i][j - 1],      // insertion
                    dp[i - 1][j - 1]   // substitution
                );
            }
        }
    }
    
    return dp[m][n];
}

/**
 * Calculate semantic similarity with ethical term recognition
 * @param {string} s1 - First string
 * @param {string} s2 - Second string
 * @returns {number} Semantic similarity score between 0 and 1
 */
function calculateSemanticSimilarity(s1, s2) {
    // Extract keywords
    const keywords1 = extractKeywords(s1);
    const keywords2 = extractKeywords(s2);
    
    if (keywords1.length === 0 || keywords2.length === 0) {
        return 0;
    }
    
    // Count synonym matches using ethical terms dictionary
    let matchCount = 0;
    
    for (const word1 of keywords1) {
        for (const word2 of keywords2) {
            if (word1 === word2) {
                // Direct match
                matchCount += 1;
            } else if (areEthicalSynonyms(word1, word2)) {
                // Synonym match
                matchCount += 0.8;
            }
        }
    }
    
    // Normalize by the maximum possible matches
    const maxPossibleMatches = Math.max(keywords1.length, keywords2.length);
    return Math.min(1, matchCount / maxPossibleMatches);
}

/**
 * Check if two terms are ethical synonyms
 * @param {string} term1 - First ethical term
 * @param {string} term2 - Second ethical term
 * @returns {boolean} True if terms are synonyms
 */
function areEthicalSynonyms(term1, term2) {
    // Dictionary of ethical term synonyms
    const ethicalSynonyms = {
        'good': ['beneficial', 'positive', 'virtuous', 'worthy', 'righteous'],
        'bad': ['harmful', 'negative', 'wrong', 'evil', 'immoral'],
        'duty': ['obligation', 'responsibility', 'commitment', 'requirement'],
        'right': ['permissible', 'allowed', 'correct', 'proper', 'justified'],
        'wrong': ['impermissible', 'prohibited', 'forbidden', 'incorrect', 'improper'],
        'harm': ['damage', 'injury', 'hurt', 'suffering', 'pain'],
        'benefit': ['advantage', 'good', 'welfare', 'wellbeing', 'utility'],
        'autonomy': ['freedom', 'independence', 'self-determination', 'liberty'],
        'justice': ['fairness', 'equity', 'impartiality', 'rightness'],
        'virtue': ['excellence', 'goodness', 'merit', 'morality'],
        'care': ['concern', 'compassion', 'empathy', 'kindness'],
        'utility': ['usefulness', 'benefit', 'advantage', 'good'],
        // Add more ethical term synonyms as needed
    };
    
    // Check if either term is a key in the dictionary
    if (ethicalSynonyms[term1] && ethicalSynonyms[term1].includes(term2)) {
        return true;
    }
    
    if (ethicalSynonyms[term2] && ethicalSynonyms[term2].includes(term1)) {
        return true;
    }
    
    return false;
}

// Export functions
export {
    deepCopy,
    extractKeywords,
    calculateSimilarity,
    calculateContainment,
    calculateWordOverlap,
    calculateEditSimilarity,
    calculateSemanticSimilarity,
    levenshteinDistance
}; 