/**
 * Causal Detection Module
 * 
 * This module provides utilities for detecting causal language and relationships 
 * in ethical dilemmas. It helps identify causal claims, consequences of actions,
 * and causal patterns in natural language text.
 */

/**
 * Detect causal language in text
 * @param {string} text - The text to analyze
 * @returns {Object} Object containing causal language information
 */
function detectCausalLanguage(text) {
    if (!text || typeof text !== 'string') {
        return {
            hasCausalLanguage: false,
            causalTerms: [],
            causalPatterns: [],
            causalStatements: []
        };
    }
    
    // Causal terms/phrases
    const causalTerms = [
        'because', 'since', 'due to', 'as a result', 'consequently',
        'therefore', 'thus', 'hence', 'leads to', 'causes', 'caused by',
        'results in', 'effect of', 'impact of', 'influence of', 'contributes to',
        'responsible for', 'consequence of', 'outcome of', 'precipitates',
        'triggers', 'induces', 'generates', 'produces', 'yields', 'creates'
    ];
    
    // Find causal terms in the text
    const foundCausalTerms = causalTerms.filter(term => text.toLowerCase().includes(term));
    
    // Detect causal pattern matches
    const causalPatterns = [
        /if\s+[\w\s,]+\s+then\s+[\w\s,]+/gi,  // If-then patterns
        /because\s+[\w\s,]+/gi, // Because A, B patterns
        /[\w\s,]+\s+causes?\s+[\w\s,]+/gi,     // A causes B patterns
        /[\w\s,]+\s+leads?\s+to\s+[\w\s,]+/gi, // A leads to B patterns
        /[\w\s,]+\s+results?\s+in\s+[\w\s,]+/gi, // A results in B patterns
        /due\s+to\s+[\w\s,]+/gi, // Due to A, B patterns
        /as\s+a\s+result\s+of\s+[\w\s,]+/gi, // As a result of A, B patterns
        /the\s+consequence\s+of\s+[\w\s,]+/gi, // The consequence of A is B
        /[\w\s,]+\s+contributes?\s+to\s+[\w\s,]+/gi, // A contributes to B
        /[\w\s,]+\s+influences?\s+[\w\s,]+/gi // A influences B
    ];
    
    const foundPatterns = [];
    const causalStatements = [];
    
    // Extract causal statements
    causalPatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
            foundPatterns.push(pattern.toString());
            causalStatements.push(...matches);
        }
    });
    
    // Look for additional causal statements by extracting sentences with causal terms
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    sentences.forEach(sentence => {
        const sentenceLower = sentence.toLowerCase();
        for (const term of causalTerms) {
            if (sentenceLower.includes(term) && !causalStatements.includes(sentence.trim())) {
                causalStatements.push(sentence.trim());
                break;
            }
        }
    });
    
    return {
        hasCausalLanguage: foundCausalTerms.length > 0 || causalStatements.length > 0,
        causalTerms: foundCausalTerms,
        causalPatterns: foundPatterns,
        causalStatements: causalStatements
    };
}

/**
 * Extract causal statements from text
 * @param {string} text - The text to analyze
 * @returns {Array<Object>} Array of causal statement objects
 */
function extractCausalStatements(text) {
    // First detect all causal language in the text
    const detection = detectCausalLanguage(text);
    
    if (!detection.hasCausalLanguage) {
        return [];
    }
    
    // Process each causal statement to extract cause and effect
    return detection.causalStatements.map(statement => {
        try {
            // Try to identify the cause and effect in the statement
            let cause = '';
            let effect = '';
            let relationship = '';
            
            // If-then pattern
            if (statement.match(/if\s+[\w\s,]+\s+then\s+[\w\s,]+/i)) {
                const parts = statement.split(/then/i);
                cause = parts[0].replace(/if/i, '').trim();
                effect = parts[1].trim();
                relationship = 'conditional';
            }
            // Because pattern
            else if (statement.match(/because\s+[\w\s,]+/i)) {
                const parts = statement.split(/because/i);
                if (parts.length >= 2) {
                    effect = parts[0].trim();
                    cause = parts[1].trim();
                    relationship = 'explanation';
                }
            }
            // Due to pattern
            else if (statement.match(/due\s+to\s+[\w\s,]+/i)) {
                const parts = statement.split(/due\s+to/i);
                if (parts.length >= 2) {
                    effect = parts[0].trim();
                    cause = parts[1].trim();
                    relationship = 'attribution';
                }
            }
            // As a result pattern
            else if (statement.match(/as\s+a\s+result\s+of\s+[\w\s,]+/i)) {
                const parts = statement.split(/as\s+a\s+result\s+of/i);
                if (parts.length >= 2) {
                    effect = parts[0].trim();
                    cause = parts[1].trim();
                    relationship = 'result';
                }
            }
            // Causes/leads to/results in pattern
            else if (statement.match(/[\w\s,]+\s+(causes?|leads?\s+to|results?\s+in|contributes?\s+to|influences?)\s+[\w\s,]+/i)) {
                // Extract the causal verb
                const causalVerbs = ['cause', 'causes', 'lead to', 'leads to', 'result in', 'results in', 'contribute to', 'contributes to', 'influence', 'influences'];
                let matchedVerb = '';
                
                for (const verb of causalVerbs) {
                    if (statement.toLowerCase().includes(verb)) {
                        matchedVerb = verb;
                        break;
                    }
                }
                
                if (matchedVerb) {
                    const parts = statement.split(new RegExp(matchedVerb, 'i'));
                    cause = parts[0].trim();
                    effect = parts[1].trim();
                    relationship = 'direct_causation';
                }
            }
            // Fallback for other patterns
            else {
                // Try to match other causal terms
                const causalTerms = ['consequently', 'therefore', 'thus', 'hence', 'impact of', 'outcome of'];
                let matchedTerm = '';
                let termIndex = -1;
                
                for (const term of causalTerms) {
                    const index = statement.toLowerCase().indexOf(term);
                    if (index !== -1) {
                        matchedTerm = term;
                        termIndex = index;
                        break;
                    }
                }
                
                if (matchedTerm) {
                    cause = statement.substring(0, termIndex).trim();
                    effect = statement.substring(termIndex + matchedTerm.length).trim();
                    relationship = 'inference';
                } else {
                    // If we couldn't parse it properly, just use the whole statement
                    cause = '';
                    effect = '';
                    relationship = 'unknown';
                }
            }
            
            // Calculate confidence based on how well we could parse it
            let confidence = 0;
            if (cause && effect && relationship !== 'unknown') {
                confidence = 0.8;
            } else if ((cause || effect) && relationship !== 'unknown') {
                confidence = 0.5;
            } else {
                confidence = 0.2;
            }
            
            return {
                statement: statement,
                cause: cause,
                effect: effect,
                relationship: relationship,
                confidence: confidence
            };
        } catch (error) {
            // Graceful fallback if parsing fails
            return {
                statement: statement,
                cause: '',
                effect: '',
                relationship: 'unknown',
                confidence: 0.1,
                error: `Parsing failed: ${error.message}`
            };
        }
    });
}

export {
    detectCausalLanguage,
    extractCausalStatements
}; 