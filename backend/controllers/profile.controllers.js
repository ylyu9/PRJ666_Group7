import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { User } from '../models/user.model.js';

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