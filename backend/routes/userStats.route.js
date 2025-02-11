import express from 'express';
import { updateUserStats, getUserStats, addWorkoutSession, getWeeklyWorkouts, getRestDays, incrementRestDays, getLastWorkout } from '../controllers/userStats.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get user fitness & nutrition stats
router.get('/stats', protect, getUserStats); // The endpoint for getting user stats is localhost:4000/api/user/stats and requires authentication

// Update user fitness & nutrition stats
router.put('/stats', protect, updateUserStats); // The endpoint for updating user stats is localhost:4000/api/user/stats and requires authentication

// Get weekly workouts
router.get('/weekly-workouts', protect, getWeeklyWorkouts); // The endpoint for getting weekly workouts is localhost:4000/api/user/weekly-workouts and requires authentication

// Log a new workout session (tracks last workout time & date)
router.post('/workout', protect, addWorkoutSession); // The endpoint for logging a new workout session is localhost:4000/api/user/workout and requires authentication

// Get total rest days
router.get('/rest-days', protect, getRestDays); // The endpoint for getting total rest days is localhost:4000/api/user/rest-days and requires authentication

// Increment rest days if user didn't train
router.post('/increment-rest-days', protect, incrementRestDays); // The endpoint for incrementing rest days is localhost:4000/api/user/increment-rest-days and requires authentication

// Get last workout time & date
router.get('/last-workout', protect, getLastWorkout); // The endpoint for getting last workout time & date is localhost:4000/api/user/last-workout and requires authentication
export default router;