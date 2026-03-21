/**
 * OTP Simulator Utility
 * Simulates OTP generation and sending for government ID verification.
 * In production, this would integrate with SMS/email providers like Twilio or SendGrid.
 * Here we just log the OTP to the console for demo purposes.
 */

/**
 * Generate a random 6-digit OTP string.
 *
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  // Generate a number between 100000 and 999999 for a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};

/**
 * Simulate sending an OTP to a phone number or email.
 * In production: replace this with actual SMS/email API call.
 *
 * @param {string} recipient - Phone number or email address
 * @param {string} otp - The OTP to send
 * @returns {{ success: boolean, message: string }}
 */
const sendOTP = (recipient, otp) => {
  // Log to console to simulate the OTP being sent
  console.log(`\n📱 [OTP SIMULATOR] Sending OTP to: ${recipient}`);
  console.log(`   OTP Code: ${otp}`);
  console.log(`   (In production, this would be sent via SMS/Email)\n`);

  return {
    success: true,
    message: 'OTP sent (simulated)',
  };
};

/**
 * Verify an OTP by comparing it with the stored one and checking expiry.
 *
 * @param {string} storedOTP - OTP stored in the database
 * @param {string} providedOTP - OTP entered by the user
 * @param {Date} expiresAt - When the OTP expires
 * @returns {boolean} True if OTP is valid and not expired
 */
const verifyOTP = (storedOTP, providedOTP, expiresAt) => {
  // Check if OTP has expired
  if (new Date() > new Date(expiresAt)) {
    return false; // OTP expired
  }

  // Compare the OTPs (simple string comparison)
  return storedOTP === providedOTP;
};

module.exports = { generateOTP, sendOTP, verifyOTP };
