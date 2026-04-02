import jwt from "jsonwebtoken";

// generate a token during signing up
export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d", // meaning a token only last for 7 days
    });

    // send token to user in a cookie
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in millisecs 
        httpOnly: true, // prevent XSS attacks cross-site scripting attacks 
        sameSite: "strict", // CSRF attacks cross-site request forgery attacks
        secure: process.env.NODE_ENV !== "development", 
    });

    return token;
}