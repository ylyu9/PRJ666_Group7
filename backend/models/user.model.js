import mongoose from "mongoose";

// Define the user schema and the timestamps for the createdAt and updatedAt fields
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: function() {
            // Password is required only if it's not a Google login
            return !this.googleId;
        },
    },
    name: { // This will be used like Welcome, Anthony! in the Dashboard
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
        default: "",
    },
    googleId: {
        type: String, // To store the Google user ID
        unique: true,
        sparse: true, // Allows null values while enforcing uniqueness
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    role: {
        type: String,
        enum: ["user", "Pro User", "admin"],
        default: "user",
    },
    subscription: {
        type: String,
        enum: ["free", "pro"],
        default: "free",
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, { timestamps: true });


// Export the user model
export const User = mongoose.model('User', userSchema);