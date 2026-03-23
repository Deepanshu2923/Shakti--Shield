import jwt from "jsonwebtoken";

/**
 * Middleware to verify if a user is authenticated via JWT cookie.
 * 
 * Checks if the request has a valid JWT token in cookies.
 * If valid → attaches user data to req.user and calls next().
 * If invalid → responds with 401 Unauthorized.
 */
const Authenticated = (req, res, next) => {
    const token = req.cookies.jwt;

    // If no token is found, user is not authenticated
    if (!token) {
        return res.status(401).json({
            authenticated: false,
            message: "No token provided"
        });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = { id: decoded.id };

        // Call the next middleware or route handler
        next();
    } catch (error) {
        console.error("JWT verification failed:", error.message);

        return res.status(401).json({
            authenticated: false,
            message: "Invalid or expired token"
        });
    }
};

export { Authenticated };
