import { OAuth2Client } from "google-auth-library";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendEmail } from "../db/sendEmail.js";
import dotenv from "dotenv";
import { checkProfileCompletion } from "../utils/checkProfileCompletion.js";

dotenv.config();

// Signup route
export const signup = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: "Please provide all required fields" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Create user with plain password - let the model handle hashing
        const user = await User.create({
            email,
            password, // Don't hash here - let the pre-save middleware handle it
            name,
            subscription: {
                plan: "free",
                status: "inactive",
            },
        });

        // Check if the profile is complete
        const isProfileComplete = checkProfileCompletion(user);

        // Create token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({ token, user: userResponse, profileComplete: isProfileComplete });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ error: "Error creating user" });
    }
};

// Login route
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Please provide email and password" });
        }

        // Find user and explicitly select the password field
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        // Use the model's comparePassword method
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({ error: "Invalid password" });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Check if the profile is complete
        // If the user has not completed the profile, then the profileComplete will be false
        // If the user has completed the profile, then the profileComplete will be true
        // The profile is complete if the user has filled in all the required fields
        // It will show a banner on the frontend to inform the user to complete the profile
        const isProfileComplete = checkProfileCompletion(user);

        // Create token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        // Send the token, user, and profile completion status to the frontend
        res.status(200).json({ token, user: userResponse, profileComplete: isProfileComplete });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Error logging in" });
    }
};

// Logout route
export const logout = async (req, res) => {
    try {
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ error: "Error logging out" });
    }
};

// Google Authentication route
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: "Token is required" });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // Create new user without password for Google auth
            user = new User({
                email,
                name,
                profileImage: picture,
                googleId,
                subscription: { plan: "free", status: "inactive" },
                // Don't set password for Google users
            });
            await user.save();
        } else {
            user.lastLogin = new Date();
            
            if (!user.profileImage || user.profileImage === user.googleId) {
                user.profileImage = picture;
            }
            
            user.googleId = googleId;
            await user.save();
        }

        // Check if the user profile is complete
        const isProfileComplete = checkProfileCompletion(user);

        const jwtToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({ token: jwtToken, user, profileComplete: isProfileComplete });
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ error: "Google authentication failed" });
    }
};

// Request Password Reset
export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "No account found with this email" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const emailData = {
            to: email,
            subject: "Password Reset Request",
            html: `
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
            `,
        };

        await sendEmail(emailData);

        res.json({ message: "Password reset email sent successfully" });
    } catch (error) {
        console.error("Request Password Reset Error:", error);
        res.status(500).json({ error: "Failed to send password reset email" });
    }
};

// Reset Password
export const resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;

    try {
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ error: "Invalid or expired reset token" });
        }

        // Set the plain password - let the User model's pre-save middleware handle the hashing
        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        
        // If you want to hash here instead, disable the pre-save middleware for password hashing
        // const salt = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash(newPassword, salt);
        // user.password = hashedPassword;
        
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ error: "Failed to reset password" });
    }
};
