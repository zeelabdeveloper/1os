const jwt = require("jsonwebtoken");

/**
 * Middleware to verify JWT token from cookies or Authorization header
 */
exports.onlyTokenVerify = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const token = req.cookies.token || tokenFromHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

   
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        let message = "Invalid token.";
        if (err.name === "TokenExpiredError") {
          message = "Token has expired.";
        } else if (err.name === "JsonWebTokenError") {
          message = "Invalid token.";
        } else if (err.name === "NotBeforeError") {
          message = "Token not active yet.";
        }

        return res.status(401).json({
          success: false,
          message,
        });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during token verification.",
    });
  }
};
