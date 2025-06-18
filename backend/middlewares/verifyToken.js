const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization'];

  // Check if the Authorization header exists and starts with "Bearer"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'Access Denied!', status: 403 });
  }

  // Extract the token part from the "Bearer <token>" string
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using the secret key
    const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET_KEY);

    // Attach the decoded token data (e.g., user info) to the request object
    req.user = verifiedToken;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // If verification fails, respond with error details
    return res.status(500).json({
      message: error.message,
      status: 500,
    });
  }
};