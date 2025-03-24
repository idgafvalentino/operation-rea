/**
 * Enhanced console logging utilities
 * Provides standardized logging with severity levels, timestamps, and formatting
 */

import fs from 'fs';
import path from 'path';

// Default configuration
export const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
    TRACE: 4
};

// Default configuration for display formatting
export const DISPLAY_FORMAT_CONFIG = {
    defaultConsoleWidth: 120,   // Default width when terminal size can't be detected
    dynamicWidth: true,         // Whether to attempt to dynamically adjust to terminal width
    colorOutput: true,          // Whether to use ANSI color codes in terminal output
    truncateLines: true,        // Whether to truncate long lines in the console
    indentSize: 2,              // Number of spaces for each indentation level
    maxWidth: 180,              // Maximum width to consider (even with wider terminal)
    minWidth: 80,               // Minimum width to enforce
    formats: {                  // Output format options
        json: false,              // Output as JSON
        text: true,               // Output as formatted text
        csv: false                // Output as CSV
    }
};

// ANSI color codes for terminal output
const COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',
    // Foreground colors
    fg: {
        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        crimson: '\x1b[38m'
    },
    // Background colors
    bg: {
        black: '\x1b[40m',
        red: '\x1b[41m',
        green: '\x1b[42m',
        yellow: '\x1b[43m',
        blue: '\x1b[44m',
        magenta: '\x1b[45m',
        cyan: '\x1b[46m',
        white: '\x1b[47m',
        crimson: '\x1b[48m'
    }
};

// Default logger configuration
let currentLogLevel = LOG_LEVELS.INFO;
let useColors = DISPLAY_FORMAT_CONFIG.colorOutput;
let timestampEnabled = true;
let moduleNameEnabled = true;

/**
 * Set the current log level
 * @param {number} level - The log level to set
 */
export function setLogLevel(level) {
    if (level >= LOG_LEVELS.ERROR && level <= LOG_LEVELS.TRACE) {
        currentLogLevel = level;
    } else {
        console.warn(`Invalid log level: ${level}. Using default.`);
    }
}

/**
 * Configure color output
 * @param {boolean} enabled - Whether color output should be enabled
 */
export function setColorOutput(enabled) {
    useColors = !!enabled;
    DISPLAY_FORMAT_CONFIG.colorOutput = !!enabled;
}

/**
 * Configure timestamp display
 * @param {boolean} enabled - Whether timestamps should be included in log output
 */
export function setTimestampEnabled(enabled) {
    timestampEnabled = !!enabled;
}

/**
 * Configure module name display
 * @param {boolean} enabled - Whether module names should be included in log output
 */
export function setModuleNameEnabled(enabled) {
    moduleNameEnabled = !!enabled;
}

/**
 * Core logging function
 * @param {string} level - Log level name (ERROR, WARN, etc.)
 * @param {number} levelValue - Numeric level value
 * @param {string} message - Log message
 * @param {string} [moduleName] - Optional module name
 * @param {*} [data] - Optional data to include
 */
function logMessage(level, levelValue, message, moduleName = '', data = undefined) {
    if (levelValue > currentLogLevel) return;
    
    const timestamp = timestampEnabled ? new Date().toISOString() : '';
    const modulePrefix = moduleNameEnabled && moduleName ? `[${moduleName}] ` : '';
    
    // Determine level color
    let levelColor = '';
    if (useColors) {
        switch (level) {
            case 'ERROR': levelColor = COLORS.fg.red; break;
            case 'WARN': levelColor = COLORS.fg.yellow; break;
            case 'INFO': levelColor = COLORS.fg.green; break;
            case 'DEBUG': levelColor = COLORS.fg.cyan; break;
            case 'TRACE': levelColor = COLORS.fg.white; break;
        }
    }
    
    // Format the message
    const formattedMessage = formatConsoleOutput(
        `${timestamp} ${levelColor}${level}${COLORS.reset} ${modulePrefix}${message}`,
        data
    );
    
    // Output the message
    switch (level) {
        case 'ERROR': console.error(formattedMessage); break;
        case 'WARN': console.warn(formattedMessage); break;
        default: console.log(formattedMessage);
    }
    
    // Output data in appropriate format if present
    if (data !== undefined) {
        if (DISPLAY_FORMAT_CONFIG.formats.json) {
            console.log(JSON.stringify(data, null, 2));
        } else if (typeof data === 'object') {
            console.dir(data, { depth: null, colors: useColors });
        }
    }
}

/**
 * Format console output with dynamic width adjustment and handling long lines
 * @param {string} message - The message to format
 * @param {*} data - Optional data that influenced formatting decisions
 * @returns {string} Formatted message for console output
 */
export function formatConsoleOutput(message, data = undefined) {
    // Determine console width
    let consoleWidth = DISPLAY_FORMAT_CONFIG.defaultConsoleWidth;
    
    // Try to get actual terminal width if dynamic width is enabled
    if (DISPLAY_FORMAT_CONFIG.dynamicWidth) {
        try {
            // Node.js environment
            if (typeof process !== 'undefined' && process.stdout && process.stdout.columns) {
                consoleWidth = process.stdout.columns;
            }
            // Browser environment (approximate)
            else if (typeof window !== 'undefined' && window.innerWidth) {
                // Approximate character width based on typical terminal font
                consoleWidth = Math.floor(window.innerWidth / 8);
            }
        } catch (e) {
            // Fallback to default if error occurs
            consoleWidth = DISPLAY_FORMAT_CONFIG.defaultConsoleWidth;
        }
    }
    
    // Ensure width is within bounds
    consoleWidth = Math.max(
        DISPLAY_FORMAT_CONFIG.minWidth,
        Math.min(consoleWidth, DISPLAY_FORMAT_CONFIG.maxWidth)
    );
    
    // If message is short enough, return as is
    if (!DISPLAY_FORMAT_CONFIG.truncateLines || message.length <= consoleWidth) {
        return message;
    }
    
    // Split message into lines and format each line
    const lines = message.split('\n');
    const formattedLines = lines.map(line => {
        // If line is too long, truncate it
        if (line.length > consoleWidth) {
            return line.substring(0, consoleWidth - 3) + '...';
        }
        return line;
    });
    
    return formattedLines.join('\n');
}

/**
 * Format and export data in specified format
 * @param {Object|Array} data - Data to export
 * @param {string} format - Format type (json, text, csv)
 * @param {Object} options - Additional formatting options
 * @returns {string} Formatted output string
 */
export function formatOutput(data, format = 'text', options = {}) {
    // Default formatting options
    const defaultOptions = {
        pretty: true,
        includeHeaders: true,
        delimiter: ',',
        indent: 2
    };
    
    // Merge with user options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Handle different output formats
    switch (format.toLowerCase()) {
        case 'json':
            return mergedOptions.pretty 
                ? JSON.stringify(data, null, mergedOptions.indent) 
                : JSON.stringify(data);
            
        case 'csv':
            // Handle array of objects for CSV
            if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
                const headers = Object.keys(data[0]);
                const rows = data.map(obj => headers.map(header => {
                    const value = obj[header];
                    // Handle strings with commas, quotes, etc.
                    if (typeof value === 'string' && (value.includes(mergedOptions.delimiter) || value.includes('"') || value.includes('\n'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value === null || value === undefined ? '' : String(value);
                }).join(mergedOptions.delimiter));
                
                // Only include headers if requested
                if (mergedOptions.includeHeaders) {
                    return [headers.join(mergedOptions.delimiter), ...rows].join('\n');
                }
                return rows.join('\n');
            }
            // Handle simple arrays
            else if (Array.isArray(data)) {
                return data.map(item => {
                    if (typeof item === 'string' && (item.includes(mergedOptions.delimiter) || item.includes('"') || item.includes('\n'))) {
                        return `"${item.replace(/"/g, '""')}"`;
                    }
                    return item === null || item === undefined ? '' : String(item);
                }).join('\n');
            }
            // Handle objects
            else if (typeof data === 'object' && data !== null) {
                const entries = Object.entries(data);
                const rows = entries.map(([key, value]) => {
                    const formattedValue = typeof value === 'string' && 
                        (value.includes(mergedOptions.delimiter) || value.includes('"') || value.includes('\n')) 
                        ? `"${value.replace(/"/g, '""')}"` 
                        : (value === null || value === undefined ? '' : String(value));
                    return `${key}${mergedOptions.delimiter}${formattedValue}`;
                });
                return rows.join('\n');
            }
            // Fallback
            return String(data);
            
        case 'text':
        default:
            // If data is a string, just return it
            if (typeof data === 'string') {
                return data;
            }
            // If data is an array, format each item
            else if (Array.isArray(data)) {
                return data.map(item => typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)).join('\n');
            }
            // If data is an object, format it nicely
            else if (typeof data === 'object' && data !== null) {
                return Object.entries(data)
                    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
                    .join('\n');
            }
            // Fallback
            return String(data);
    }
}

/**
 * Format and export data in specified format
 * @param {Object} data - Data to export
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 */
function log(level, message, data) {
    const levelValue = LOG_LEVELS[level] || 0;
    
    if (levelValue > currentLogLevel) {
        return;
    }
    
    // Create timestamp
    const timestamp = timestampEnabled ? new Date().toISOString() : '';
    
    // Determine level color
    let levelColor = '';
    if (useColors) {
        switch (level) {
            case 'ERROR': levelColor = COLORS.fg.red; break;
            case 'WARN': levelColor = COLORS.fg.yellow; break;
            case 'INFO': levelColor = COLORS.fg.green; break;
            case 'DEBUG': levelColor = COLORS.fg.cyan; break;
            case 'TRACE': levelColor = COLORS.fg.white; break;
        }
    }
    
    // Format the message
    const formattedMessage = formatConsoleOutput(
        `${timestamp} ${levelColor}${level}${COLORS.reset} ${message}`,
        data
    );
    
    // Output to console
    const consoleMethod = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log';
    console[consoleMethod](formattedMessage);
    
    // Output data in appropriate format if present
    if (data !== undefined && typeof data === 'object') {
        console.dir(data, { depth: null, colors: useColors });
    }
}

/**
 * Logs an error message
 * @param {string} message - Error message
 * @param {Object} data - Additional data to log
 */
function error(message, data) {
    log('ERROR', message, data);
}

/**
 * Logs a warning message
 * @param {string} message - Warning message
 * @param {Object} data - Additional data to log
 */
function warn(message, data) {
    log('WARN', message, data);
}

/**
 * Logs an info message
 * @param {string} message - Info message
 * @param {Object} data - Additional data to log
 */
function info(message, data) {
    log('INFO', message, data);
}

/**
 * Logs a debug message
 * @param {string} message - Debug message
 * @param {Object} data - Additional data to log
 */
function debug(message, data) {
    log('DEBUG', message, data);
}

/**
 * Logs a trace message
 * @param {string} message - Trace message
 * @param {Object} data - Additional data to log
 */
function trace(message, data) {
    log('TRACE', message, data);
}

/**
 * Creates a logger for a specific module
 * @param {string} moduleName - Name of the module
 * @returns {Object} Module-specific logger
 */
function createModuleLogger(moduleName) {
    return {
        error: (message, data) => error(`[${moduleName}] ${message}`, data),
        warn: (message, data) => warn(`[${moduleName}] ${message}`, data),
        info: (message, data) => info(`[${moduleName}] ${message}`, data),
        debug: (message, data) => debug(`[${moduleName}] ${message}`, data),
        trace: (message, data) => trace(`[${moduleName}] ${message}`, data)
    };
}

export {
    error,
    warn,
    info,
    debug,
    trace,
    createModuleLogger
}; 