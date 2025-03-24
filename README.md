# Operation REA

Clean implementation of the Responsible Ethical Automation (REA) system for analyzing and resolving ethical dilemmas.

## Prerequisites

- Node.js v16.0.0 or higher
- Git (for version control)

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/operation-rea.git
cd operation-rea

# Install dependencies for backend
npm install
```

## Project Components

This project consists of two main components:

1. **REA Backend**: Core REA system for ethical analysis and conflict resolution
2. **Next.js Frontend**: Web interface for interacting with the REA system

## Running the Backend System

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

## Running the Frontend Application

```bash
# Navigate to the frontend directory
cd operation-rea-frontend

# Install dependencies
npm install

# Set up environment variables 
# Create a .env.local file with GitHub OAuth credentials
# (See Authentication Setup section below)

# Start the development server
npm run dev
```

Visit `http://localhost:3000` to access the web interface.

## Authentication Setup

The frontend uses NextAuth.js with GitHub provider for authentication. To set it up:

1. Create a GitHub OAuth app at `https://github.com/settings/developers`
2. Set the Authorization callback URL to `http://localhost:3000/api/auth/callback/github`
3. Create a `.env.local` file in the `operation-rea-frontend` directory with:

```
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key
```

## Project Structure

### Frontend (`operation-rea-frontend/`)

- `src/app/`: Next.js application routes and API endpoints
- `src/components/`: React components for the frontend interface
- `src/hooks/`: Custom React hooks for data fetching
- `src/lib/`: Utility functions and shared libraries
- `public/`: Static assets

### Backend Root Files

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

## Frontend Features

The Next.js frontend provides a modern, user-friendly interface for working with the REA system:

1. **Authentication**: Sign in with GitHub using NextAuth.js
2. **Dilemma Management**: Browse, create, and edit ethical dilemmas
3. **Analysis Dashboard**: View real-time analysis results with visual representations
4. **Interactive Interface**: Intuitive interface for exploring ethical frameworks and their recommendations

## Frontend-Backend Integration

The frontend integrates with the REA backend through:

1. **Shared Code**: Core REA modules are imported directly in the frontend for consistent processing
2. **API Endpoints**: REST API endpoints for analysis and dilemma management
3. **Authentication Flow**: User authentication to secure sensitive operations

## Recent Improvements

The codebase has recently been enhanced with several key improvements:

### Next.js Frontend Addition

- **Modern UI**: Clean, responsive interface built with Next.js 14 and Tailwind CSS
- **User Authentication**: Secure authentication flow using NextAuth.js with GitHub provider
- **Seamless Integration**: Direct integration with the REA backend system

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

You can add new dilemmas either:
- Directly through the frontend interface using the "Create Dilemma" form
- By adding JSON files to the `dilemmas/` directory in the project

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ using Next.js, Node.js, and ethical principles
