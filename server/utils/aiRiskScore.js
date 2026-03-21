/**
 * AI Risk Score Utility (Simulated)
 * Calculates a risk score based on symptoms, duration, and severity.
 * In a real system, this would call an ML model or external AI API.
 * Here we simulate it with keyword matching and scoring logic.
 */

// Keywords that indicate HIGH risk situations (life-threatening)
const HIGH_RISK_KEYWORDS = [
  'chest pain',
  'heart attack',
  'stroke',
  'unconscious',
  'breathing',
  'severe bleeding',
  'seizure',
  'anaphylaxis',
  'overdose',
  'not breathing',
  'choking',
  'trauma',
  'head injury',
  'loss of consciousness',
];

// Keywords that indicate MEDIUM risk situations (needs attention)
const MEDIUM_RISK_KEYWORDS = [
  'fever',
  'vomiting',
  'pain',
  'fracture',
  'cut',
  'burn',
  'dizzy',
  'fainting',
  'infection',
  'allergic',
];

/**
 * Calculate a simulated AI risk score for a patient's situation.
 *
 * @param {string} symptoms - Patient's reported symptoms (free text)
 * @param {number} duration - How long the symptoms have been present (in hours)
 * @param {number} severity - Self-reported severity from 1 (mild) to 10 (extreme)
 * @returns {{ score: number, level: string, recommendation: string }}
 */
const calculateRiskScore = (symptoms = '', duration = 0, severity = 1) => {
  const symptomsLower = symptoms.toLowerCase();

  // Check if any HIGH risk keyword is mentioned in the symptoms
  const hasHighKeyword = HIGH_RISK_KEYWORDS.some((keyword) =>
    symptomsLower.includes(keyword)
  );

  // Check if any MEDIUM risk keyword is mentioned in the symptoms
  const hasMediumKeyword = MEDIUM_RISK_KEYWORDS.some((keyword) =>
    symptomsLower.includes(keyword)
  );

  let score;
  let level;
  let recommendation;

  if (severity >= 8 || hasHighKeyword) {
    // HIGH RISK: Immediate emergency response needed
    score = Math.floor(Math.random() * 21) + 80; // 80-100
    level = 'high';
    recommendation =
      'IMMEDIATE EMERGENCY CARE REQUIRED. Call 108 now. Do not wait.';
  } else if (severity >= 5 || hasMediumKeyword) {
    // MEDIUM RISK: Urgent but not immediately life-threatening
    score = Math.floor(Math.random() * 40) + 40; // 40-79
    level = 'medium';
    recommendation =
      'Urgent medical attention recommended. Visit nearest hospital or book a priority appointment.';
  } else {
    // LOW RISK: Can be managed with a regular appointment
    score = Math.floor(Math.random() * 39) + 1; // 1-39
    level = 'low';
    recommendation =
      'Risk appears low. Please book a regular appointment. Monitor your symptoms.';
  }

  // Duration bonus: If symptoms lasted more than 24 hours, add 10 points
  if (duration > 24) {
    score = Math.min(score + 10, 100); // Cap at 100

    // Re-evaluate level after the bonus
    if (score >= 80) level = 'high';
    else if (score >= 40) level = 'medium';
  }

  return { score, level, recommendation };
};

module.exports = { calculateRiskScore };
