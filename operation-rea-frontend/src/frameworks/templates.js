/**
 * Framework Templates Module
 * Contains template functions for different ethical frameworks
 */

/**
 * Get a utilitarian template for justifications
 * @param {string} action - The recommended action
 * @param {Object} params - Parameters for the template
 * @returns {string} A formatted justification
 */
export function getUtilitarianTemplate(action, params) {
  if (params.valueA === params.valueB) {
    return `Equal ${params.metricName} values (${params.valueA} vs ${params.valueB}) lead to a default recommendation based on secondary considerations.`;
  }
  
  return `Option ${params.higher} has ${params.ratio === Infinity ? "∞" : params.ratio ? params.ratio.toFixed(1) : '?'}x higher ${params.metricName} ` +
         `(${Math.max(params.valueA, params.valueB)} vs ${Math.min(params.valueA, params.valueB)}) ` +
         `indicating greater overall benefit.`;
}

/**
 * Get a deontological template for justifications
 * @param {string} action - The recommended action
 * @param {Object} params - Parameters for the template
 * @returns {string} A formatted justification
 */
export function getDeontologicalTemplate(action, params) {
  if (params.valueA === params.valueB) {
    return `Equal ${params.metricName} values (${params.valueA} vs ${params.valueB}) require deliberation to fulfill competing moral duties.`;
  }
  
  return `Option ${params.higher} has ${params.ratio === Infinity ? "∞" : params.ratio ? params.ratio.toFixed(1) : '?'}x higher ${params.metricName} ` +
         `(${Math.max(params.valueA, params.valueB)} vs ${Math.min(params.valueA, params.valueB)}) ` +
         `presenting stronger moral obligation.`;
}

/**
 * Get a virtue ethics template for justifications
 * @param {string} action - The recommended action
 * @param {Object} params - Parameters for the template
 * @returns {string} A formatted justification
 */
export function getVirtueEthicsTemplate(action, params) {
  if (action === 'negotiate_compromises') {
    return `Character virtues of compassion and practical wisdom suggest negotiation.`;
  } else if (action === 'approve_option_b') {
    return `Virtue of courage suggests taking decisive action in urgent situations.`;
  }
  
  return `Option ${params.higher} better expresses moral virtues through a balance of ${params.metricName}.`;
}

/**
 * Get a care ethics template for justifications
 * @param {string} action - The recommended action
 * @param {Object} params - Parameters for the template
 * @returns {string} A formatted justification
 */
export function getCareEthicsTemplate(action, params) {
  if (params.valueA === params.valueB) {
    return `Equal ${params.metricName} values (${params.valueA} vs ${params.valueB}) suggest a balanced approach to care relationships.`;
  }
  
  return `Option ${params.higher} has ${params.ratio === Infinity ? "∞" : params.ratio ? params.ratio.toFixed(1) : '?'}x higher ${params.metricName} ` +
         `(${Math.max(params.valueA, params.valueB)} vs ${Math.min(params.valueA, params.valueB)}) ` +
         `supporting critical care relationships.`;
}

/**
 * Get a justice template for justifications
 * @param {string} action - The recommended action
 * @param {Object} params - Parameters for the template
 * @returns {string} A formatted justification
 */
export function getJusticeTemplate(action, params) {
  if (params.valueA === params.valueB) {
    return `Equal ${params.metricName} values (${params.valueA} vs ${params.valueB}) shift the focus to fair process rather than outcomes.`;
  }
  
  return `Option ${params.higher} has ${params.ratio === Infinity ? "∞" : params.ratio ? params.ratio.toFixed(1) : '?'}x higher ${params.metricName} ` +
         `(${Math.max(params.valueA, params.valueB)} vs ${Math.min(params.valueA, params.valueB)}) ` +
         `serving more people fairly.`;
}

/**
 * Get a resolution template based on strategy
 * @param {string} strategy - The resolution strategy
 * @param {Object} params - Parameters for the template
 * @returns {string} A formatted reasoning
 */
export function getResolutionTemplate(strategy, params) {
  // Create default templates for different strategies
  switch (strategy) {
    case 'framework_balancing':
      return `This resolution balances the ethical considerations from ${params.framework1} and ${params.framework2}. ` +
             `While ${params.framework1} emphasizes ${params.recommendation1}, and ${params.framework2} emphasizes ${params.recommendation2}, ` +
             `a balanced approach weighs the relative importance of each framework in this specific context.`;
             
    case 'principled_priority':
      return `This resolution prioritizes the ethical considerations of one framework over another based on principled reasons. ` +
             `In this case, the principles of one framework take precedence because they more directly address the core ethical issues at stake.`;
             
    case 'duty_bounded_utilitarianism':
      return `This hybrid approach applies utilitarian reasoning within deontological constraints. ` +
             `While maximizing overall benefit is important, this must occur within boundaries set by moral duties and rights.`;
             
    case 'virtue_guided_consequentialism':
      return `This hybrid approach evaluates consequences through the lens of virtuous character. ` +
             `The analysis considers not just what outcomes might occur, but what character traits would be developed through different actions.`;
             
    case 'care_based_justice':
      return `This hybrid approach integrates care ethics with justice principles. ` +
             `Fair distribution is important, but must be contextualized within caring relationships and responsiveness to particular needs.`;
             
    default:
      return `This resolution addresses the conflict between different ethical perspectives, ` +
             `recognizing the tension points while seeking a path forward that respects the key insights from each approach.`;
  }
}

// Export all templates as a collection for easier imports
export const templates = {
  utilitarian: getUtilitarianTemplate,
  deontological: getDeontologicalTemplate,
  virtueEthics: getVirtueEthicsTemplate,
  careEthics: getCareEthicsTemplate,
  justice: getJusticeTemplate,
  resolution: getResolutionTemplate
}; 