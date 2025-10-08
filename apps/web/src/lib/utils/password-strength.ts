/**
 * Password validator utilities
 * Converted from utils/password-strength.js
 */

// Theme colors for password strength (using CSS variables or theme values)
const STRENGTH_COLORS = {
  error: '#f44336',
  warning: '#ffc107', 
  orange: '#ffab91',
  success: '#00e676',
  successDark: '#00c853',
} as const

export interface PasswordStrength {
  label: string
  color: string
}

/**
 * Check if password has numbers
 */
const hasNumber = (value: string): boolean => {
  return new RegExp(/[0-9]/).test(value)
}

/**
 * Check if password has mixed case (both lowercase and uppercase)
 */
const hasMixed = (value: string): boolean => {
  return new RegExp(/[a-z]/).test(value) && new RegExp(/[A-Z]/).test(value)
}

/**
 * Check if password has special characters
 */
const hasSpecial = (value: string): boolean => {
  return new RegExp(/[!#@$%^&*)(+=._-]/).test(value)
}

/**
 * Get password strength color and label based on count
 */
export const strengthColor = (count: number): PasswordStrength => {
  if (count < 2) return { label: 'Poor', color: STRENGTH_COLORS.error }
  if (count < 3) return { label: 'Weak', color: STRENGTH_COLORS.warning }
  if (count < 4) return { label: 'Normal', color: STRENGTH_COLORS.orange }
  if (count < 5) return { label: 'Good', color: STRENGTH_COLORS.success }
  return { label: 'Strong', color: STRENGTH_COLORS.successDark }
}

/**
 * Calculate password strength indicator (0-5)
 */
export const strengthIndicator = (value: string): number => {
  let strengths = 0
  
  if (value.length > 5) strengths++
  if (value.length > 7) strengths++  
  if (hasNumber(value)) strengths++
  if (hasSpecial(value)) strengths++
  if (hasMixed(value)) strengths++
  
  return strengths
}

/**
 * Get complete password strength analysis
 */
export const getPasswordStrength = (password: string): PasswordStrength & { score: number } => {
  const score = strengthIndicator(password)
  const strength = strengthColor(score)
  
  return {
    ...strength,
    score,
  }
}

