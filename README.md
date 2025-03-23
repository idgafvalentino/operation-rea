# Operation REA

Clean implementation of the Responsible Ethical Automation (REA) system.

## Running the system

```bash
# Process a dilemma file
node process-dilemma-direct.js dilemmas/medical-triage.json
```

## Core Components

- `process-dilemma-direct.js`: Main entry point
- `src/testing/reaTestAdapter.js`: Core REA pipeline
- `src/testing/reaTestFramework.js`: Framework validation
- `src/resolution/strategies.js`: Resolution strategies

