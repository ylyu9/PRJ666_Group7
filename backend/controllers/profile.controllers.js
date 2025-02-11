import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { User } from '../models/user.model.js';
import { checkProfileCompletion } from '../utils/checkProfileCompletion.js';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for Cloudinary
const storage = multer.memoryStorage(); // Use memory storage to handle the file buffer
const upload = multer({ storage });

export const uploadProfileImage = [
    upload.single('profileImage'),
    async (req, res) => {
        try {
            console.log('Uploaded File:', req.file); // Debugging

            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const userId = req.user.id;

            // Upload file to Cloudinary using buffer
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'profile_images', public_id: `${userId}_${Date.now()}` },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary Upload Error:', error);
                            return reject(error);
                        }
                        resolve(result);
                    }
                );

                // Write the buffer to the upload stream
                uploadStream.end(req.file.buffer);
            });

            const profileImageUrl = uploadResult.secure_url;

            // Update user profile image in the database
            const user = await User.findByIdAndUpdate(
                userId,
                { profileImage: profileImageUrl },
                { new: true }
            );

            res.json({ profileImage: profileImageUrl, user });
        } catch (error) {
            console.error('Error in uploadProfileImage:', error);
            res.status(500).json({ error: 'Failed to upload profile image' });
        }
    },
];

// Controller for updating the user profile
export const updatePersonalInfo = async (req, res) => {
    const {
        fullName,
        height,
        weight,
        contactNumber,
        email,
        location,
        trainingExperience,
        allergies,
        proteinPreference,
    } = req.body;

    try {
        // Check if height is a number
        if (height && typeof height !== "number") {
            return res.status(400).json({ error: "Height must be a number" });
        }

        // Check if weight is a number
        if (weight && typeof weight !== "number") {
            return res.status(400).json({ error: "Weight must be a number" });
        }

        // Check if allergies is an array of strings
        if (allergies && !Array.isArray(allergies)) {
            return res.status(400).json({ error: "Allergies must be an array of strings" });
        }

        // Check if proteinPreference is an array of strings
        if (proteinPreference && !Array.isArray(proteinPreference)) {
            return res.status(400).json({ error: "Protein preference must be an array of strings" });
        }

        // Fetch the user from the database
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update the user profile with the new information
        user.fullName = fullName || user.fullName;
        user.height = height || user.height;
        user.weight = weight || user.weight;
        user.contactNumber = contactNumber || user.contactNumber;
        user.location = location || user.location; 
        user.trainingExperience = trainingExperience || user.trainingExperience;
        user.allergies = Array.isArray(allergies) ? allergies : user.allergies; // Check if allergies is an array
        user.proteinPreference = Array.isArray(proteinPreference) ? proteinPreference : user.proteinPreference; // Check if proteinPreference is an array

        // Save the updated user data
        await user.save();

        // Respond with success and updated user data
        res.status(200).json({
            message: "Profile updated successfully",
            user,
        });
    } catch (error) {
        console.error("Error in updatePersonalInfo:", error);
        res.status(500).json({
            error: "Failed to update profile",
        });
    }
};

// Controller for fetching user profile information
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Make sure we're sending all necessary fields
        res.status(200).json({
            user: {
                name: user.name,  // Add this if it exists in your user model
                fullName: user.fullName,
                email: user.email,
                height: user.height,
                weight: user.weight,
                contactNumber: user.contactNumber,
                location: user.location,
                trainingExperience: user.trainingExperience,
                allergies: user.allergies,
                proteinPreference: user.proteinPreference,
                profileImage: user.profileImage,
                plan: user.subscription.plan,
            }
        });
    } catch (error) {
        console.error('Error in getUserProfile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

// Controller for checking the the profile completion status
// Check profile completion status
export const checkProfileCompletionController = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the profile is complete using the checkProfileCompletion function
        const isProfileComplete = checkProfileCompletion(user);

        res.status(200).json({ profileComplete: isProfileComplete });
    } catch (error) {
        console.error("Error in checkProfileCompletion:", error);
        res.status(500).json({ error: "Failed to check profile completion" });
    }
};