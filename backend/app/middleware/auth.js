const jwt = require('jsonwebtoken');
// JWT secret (consistent with login logic)
const JWT_SECRET = 'eventitude_2025_secret';


// Authentication middleware: parse the X-Authorization Token in the request header
exports.authenticateToken = (req, res, next) => {
  // Get the token from the X-Authorization header (consistent with the test case's request header)
  const token = req.get('X-Authorization'); 

  if (!token) {
    return res.status(401).json({
      error_message: 'Login is required to access (missing X-Authorization Token)'
    });
  }

  // Validate token's validity
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        error_message: 'Token is invalid or has expired'
      });
    }
    // Attach the decoded user information (including user_id, email, etc.) to req for later use in controllers
    req.user = decoded; 
    next();
  });
};

exports.optionalAuthentication = (req, res, next) => {
  const token = req.get('X-Authorization');
  if (!token) {
    next();
  } else {
    // Validate token's validity
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          error_message: 'Token is invalid or has expired'
        });
      }
      // Attach the decoded user information (including user_id, email, etc.) to req for later use in controllers
      req.user = decoded; 
      next();
    });
  }
};