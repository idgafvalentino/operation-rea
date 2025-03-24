/**
 * REA System Configuration
 * Contains configuration settings for the REA system
 */

export const reaConfig = {
    // System configuration
    system: {
        version: '1.0.0',
        debug: true,
        logLevel: 'info',
        defaultProcessingMode: 'standard',
    },

    // Resolution strategies configuration
    resolution: {
        defaultStrategies: ['framework_balancing', 'principled_priority', 'compromise'],
        minConflictSeverity: 0.3,
        severityThresholds: {
            low: 0.3,
            medium: 0.5,
            high: 0.7
        }
    },

    // Analysis configuration
    analysis: {
        defaultFrameworks: ['utilitarian', 'justice', 'deontology', 'care_ethics', 'virtue_ethics'],
        defaultDetailLevel: 'medium',
        parameterSensitivity: {
            enabled: true,
            thresholdStep: 0.1
        }
    }
};

export default reaConfig; 