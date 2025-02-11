import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // Using bcryptjs to hash passwords

// Define the user schema and the timestamps for the createdAt and updatedAt fields
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        // Only require password if googleId is not present
        required: function() {
            return !this.googleId;
        }
    },
    name: { // This will be used like Welcome, Anthony! in the Dashboard
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
        default: "https://png.pngtree.com/png-vector/20210604/ourmid/pngtree-gray-avatar-placeholder-png-image_3416697.jpg", // Replace with your default avatar URL
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
        enum: ["user", "pro-user", "admin"],
        default: "user",
    },
    subscription: {
        stripeCustomerId: { type: String, default: null },
        stripeSubscriptionId: { type: String, default: null },
        status: { type: String, enum: ["active", "inactive"], default: "inactive" },
        currentPeriodEnd: { type: Date, default: null },
        plan: { type: String, enum: ["free", "pro"], default: "free" },
    },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },

    // User profile information fields
    fullName: { type: String, default: null},
    height: { type: Number, default: null},
    weight: { type: Number, default: null},
    contactNumber: { type: String, default: null},
    location: { type: String, default: null},
    trainingExperience: { type: String, default: null},
    allergies: { type: [String], default: []},
    proteinPreference: { type: [String], default: []},

    // User progress fields
    calories: { type: Number, default: 0},
    protein: { type: Number, default: 0},
    water: { type: Number, default: 0},
    workoutsCompleted: { type: Number, default: 0},
    streak: { type: Number, default: 0},
    points: { type: Number, default: 0},
    restDays: { type: Number, default: 0},
    lastWorkoutTime: {
        type: String,
        default: null
    },
    lastWorkoutDate: {
        type: String,
        default: null
    },
    // Weekly workout Date
    weeklyWorkouts: {
        type: Map, // Map of workout types to their completion status
        of: new mongoose.Schema({ // Schema for each workout type
            workoutType: String, // Type of workout (e.g., "Cardio", "Strength", "Flexibility")
            duration: Number, // Duration of the workout in minutes
        }, { _id: false }), // Disable _id field for each workout type
        default: {}, // Default value is an empty map
    }
}, { timestamps: true });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Export the user model
export const User = mongoose.model("User", userSchema);
