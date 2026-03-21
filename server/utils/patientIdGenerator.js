/**
 * Patient ID Generator Utility
 * Generates unique, human-readable patient IDs.
 * Format: PAT-YYYY-XXXXXX
 * Example: PAT-2024-047291
 */

/**
 * Generate a new patient ID based on current year and random 6-digit number.
 *
 * @returns {string} Patient ID in format PAT-YYYY-XXXXXX
 */
const generatePatientId = () => {
  const year = new Date().getFullYear(); // e.g., 2024

  // Generate a random 6-digit number (padded with leading zeros if needed)
  const randomNumber = Math.floor(Math.random() * 900000) + 100000; // 100000-999999

  return `PAT-${year}-${randomNumber}`;
};

module.exports = { generatePatientId };
