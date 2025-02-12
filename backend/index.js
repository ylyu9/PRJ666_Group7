import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import { connectDB } from "./db/connectDB.js";
import authRouter from "./routes/auth.route.js";
import profileRouter from "./routes/profile.route.js";
import aiRoutes from './routes/ai.routes.js';
import userStatsRoutes from './routes/userStats.route.js';
import publicRouter from './routes/public.route.js';

dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/auth", authRouter); // Auth routes
app.use("/api/profile", profileRouter); // Profile routes
app.use('/api/ai', aiRoutes);   // AI routes
app.use('/api/user', userStatsRoutes); // User stats routes
app.use('/api/public', publicRouter);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});


