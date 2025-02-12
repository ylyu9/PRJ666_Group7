import express from "express";
import { protect } from "../middleware/authMiddleware.js";

// Import the controllers from the controllers folder 
import { signup, login, logout, googleAuth, requestPasswordReset, resetPassword } from "../controllers/auth.controllers.js";
const router = express.Router();

// Defind the routes for signup, login, and logout
router.post("/signup", signup); // localhost:4000/api/auth/signup
router.post("/login", login); // localhost:4000/api/auth/login
router.get("/logout", protect, logout); // localhost:4000/api/auth/logout

// Google login route
router.post("/googleAuth", googleAuth); // localhost:4000/api/auth/googleAuth

// Password reset routes
router.post("/requestPasswordReset", requestPasswordReset); // localhost:4000/api/auth/requestPasswordReset
router.post("/resetPassword", resetPassword); // localhost:4000/api/auth/resetPassword

// Export the router
export default router;
