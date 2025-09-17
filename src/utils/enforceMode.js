// Enforce mode utilities for consent management

/**
 * Check if user needs to accept consent based on enforce mode
 * @param {string} enforceMode - 'login_gate', 'action_gate', or 'public'
 * @param {string} context - Current context ('login', 'action', 'public')
 * @param {boolean} hasAccepted - Whether user has already accepted
 * @param {number} graceDaysRemaining - Days remaining in grace period
 * @returns {object} { shouldEnforce: boolean, message: string }
 */
export const checkEnforcement = (enforceMode, context, hasAccepted, graceDaysRemaining = 0) => {
  // If already accepted, no enforcement needed
  if (hasAccepted) {
    return { shouldEnforce: false, message: null };
  }
  
  // If still in grace period, show warning but don't enforce
  if (graceDaysRemaining > 0) {
    return {
      shouldEnforce: false,
      message: `You have ${graceDaysRemaining} days remaining to accept the policy`
    };
  }
  
  // Check enforcement based on mode
  switch (enforceMode) {
    case 'login_gate':
      // Block at login
      if (context === 'login') {
        return {
          shouldEnforce: true,
          message: 'You must accept the policy to continue'
        };
      }
      break;
      
    case 'action_gate':
      // Block at specific actions
      if (context === 'action') {
        return {
          shouldEnforce: true,
          message: 'You must accept the policy to perform this action'
        };
      }
      break;
      
    case 'public':
      // Never enforce, just inform
      return {
        shouldEnforce: false,
        message: 'Please review and accept our updated policy'
      };
      
    default:
      return { shouldEnforce: false, message: null };
  }
  
  return { shouldEnforce: false, message: null };
};

/**
 * Get enforcement level display text
 * @param {string} enforceMode
 * @returns {object} { label: string, description: string, severity: string }
 */
export const getEnforcementDisplay = (enforceMode) => {
  const modes = {
    login_gate: {
      label: 'Login Gate',
      description: 'Users must accept before they can log in',
      severity: 'high',
      color: 'red'
    },
    action_gate: {
      label: 'Action Gate',
      description: 'Users must accept before performing specific actions',
      severity: 'medium',
      color: 'yellow'
    },
    public: {
      label: 'Public',
      description: 'Informational only, no enforcement',
      severity: 'low',
      color: 'green'
    }
  };
  
  return modes[enforceMode] || modes.public;
};

/**
 * Calculate grace period status
 * @param {Date} effectiveFrom - When policy becomes effective
 * @param {number} graceDays - Number of grace days
 * @returns {object} { inGracePeriod: boolean, daysRemaining: number, endDate: Date }
 */
export const calculateGracePeriod = (effectiveFrom, graceDays) => {
  const now = new Date();
  const effective = new Date(effectiveFrom);
  const graceEndDate = new Date(effective);
  graceEndDate.setDate(graceEndDate.getDate() + graceDays);
  
  const daysRemaining = Math.ceil((graceEndDate - now) / (1000 * 60 * 60 * 24));
  
  return {
    inGracePeriod: now >= effective && now < graceEndDate,
    daysRemaining: Math.max(0, daysRemaining),
    endDate: graceEndDate
  };
};

export default {
  checkEnforcement,
  getEnforcementDisplay,
  calculateGracePeriod
};
