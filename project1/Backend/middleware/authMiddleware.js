const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    // Look for the token in the request header
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    try {
        // Verify the token using the secret key from your .env file
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // This stores user ID and role for use in the routes
        next(); // Move to the next step (fetching data)
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
    }
};

module.exports = verifyToken;