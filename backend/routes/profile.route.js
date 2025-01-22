import express from "express";
import { uploadProfileImage } from "../controllers/profile.controllers.js"; // Import the uploadProfileImage controller
import { protect } from "../middleware/authMiddleware.js"; // Import protect middleware

const router = express.Router();

// Route for uploading profile images
router.post("/uploadProfileImage", protect, uploadProfileImage); // The endpoint for uploading profile images is localhost:4000/api/profile/uploadProfileImage

export default router;
