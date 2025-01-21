import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/connectDB.js";
import authRouter from "./routes/auth.route.js";

dotenv.config(); // Load environment variables


const app = express();

app.get("/", (req, res) => {
  res.send("Hello World ");
});

app.use(express.json()); // allow the server to parse JSON bodies

// Use the authRouter for the /api/auth routes example : localhost:5000/api/auth/login | localhost:5000/api/auth/signup | localhost:5000/api/auth/logout | localhost:5000/api/auth/google
app.use("/api/auth", authRouter)

app.listen(5000, () => {
  connectDB();
  console.log("Server is running on port 3000");
});