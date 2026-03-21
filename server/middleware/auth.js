/**
 * Auth Middleware
 * Verifies the JWT token attached to incoming requests.
 * Protects routes from unauthenticated access.
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate requests using Bearer JWT tokens.
 * Attaches decoded user info to req.user if valid.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const auth = (req, res, next) => {
  // Get the Authorization header value
  const authHeader = req.headers.authorization;

  // Token must be in format: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Access denied.',
    });
  }

  // Extract the actual token part after "Bearer "
  const token = authHeader.split(' ')[1];

  try {
    // Verify token using the secret key from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to the request so downstream handlers can use it
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

module.exports = auth;
