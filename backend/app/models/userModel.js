const db = require('../../database');
const bcrypt = require('bcryptjs'); // Password encryption dependency (requires npm install bcryptjs)

// Input validation function
const validateUserData = (userData) => {
  const { first_name, last_name, email, password } = userData;
  const errors = [];

  // Validate required fields
  if (!first_name || first_name.trim() === '') errors.push('first_name is required');
  if (!last_name || last_name.trim() === '') errors.push('last_name is required');
  if (!email || email.trim() === '') errors.push('email is required');
  if (!password) errors.push('password is required');

  // Validate email format
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('invalid email format');
  }

  // Validate field types
  if (first_name && typeof first_name !== 'string') errors.push('first_name must be a string');
  if (last_name && typeof last_name !== 'string') errors.push('last_name must be a string');
  if (email && typeof email !== 'string') errors.push('email must be a string');
  if (password && typeof password !== 'string') errors.push('password must be a string');

  return errors;
};

// 1. Register new user (returns new user ID)
exports.createUser = async (userData) => {
  // Input validation
  const validationErrors = validateUserData(userData);
  if (validationErrors.length > 0) {
    throw new Error(`Invalid user data: ${validationErrors.join(', ')}`);
  }

  const { first_name, last_name, email, password } = userData;

  try {
    // Check if email already exists (avoid relying on database constraints)
    const existingUser = await exports.getUserByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Generate salt + hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const sql = `
      INSERT INTO users (first_name, last_name, email, password, salt)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      first_name.trim(),
      last_name.trim(),
      email.trim().toLowerCase(), // Convert email to lowercase uniformly
      hashedPassword,
      salt
    ];

    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) {
          // Double insurance: handle database-level constraint errors
          if (err.code === 'SQLITE_CONSTRAINT') {
            reject(new Error('Email already registered'));
          } else {
            reject(new Error(`Database error: ${err.message}`));
          }
        } else {
          resolve(this.lastID); // Return auto-incremented user_id
        }
      });
    });
  } catch (err) {
    // Unified error handling
    if (err.message === 'Email already registered') {
      throw err;
    }
    throw new Error(`Failed to create user: ${err.message}`);
  }
};

// 2. Query user by email (for login verification)
exports.getUserByEmail = (email) => {
  if (!email) {
    return Promise.reject(new Error('email is required'));
  }

  // Convert email to lowercase uniformly for query, avoid case sensitivity issues
  const normalizedEmail = email.trim().toLowerCase();

  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail], (err, row) => {
      if (err) {
        reject(new Error(`Database error: ${err.message}`));
      } else {
        resolve(row || null); // Return null if not found
      }
    });
  });
};

// 3. Verify password
exports.verifyPassword = async (inputPassword, storedHash) => {
  if (!inputPassword || !storedHash) {
    throw new Error('inputPassword and storedHash are required');
  }

  try {
    return await bcrypt.compare(inputPassword, storedHash);
  } catch (err) {
    throw new Error(`Password verification failed: ${err.message}`);
  }
};

// 4. New: Query user by ID
exports.getUserById = (userId) => {
  if (!userId || isNaN(Number(userId))) {
    return Promise.reject(new Error('valid user ID is required'));
  }

  return new Promise((resolve, reject) => {
    db.get('SELECT user_id, first_name, last_name, email FROM users WHERE user_id = ?', 
      [userId], 
      (err, row) => {
        if (err) {
          reject(new Error(`Database error: ${err.message}`));
        } else {
          resolve(row || null);
        }
      }
    );
  });
};
    