// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  // 1️⃣ Get token from Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // 2️⃣ Verify token with the same secret you used in login
    const decoded = jwt.verify(token, "secretkey"); 

    // 3️⃣ Attach decoded info to req.user so backend can use it
    req.user = { id: decoded.id, role: decoded.role };

    next(); // 4️⃣ Continue to the next middleware / route
  } catch (err) {
    console.error("JWT Error:", err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

module.exports = verifyToken;