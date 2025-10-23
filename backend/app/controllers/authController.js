const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'eventitude_2025_secret';

// Used to store valid tokens for logged-in users (temporary solution for development environment)
const activeTokens = new Map(); // key: user_id, value: { token, expiresAt }

// Login handler
exports.login = async (req, res) => {
  try {
    const { email, password, ...extraFields } = req.body;

    // Print the requested email and password (for testing only, remove in production)
    console.log('Login request - Email:', email, 'Password:', password);

    // 1. Check for extra fields
    if (Object.keys(extraFields).length > 0) {
      console.log('Login failed - Extra fields present:', extraFields); // Added log
      return res.status(400).json({
        error_message: 'Request contains invalid fields'
      });
    }

    // 2. Check required fields
    if (!email || !password) {
      console.log('Login failed - Missing email or password'); // Added log
      return res.status(400).json({
        error_message: 'email and password are required fields'
      });
    }

    // 3. Query user
    const user = await userModel.getUserByEmail(email);
    console.log('User found:', user); // Added log: print query results (important!)

    if (!user) {
      console.log('Login failed - User not found, email:', email); // Added log
      return res.status(400).json({
        error_message: 'Invalid email or password'
      });
    }

    // 4. Validate password
    const isPasswordValid = await userModel.verifyPassword(password, user.password);
    console.log('Password validation result:', isPasswordValid); // Added log: print validation result (important!)
    console.log('Password stored in database:', user.password); // Added log: print password in database

    if (!isPasswordValid) {
      console.log('Login failed - Password validation failed'); // Added log
      return res.status(400).json({
        error_message: 'Invalid email or password'
      });
    }

    // 5. Check if there is already a valid token, reuse if so
    const existingToken = activeTokens.get(user.user_id);
    if (existingToken && existingToken.expiresAt > Date.now()) {
      console.log('Login successful - Reusing existing token'); // Added log
      return res.status(200).json({
        user_id: user.user_id,
        session_token: existingToken.token
      });
    }

    // 6. Generate a new token and store it
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    activeTokens.set(user.user_id, {
      token,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });

    console.log('Login successful - New token generated'); // Added log
    res.status(200).json({
      user_id: user.user_id,
      session_token: token
    });

  } catch (err) {
    console.error('Login error:', err); // Added log: print error details
    res.status(500).json({
      error_message: 'Login failed: ' + err.message
    });
  }
};

// Logout handler (no changes made)
exports.logout = async (req, res) => {
  try {
    const token = req.get('X-Authorization');
    
    if (!token) {
      return res.status(401).json({
        error_message: 'Authentication token not provided'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        error_message: 'Invalid token'
      });
    }

    activeTokens.delete(decoded.user_id);
    res.status(200).send();

  } catch (err) {
    res.status(500).json({
      error_message: 'Logout failed: ' + err.message
    });
  }
};