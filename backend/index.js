import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import { connectDB } from "./db/connectDB.js";
import authRouter from "./routes/auth.route.js";
import profileRouter from "./routes/profile.route.js";

dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/auth", authRouter); // Auth routes
app.use("/api/profile", profileRouter); // Profile routes


// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});


