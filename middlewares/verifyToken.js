const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization'];

  // "Authorization: Bearer <token>" kontrolü
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'Erişim Engellendi!', status: 403 });
  }

  const token = authHeader.split(' ')[1]; // "Bearer xyz" → "xyz"

  try {
    const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    req.user = verifiedToken;

    next(); // Her şey doğruysa devam et
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      status: 500,
    });
  }
};