/**
 * REA Testing Framework - Dilemma Templates
 * A collection of scenario templates for different ethical dilemma types
 */

/**
 * Base dilemma template with required structure
 */
export const baseTemplate = {
    id: "base-template",
    title: "Base Dilemma Template",
    description: "Template for all REA dilemmas",
    
    parameters: {},
    contextual_factors: {},
    stakeholders: [],
    frameworks: ["utilitarian", "deontology", "virtue_ethics"],
    
    test_metadata: {
      version: "1.0",
      author: "REA Testing Framework",
      complexity_level: 1,
      tags: ["template"],
      known_issues: []
    }
  };
  
  /**
   * Resource allocation scenario template
   */
  export const resourceAllocationTemplate = {
    id: "resource-allocation-template",
    title: "Resource Allocation Dilemma",
    description: "Deciding how to allocate limited resources among competing needs",
    
    parameters: {
      available_resources: { value: 1000000, unit: "dollars", description: "Total budget available" },
      population_served_option_a: { value: 5000, unit: "people", description: "Number of people served by option A" },
      population_served_option_b: { value: 2000, unit: "people", description: "Number of people served by option B" },
      benefit_per_person_option_a: { value: 100, unit: "utility", description: "Average benefit per person from option A" },
      benefit_per_person_option_b: { value: 300, unit: "utility", description: "Average benefit per person from option B" },
      urgency_option_a: { value: 0.7, unit: "score", description: "Urgency score for option A" },
      urgency_option_b: { value: 0.9, unit: "score", description: "Urgency score for option B" },
      resource_cost_option_a: { value: 600000, unit: "dollars", description: "Total cost for option A" },
      resource_cost_option_b: { value: 800000, unit: "dollars", description: "Total cost for option B" }
    },
    
    contextual_factors: {
      scarcity_level: { value: "high", description: "Overall resource scarcity context" },
      decision_timeframe: { value: "immediate", description: "How quickly the decision must be made" },
      political_pressure: { value: "moderate", description: "Level of political influence on the decision" },
      public_opinion: { value: "divided", description: "Overall public sentiment" }
    },
    
    stakeholders: [
      {
        id: "general_public",
        name: "General Public",
        interests: ["efficiency", "fairness", "transparency"],
        values: ["maximizing_benefit", "equal_access"],
        influence: 0.6,
        concerns: ["population_served_option_a", "population_served_option_b"]
      },
      {
        id: "option_a_beneficiaries",
        name: "Option A Beneficiaries",
        interests: ["receiving_resources", "prioritization"],
        values: ["need_recognition", "support"],
        influence: 0.4,
        concerns: ["benefit_per_person_option_a", "resource_cost_option_a", "urgency_option_a"]
      },
      {
        id: "option_b_beneficiaries",
        name: "Option B Beneficiaries",
        interests: ["receiving_resources", "prioritization"],
        values: ["need_recognition", "support"],
        influence: 0.5,
        concerns: ["benefit_per_person_option_b", "resource_cost_option_b", "urgency_option_b"]
      },
      {
        id: "resource_managers",
        name: "Resource Managers",
        interests: ["efficiency", "accountability", "sustainability"],
        values: ["responsible_stewardship", "maximizing_impact"],
        influence: 0.8,
        concerns: ["available_resources", "resource_cost_option_a", "resource_cost_option_b"]
      }
    ],
    
    frameworks: ["utilitarian", "deontology", "virtue_ethics", "justice"],
    
    expected_outcomes: {
      utilitarian: {
        original_action: "approve_option_b",
        adapted_action: "approve_option_b",
        parameter_sensitivities: ["benefit_per_person_option_a", "benefit_per_person_option_b", "population_served_option_a", "population_served_option_b"]
      },
      justice: {
        original_action: "approve_option_a",
        adapted_action: "approve_option_a",
        parameter_sensitivities: ["population_served_option_a", "population_served_option_b"] 
      }
    },
    
    test_metadata: {
      version: "1.0",
      complexity_level: 2,
      tags: ["resource_allocation", "scarcity", "competing_needs"],
      parameter_modifications: {
        level1: ["available_resources", "urgency_option_a", "urgency_option_b"],
        level2: ["benefit_per_person_option_a", "benefit_per_person_option_b"],
        level3: ["population_served_option_a", "population_served_option_b"]
      }
    }
  };
  
  /**
   * Rights-based conflict scenario template
   */
  export const rightsBasedConflictTemplate = {
    id: "rights-conflict-template",
    title: "Rights-Based Ethical Conflict",
    description: "Conflict between competing rights or principles",
    
    parameters: {
      right_a_importance: { value: 0.8, unit: "score", description: "Social importance of right A" },
      right_b_importance: { value: 0.7, unit: "score", description: "Social importance of right B" },
      people_affected_right_a: { value: 10000, unit: "people", description: "Number of people whose right A is affected" },
      people_affected_right_b: { value: 5000, unit: "people", description: "Number of people whose right B is affected" },
      violation_severity_a: { value: 0.6, unit: "score", description: "Severity of violating right A" },
      violation_severity_b: { value: 0.8, unit: "score", description: "Severity of violating right B" },
      duration_impact_a: { value: 5, unit: "years", description: "Duration of impact from violating right A" },
      duration_impact_b: { value: 2, unit: "years", description: "Duration of impact from violating right B" },
      reversibility_a: { value: 0.3, unit: "score", description: "Reversibility of violating right A" },
      reversibility_b: { value: 0.7, unit: "score", description: "Reversibility of violating right B" }
    },
    
    contextual_factors: {
      legal_framework: { value: "established", description: "Legal framework around these rights" },
      social_consensus: { value: "divided", description: "Level of social consensus about these rights" },
      historical_context: { value: "complex", description: "Historical context relevant to the situation" },
      power_dynamics: { value: "unbalanced", description: "Power dynamics between affected parties" }
    },
    
    stakeholders: [
      {
        id: "right_a_holders",
        name: "Right A Holders",
        interests: ["protection", "recognition", "enforcement"],
        values: ["autonomy", "dignity", "security"],
        influence: 0.6,
        concerns: ["right_a_importance", "people_affected_right_a", "violation_severity_a"]
      },
      {
        id: "right_b_holders",
        name: "Right B Holders",
        interests: ["protection", "prioritization", "enforcement"],
        values: ["freedom", "equality", "privacy"],
        influence: 0.5,
        concerns: ["right_b_importance", "people_affected_right_b", "violation_severity_b"]
      },
      {
        id: "government",
        name: "Government Authorities",
        interests: ["stability", "conflict_resolution", "legitimacy"],
        values: ["rule_of_law", "compromise", "public_order"],
        influence: 0.8,
        concerns: ["right_a_importance", "right_b_importance", "reversibility_a", "reversibility_b"]
      }
    ],
    
    frameworks: ["deontology", "justice", "virtue_ethics", "utilitarian"],
    
    expected_outcomes: {
      deontology: {
        original_action: "protect_right_a",
        adapted_action: "protect_right_a",
        parameter_sensitivities: ["right_a_importance", "right_b_importance", "violation_severity_a", "violation_severity_b"]
      },
      justice: {
        original_action: "compromise_solution",
        adapted_action: "compromise_solution",
        parameter_sensitivities: ["people_affected_right_a", "people_affected_right_b"] 
      }
    },
    
    test_metadata: {
      version: "1.0",
      complexity_level: 3,
      tags: ["rights_conflict", "autonomy", "privacy", "justice"],
      parameter_modifications: {
        level1: ["violation_severity_a", "violation_severity_b"],
        level2: ["people_affected_right_a", "people_affected_right_b"],
        level3: ["right_a_importance", "right_b_importance"]
      }
    }
  };
  
  /**
   * Technology ethics scenario template
   */
  export const technologyEthicsTemplate = {
    id: "technology-ethics-template",
    title: "Technology Ethics Dilemma",
    description: "Ethical challenges arising from emerging technologies",
    
    parameters: {
      potential_benefit: { value: 8.5, unit: "score", description: "Potential benefits of the technology" },
      potential_harm: { value: 6.3, unit: "score", description: "Potential harms from the technology" },
      uncertainty_level: { value: 0.7, unit: "score", description: "Scientific uncertainty about effects" },
      affected_population_size: { value: 1000000, unit: "people", description: "Size of affected population" },
      vulnerability_index: { value: 0.4, unit: "score", description: "Vulnerability of affected populations" },
      remediation_cost: { value: 5000000, unit: "dollars", description: "Cost to remediate potential harms" },
      development_investment: { value: 20000000, unit: "dollars", description: "Investment in technology development" },
      alternative_options: { value: 2, unit: "count", description: "Number of viable alternatives" },
      privacy_impact: { value: 0.8, unit: "score", description: "Impact on privacy" },
      autonomy_impact: { value: 0.6, unit: "score", description: "Impact on individual autonomy" }
    },
    
    contextual_factors: {
      regulatory_framework: { value: "emerging", description: "State of regulations for this technology" },
      public_understanding: { value: "limited", description: "Level of public understanding of the technology" },
      market_pressure: { value: "high", description: "Market pressure to deploy the technology" },
      industry_concentration: { value: "oligopoly", description: "Level of industry concentration" },
      global_implications: { value: "significant", description: "Global implications of the technology" }
    },
    
    stakeholders: [
      {
        id: "technology_developers",
        name: "Technology Developers",
        interests: ["innovation", "profit", "market_share"],
        values: ["progress", "efficiency", "competitive_advantage"],
        influence: 0.8,
        concerns: ["development_investment", "potential_benefit", "regulatory_framework"]
      },
      {
        id: "end_users",
        name: "End Users",
        interests: ["utility", "safety", "affordability"],
        values: ["convenience", "privacy", "autonomy"],
        influence: 0.5,
        concerns: ["potential_benefit", "potential_harm", "privacy_impact", "autonomy_impact"]
      },
      {
        id: "regulators",
        name: "Regulatory Bodies",
        interests: ["public_safety", "fair_markets", "innovation_support"],
        values: ["precaution", "accountability", "balanced_approach"],
        influence: 0.7,
        concerns: ["uncertainty_level", "potential_harm", "vulnerability_index"]
      },
      {
        id: "vulnerable_populations",
        name: "Vulnerable Populations",
        interests: ["protection", "inclusion", "representation"],
        values: ["equity", "justice", "safety"],
        influence: 0.3,
        concerns: ["vulnerability_index", "potential_harm", "autonomy_impact"]
      }
    ],
    
    frameworks: ["utilitarian", "deontology", "virtue_ethics", "justice", "care_ethics"],
    
    expected_outcomes: {
      utilitarian: {
        original_action: "approve_with_monitoring",
        adapted_action: "approve_with_monitoring",
        parameter_sensitivities: ["potential_benefit", "potential_harm", "affected_population_size"]
      },
      deontology: {
        original_action: "delay_for_further_study",
        adapted_action: "delay_for_further_study",
        parameter_sensitivities: ["privacy_impact", "autonomy_impact"] 
      },
      care_ethics: {
        original_action: "conditional_approval",
        adapted_action: "conditional_approval",
        parameter_sensitivities: ["vulnerability_index", "uncertainty_level"]
      }
    },
    
    test_metadata: {
      version: "1.0",
      complexity_level: 4,
      tags: ["technology", "innovation", "privacy", "autonomy", "uncertainty"],
      parameter_modifications: {
        level1: ["potential_benefit", "potential_harm"],
        level2: ["uncertainty_level", "privacy_impact"],
        level3: ["vulnerability_index", "autonomy_impact"]
      }
    }
  };
  
  /**
   * Environmental ethics scenario template
   */
  export const environmentalEthicsTemplate = {
    id: "environmental-ethics-template",
    title: "Environmental Ethics Dilemma",
    description: "Ethical challenges involving environmental impact and sustainability",
    
    parameters: {
      economic_benefit: { value: 75000000, unit: "dollars", description: "Economic benefit of the project" },
      jobs_created: { value: 500, unit: "jobs", description: "Number of jobs created" },
      carbon_emissions: { value: 50000, unit: "tons", description: "Annual carbon emissions" },
      habitat_destruction: { value: 200, unit: "acres", description: "Habitat area destroyed" },
      endangered_species_impact: { value: 3, unit: "count", description: "Number of endangered species affected" },
      water_usage: { value: 5000000, unit: "gallons", description: "Annual water usage" },
      pollution_level: { value: 0.7, unit: "score", description: "Level of pollution generated" },
      renewable_energy_generated: { value: 250000, unit: "kWh", description: "Renewable energy generated" },
      mitigation_investment: { value: 10000000, unit: "dollars", description: "Investment in environmental mitigation" },
      project_lifespan: { value: 30, unit: "years", description: "Expected project lifespan" }
    },
    
    contextual_factors: {
      local_economy_status: { value: "struggling", description: "Status of the local economy" },
      existing_environmental_health: { value: "moderate", description: "Current environmental health of the area" },
      community_support: { value: "divided", description: "Level of community support for the project" },
      policy_framework: { value: "evolving", description: "State of environmental policy framework" },
      alternative_options: { value: "limited", description: "Availability of alternative options" }
    },
    
    stakeholders: [
      {
        id: "local_community",
        name: "Local Community",
        interests: ["economic_growth", "job_creation", "environmental_health"],
        values: ["prosperity", "quality_of_life", "sustainability"],
        influence: 0.5,
        concerns: ["economic_benefit", "jobs_created", "pollution_level"]
      },
      {
        id: "environmental_groups",
        name: "Environmental Organizations",
        interests: ["conservation", "pollution_prevention", "species_protection"],
        values: ["ecological_integrity", "sustainability", "responsibility"],
        influence: 0.6,
        concerns: ["carbon_emissions", "habitat_destruction", "endangered_species_impact", "pollution_level"]
      },
      {
        id: "business_interests",
        name: "Business Interests",
        interests: ["profit", "growth", "regulatory_certainty"],
        values: ["economic_prosperity", "efficiency", "innovation"],
        influence: 0.8,
        concerns: ["economic_benefit", "jobs_created", "mitigation_investment"]
      },
      {
        id: "future_generations",
        name: "Future Generations",
        interests: ["resource_availability", "climate_stability", "biodiversity"],
        values: ["sustainability", "intergenerational_justice", "wellbeing"],
        influence: 0.2,
        concerns: ["carbon_emissions", "habitat_destruction", "endangered_species_impact", "project_lifespan"]
      }
    ],
    
    frameworks: ["utilitarian", "deontology", "virtue_ethics", "justice", "care_ethics"],
    
    expected_outcomes: {
      utilitarian: {
        original_action: "approve_with_modifications",
        adapted_action: "approve_with_modifications",
        parameter_sensitivities: ["economic_benefit", "jobs_created", "carbon_emissions", "pollution_level"]
      },
      justice: {
        original_action: "require_redesign",
        adapted_action: "require_redesign",
        parameter_sensitivities: ["habitat_destruction", "endangered_species_impact", "project_lifespan"] 
      },
      virtue_ethics: {
        original_action: "approve_with_community_oversight",
        adapted_action: "approve_with_community_oversight",
        parameter_sensitivities: ["mitigation_investment", "renewable_energy_generated"]
      }
    },
    
    test_metadata: {
      version: "1.0",
      complexity_level: 3,
      tags: ["environment", "sustainability", "economic_development", "conservation"],
      parameter_modifications: {
        level1: ["economic_benefit", "jobs_created"],
        level2: ["carbon_emissions", "pollution_level"],
        level3: ["habitat_destruction", "endangered_species_impact"]
      }
    }
  };
  
  /**
   * Healthcare ethics scenario template
   */
  export const healthcareEthicsTemplate = {
    id: "healthcare-ethics-template",
    title: "Healthcare Ethics Dilemma",
    description: "Ethical challenges in healthcare resource allocation and treatment decisions",
    
    parameters: {
      treatment_cost: { value: 500000, unit: "dollars", description: "Cost of treatment per patient" },
      treatment_efficacy: { value: 0.7, unit: "score", description: "Efficacy of the treatment" },
      patient_age: { value: 65, unit: "years", description: "Age of the typical patient" },
      quality_life_improvement: { value: 0.5, unit: "score", description: "Improvement in quality of life" },
      life_extension: { value: 5, unit: "years", description: "Expected life extension from treatment" },
      available_units: { value: 100, unit: "treatments", description: "Available treatment units" },
      patients_in_need: { value: 500, unit: "people", description: "Number of patients needing treatment" },
      alternative_cost: { value: 50000, unit: "dollars", description: "Cost of alternative treatment" },
      alternative_efficacy: { value: 0.3, unit: "score", description: "Efficacy of alternative treatment" },
      urgency_level: { value: 0.8, unit: "score", description: "Urgency of treatment need" }
    },
    
    contextual_factors: {
      healthcare_system_type: { value: "mixed", description: "Type of healthcare system" },
      resource_scarcity: { value: "high", description: "Level of healthcare resource scarcity" },
      public_funding: { value: "limited", description: "Availability of public funding" },
      social_safety_nets: { value: "moderate", description: "Strength of social safety nets" },
      innovation_environment: { value: "supportive", description: "Environment for medical innovation" }
    },
    
    stakeholders: [
      {
        id: "patients",
        name: "Patients Needing Treatment",
        interests: ["access_to_care", "affordability", "efficacy"],
        values: ["health", "quality_of_life", "dignity"],
        influence: 0.4,
        concerns: ["treatment_efficacy", "quality_life_improvement", "life_extension", "available_units"]
      },
      {
        id: "healthcare_providers",
        name: "Healthcare Providers",
        interests: ["patient_outcomes", "clinical_effectiveness", "operational_feasibility"],
        values: ["care", "professionalism", "evidence_based_practice"],
        influence: 0.7,
        concerns: ["treatment_efficacy", "alternative_efficacy", "urgency_level"]
      },
      {
        id: "payers",
        name: "Healthcare Payers",
        interests: ["cost_control", "population_health", "sustainability"],
        values: ["fiscal_responsibility", "equity", "system_viability"],
        influence: 0.8,
        concerns: ["treatment_cost", "alternative_cost", "patients_in_need"]
      },
      {
        id: "society",
        name: "Broader Society",
        interests: ["healthcare_access", "cost_containment", "fairness"],
        values: ["equity", "compassion", "efficiency"],
        influence: 0.5,
        concerns: ["patients_in_need", "treatment_cost", "life_extension"]
      }
    ],
    
    frameworks: ["utilitarian", "deontology", "virtue_ethics", "justice", "care_ethics"],
    
    expected_outcomes: {
      utilitarian: {
        original_action: "approve_limited_coverage",
        adapted_action: "approve_limited_coverage",
        parameter_sensitivities: ["treatment_efficacy", "quality_life_improvement", "life_extension", "patients_in_need"]
      },
      justice: {
        original_action: "develop_lottery_system",
        adapted_action: "develop_lottery_system",
        parameter_sensitivities: ["available_units", "patients_in_need", "treatment_cost"] 
      },
      care_ethics: {
        original_action: "prioritize_most_vulnerable",
        adapted_action: "prioritize_most_vulnerable",
        parameter_sensitivities: ["patient_age", "urgency_level", "quality_life_improvement"]
      }
    },
    
    test_metadata: {
      version: "1.0",
      complexity_level: 4,
      tags: ["healthcare", "resource_allocation", "treatment_access", "medical_ethics"],
      parameter_modifications: {
        level1: ["treatment_cost", "treatment_efficacy"],
        level2: ["available_units", "patients_in_need"],
        level3: ["life_extension", "quality_life_improvement"]
      }
    }
  };
  
  /**
   * Create a customized dilemma from one of the templates
   * @param {string} templateName - Name of the template to use (e.g., 'resourceAllocation')
   * @param {string} id - Unique ID for the new dilemma
   * @param {string} title - Title for the new dilemma
   * @param {Object} parameterOverrides - Values to override in the template parameters
   * @returns {Object} A new dilemma based on the template with overrides applied
   */
  export function createFromTemplate(templateName, id, title, parameterOverrides = {}) {
    let template;
    
    switch (templateName) {
      case 'resourceAllocation':
        template = resourceAllocationTemplate;
        break;
      case 'rightsBasedConflict':
        template = rightsBasedConflictTemplate;
        break;
      case 'technologyEthics':
        template = technologyEthicsTemplate;
        break;
      case 'environmentalEthics':
        template = environmentalEthicsTemplate;
        break;
      case 'healthcareEthics':
        template = healthcareEthicsTemplate;
        break;
      default:
        template = baseTemplate;
    }
    
    // Create a deep copy of the template
    const dilemma = JSON.parse(JSON.stringify(template));
    
    // Apply the basic overrides
    dilemma.id = id;
    dilemma.title = title;
    
    // Apply parameter overrides
    Object.entries(parameterOverrides).forEach(([param, value]) => {
      if (dilemma.parameters[param]) {
        dilemma.parameters[param].value = value;
      }
    });
    
    // Update test metadata
    dilemma.test_metadata.id = id;
    dilemma.test_metadata.created = new Date().toISOString();
    
    return dilemma;
  }
  
  // Export all templates as a collection
  export const templates = {
    base: baseTemplate,
    resourceAllocation: resourceAllocationTemplate,
    rightsBasedConflict: rightsBasedConflictTemplate,
    technologyEthics: technologyEthicsTemplate,
    environmentalEthics: environmentalEthicsTemplate,
    healthcareEthics: healthcareEthicsTemplate
  }; 