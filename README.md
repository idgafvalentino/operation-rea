# Operation REA

Clean implementation of the Responsible Ethical Automation (REA) system for analyzing and resolving ethical dilemmas.

## Prerequisites

- Node.js v16.0.0 or higher

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/operation-rea.git
cd operation-rea

# Install dependencies
npm install
```

## Running the system

```bash
# Process a dilemma file
node process-dilemma-direct.js dilemmas/medical-triage.json

# Or use the npm scripts
npm run process:medical
npm run process:parent-child

# Process with specific output format
node process-dilemma-direct.js dilemmas/parent-child-medical-dilemma.json --format=json

# Disable colored output
node process-dilemma-direct.js dilemmas/medical-triage.json --no-color
```

## Project Structure

### Root Files

- `process-dilemma-direct.js`: Main entry point that processes dilemmas through the full REA pipeline

### Dilemmas

- `dilemmas/`: Directory containing dilemma definitions in JSON format
  - `ai-governance-dilemma.json`: AI ethics and governance policy scenario
  - `corporate-responsibility.json`: Corporate social responsibility decision scenario
  - `environmental-development.json`: Environmental sustainability versus development scenario
  - `medical-triage.json`: Medical emergency triage scenario
  - `parent-child-medical-dilemma.json`: Scenario about child medical treatment vs religious beliefs

### Source Code (`src/`)

#### Core Components

- `src/core/`
  - `rea.js`: Central module that implements the core REA system functionality including processing, conflict detection, and resolution

#### Framework Components

- `src/frameworks/`
  - `templates.js`: Templates for different ethical frameworks with standardized structures for justifications

#### Analysis Components

- `src/analysis/`
  - `conflictAnalysis.js`: Comprehensive module for analyzing ethical conflicts, calculating framework distances, and identifying compromise areas
  - `frameworkAnalysis.js`: Analysis of dilemmas through different ethical frameworks
  - `multiFrameworkAnalysis.js`: Multi-framework comparative analysis
  - `causalDetection.js`: Identifies causal relationships in dilemma text
  - `causalGraph.js`: Implements graph representation of causal relationships
  - `consequenceSchema.js`: Defines schemas for consequence analysis
  - `sequential/`
    - `sequentialAnalysis.js`: Step-by-step sequential analysis implementation

#### Testing Framework

- `src/testing/`
  - `reaTestAdapter.js`: Adapter connecting testing framework to the core REA implementation
  - `reaTestFramework.js`: Validation framework for dilemmas and results
  - `dilemmaTemplates.js`: Templates for creating standardized dilemmas

#### Resolution Components

- `src/resolution/`
  - `core.js`: Core resolution functionality and framework normalization
  - `hybrid.js`: Implementation of hybrid resolution strategies
  - `strategies.js`: Collection of resolution strategies for different ethical conflicts
  - `weighting.js`: Functions for weighting ethical considerations

#### Adaptation Components

- `src/adaptation/`
  - `registry/`
    - `dilemmaAdapter.js`: Adapts dilemmas to standardized format for processing

#### Utility Functions

- `src/utils/`
  - `general.js`: General utility functions used throughout the system
  - `logging.js`: Logging and output formatting utilities
  - `parameterAccess.js`: Functions for accessing parameters in dilemmas
  - `parameterMapping.js`: Maps parameters between different formats

### Results

- `results/`: Directory where analysis results are saved

## Core Processing Pipeline

1. **Dilemma Loading**: Load and validate the dilemma file
2. **Framework Analysis**: Process through ethical frameworks (utilitarian, deontology, etc.)
3. **Stakeholder Impact**: Assess impact on all stakeholders
4. **Conflict Detection**: Identify conflicts between ethical frameworks
5. **Conflict Resolution**: Apply resolution strategies to resolve conflicts
6. **Recommendation**: Generate final recommendation with confidence level

## Recent Improvements

The codebase has recently been enhanced with several key improvements:

### Modular Architecture Refactoring

- **Framework Templates Module**: Extracted framework template functions into a dedicated module for better reusability
- **Conflict Analysis Module**: Implemented comprehensive conflict analysis with specialized functions for different aspects of conflict resolution
- **Core REA Module**: Restructured core functionality with clear boundaries and responsibilities
- **Reduced Duplication**: Eliminated redundant code by properly modularizing functionality
- **Improved Maintainability**: Reduced file sizes, cleaner imports, and better organized code structure

### Enhanced Conflict Resolution Strategies

- **Stakeholder CVaR Strategy**: Prioritizes interests of the most affected stakeholders using Conditional Value at Risk (CVaR) analysis
- **Pluralistic Strategy**: Acknowledges the validity of multiple ethical perspectives without forcing a single resolution
- **Balance Strategy**: Weighs competing values in context and proposes contextually appropriate resolutions

### Improved Similarity Metrics

- Enhanced semantic matching with synonym recognition for ethical terminology
- Multi-dimensional similarity calculation combining:
  - Containment analysis
  - Word overlap measurement
  - Edit distance calculation (Levenshtein)
  - Semantic similarity with ethical term mapping

### Enhanced Causal Detection

- Improved pattern recognition for identifying causal relationships in text
- More robust error handling for parsing edge cases
- Support for multiple causal relationship types (conditional, explanation, attribution, etc.)
- Confidence scoring for extracted causal statements

## Adding New Dilemmas

Create a new JSON file in the `dilemmas/` directory following the structure of existing dilemmas. Ensure it includes:

- Basic information (title, description)
- Parameters and constraints
- Stakeholders
- Possible actions
- Ethical dimensions

Run the dilemma through the system using the command shown in "Running the system".
