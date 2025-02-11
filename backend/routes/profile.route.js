import express from "express";
import { uploadProfileImage, updatePersonalInfo, getUserProfile, checkProfileCompletionController } from "../controllers/profile.controllers.js"; // Import the uploadProfileImage controller
import { protect } from "../middleware/authMiddleware.js"; // Import protect middleware

const router = express.Router();

// Route for uploading profile images
router.post("/uploadProfileImage", protect, uploadProfileImage); // The endpoint for uploading profile images is localhost:4000/api/profile/uploadProfileImage

// Route for updating user profile
router.put("/updatePersonalInfo", protect, updatePersonalInfo); // The endpoint for updating user profile is localhost:4000/api/profile/updatePersonalInfo

// Route for fetching user profile
router.get("/getUserProfile", protect, getUserProfile); // The endpoint for fetching user profile is localhost:4000/api/profile/getUserProfile

// Route for checking profile completion
router.get("/checkProfileCompletion", protect, checkProfileCompletionController); // The endpoint for checking profile completion is localhost:4000/api/profile/checkProfileCompletion

export default router;
