/**
 * Role Guard Middleware
 * Restricts route access based on user roles.
 * Must be used AFTER the auth middleware.
 *
 * Usage example:
 *   router.get('/admin-only', auth, roleGuard('admin'), handler)
 *   router.get('/doctors-patients', auth, roleGuard('doctor', 'patient'), handler)
 */

/**
 * Returns a middleware function that checks if req.user.role is allowed.
 *
 * @param {...string} roles - Roles that are permitted to access the route
 * @returns {import('express').RequestHandler}
 */
const roleGuard = (...roles) => (req, res, next) => {
  // Check if the logged-in user's role is in the allowed list
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role(s): ${roles.join(', ')}`,
    });
  }
  next();
};

module.exports = roleGuard;
