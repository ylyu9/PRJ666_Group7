import {OAuth2Client} from "google-auth-library";
import User from "../models/user.model.js";

// Load the environment variables from the .env file
import dotenv from "dotenv";

// Load the environment variables
dotenv.config();

// Signup route
export const signup =  async (req, res) => {
  res.send("Signup route");
};

// Login route
export const login = async (req, res) => {
  res.send("Login route");
};

// Logout route
export const logout = async (req, res) => {
  res.send("Logout route");
};

// Initialize the Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
    // Get the token from the request body from the frontend 
    const {token} = req.body;

    // Check if the token is provided
    if(!token){
        return res.status(400).json({error: "Token is required"});
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const {email, name, picture, sub} = ticket.getPayload();

        // Check if the user exists in the database
        let user = await User.findOne({email: email});

        if(!user){
            // If the user does not exist, create a new user and save it to the mongodb database
            user = await User.create({
                email: email, // The email is the unique identifier for the user
                name: name, // The name is the name of the user for welcome message in the dashboard
                profileImage: picture, // The profile image is to display the user's profile image in the dashboard
                googleId: sub,
                lastLogin: new Date(), // The lastLogin is the date and time of the user's last login
                subscription: "free", // This will be changed to "pro" when the user subscribes to the pro plan
                role: "user", // The role is the role of the user in the system
            });

            // Save the user to the mongodb database
            await user.save();
        } else {
            // If the user exists, update the lastLogin field
            user.lastLogin = new Date();
            await user.save();
        }

        // Create a JWT token for the user
        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "1h"});

        // Send the token and user data to the frontend as a response to the google login request 
        res.status(200).json({token: token, user: user});

    // If there is an error, send an error response to the frontend
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Failed to verify Google token"});
    }
};

