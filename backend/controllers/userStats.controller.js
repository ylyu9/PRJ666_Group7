import { User } from '../models/user.model.js';

// Get user stats
export const getUserStats = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('calories protein water workoutsCompleted streak points weeklyWorkouts');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching user stats:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update user stats
export const updateUserStats = async (req, res) => {
    try {
        const { calories, protein, water, workoutsCompleted, streak, points, weeklyWorkouts } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update fields if values are provided
        if (calories !== undefined) user.calories = calories;
        if (protein !== undefined) user.protein = protein;
        if (water !== undefined) user.water = water;
        if (workoutsCompleted !== undefined) user.workoutsCompleted = workoutsCompleted;
        if (streak !== undefined) user.streak = streak;
        if (points !== undefined) user.points = points;
        if (weeklyWorkouts !== undefined) user.weeklyWorkouts = weeklyWorkouts;
        if (restDays !== undefined) user.restDays = restDays;
        if (lastWorkoutTime !== undefined) user.lastWorkoutTime = lastWorkoutTime;
        if (lastWorkoutDate !== undefined) user.lastWorkoutDate = lastWorkoutDate;

        await user.save();
        res.status(200).json({ message: "User stats updated", user });
    } catch (error) {
        console.error("Error updating user stats:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Add a new workout session
export const addWorkoutSession = async (req, res) => {
    try {
        const { date, workoutType, duration, time } = req.body; // Expecting date (YYYY-MM-DD), type, duration (minutes), and time (HH:mm:ss)
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Ensure date is in correct format
        const formattedDate = new Date(date).toISOString().split('T')[0];

        // Add or update workout
        user.weeklyWorkouts.set(formattedDate, { workoutType, duration });

        // Update last workout date and time
        user.lastWorkoutDate = formattedDate;
        user.lastWorkoutTime = time;

        // Reset rest days since the user trained
        user.restDays = 0;

        await user.save();
        res.status(200).json({ message: "Workout logged successfully", user });
    } catch (error) {
        console.error("Error logging workout:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get user's last workout details
export const getLastWorkout = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('lastWorkoutTime lastWorkoutDate');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            lastWorkoutTime: user.lastWorkoutTime,
            lastWorkoutDate: user.lastWorkoutDate
        });
    } catch (error) {
        console.error("Error fetching last workout details:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get user's weekly workouts
export const getWeeklyWorkouts = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('weeklyWorkouts');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ weeklyWorkouts: user.weeklyWorkouts });
    } catch (error) {
        console.error("Error fetching weekly workouts:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get total rest days
export const getRestDays = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('restDays');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ restDays: user.restDays });
    } catch (error) {
        console.error("Error fetching rest days:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Increment rest days if no workout is logged
export const incrementRestDays = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.restDays += 1;
        await user.save();

        res.status(200).json({ message: "Rest days incremented", user });
    } catch (error) {
        console.error("Error incrementing rest days:", error);
        res.status(500).json({ message: "Server error" });
    }
};