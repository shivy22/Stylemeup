// const jwt = require("jsonwebtoken");

// function authenticateToken(req, res, next) {
//     const token = req.header("Authorization")?.split(" ")[1]; // Extract token

//     if (!token) {
//         return res.status(401).json({ message: "Access Denied. No token provided." });
//     }

//     try {
//         const verified = jwt.verify(token, process.env.secret);
//         req.user = verified; // Attach user data (userId) to request
//         next();
//     } catch (err) {
//         res.status(403).json({ message: "Invalid Token" });
//     }
// }

// module.exports = authenticateToken;
