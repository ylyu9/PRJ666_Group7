import express from "express";

// Import the controllers from the controllers folder 
import { signup, login, logout, googleLogin } from "../controllers/auth.controllers.js";
const router = express.Router();

// Defind the routes for signup, login, and logout
router.get("/signup", signup);
router.get("/login", login);
router.get("/logout", logout);

// Google login route
router.post("/google", googleLogin);

// Export the router
export default router;
