import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const chatWithAI = async (req, res) => {
    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ 
            error: 'OpenAI API key not configured', 
            details: 'The OpenAI API key is missing' 
        });
    }

    try {
        const { messages, userProfile, userStats } = req.body;
        
        // Create a context message with user's profile and stats information
        const userContext = `
            Current user information:
            - Name: ${userProfile?.fullName || userProfile?.name || 'User'}
            - Height: ${userProfile?.height || 'Not specified'}
            - Weight: ${userProfile?.weight || 'Not specified'}
            - Training Experience: ${userProfile?.trainingExperience || 'Not specified'}
            - Allergies: ${userProfile?.allergies?.join(', ') || 'None specified'}
            - Protein Preference: ${userProfile?.proteinPreference?.join(', ') || 'Not specified'}

            User's current stats:
            - Workouts Completed: ${userStats?.workoutsCompleted || 0}
            - Current Streak: ${userStats?.streak || 0} days
            - Last Workout: ${userStats?.lastWorkout?.date || 'Not recorded'} at ${userStats?.lastWorkout?.time || 'Not recorded'}
            - Weekly Workouts: ${Object.keys(userStats?.weeklyWorkouts || {}).length} this week
            - Rest Days: ${userStats?.restDays || 0}
            - Daily Calories: ${userStats?.calories || 0}
            - Daily Protein: ${userStats?.protein || 0}g
            - Daily Water: ${userStats?.water || 0}ml
            - Total Points: ${userStats?.points || 0}

            Weekly Workout Schedule:
            ${Object.entries(userStats?.weeklyWorkouts || {})
                .map(([date, workout]) => `- ${date}: ${workout.workoutType} (${workout.duration} minutes)`)
                .join('\n')}
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "system", 
                    content: `You are a friendly and professional fitness coach. You have access to the user's profile and stats information and should use it to provide personalized responses.
                    
                    ${userContext}

                    When responding:
                    - Use the user's name when appropriate
                    - Reference their specific profile information and current stats when relevant
                    - Provide encouragement based on their progress
                    - Suggest improvements based on their stats
                    - Keep their preferences and restrictions in mind
                    - Write in a conversational, encouraging tone
                    - Use emojis naturally
                    - Break up text into readable paragraphs
                    - Keep responses focused on fitness topics and user's information
                    - Never share information about other users
                    - If asked about profile information or stats, only share the current user's data` 
                },
                ...messages
            ],
            max_tokens: 250,
            temperature: 0.7
        });

        let aiResponse = completion.choices[0].message.content
            .replace(/[*#\-]+/g, '')
            .replace(/\n{3,}/g, '\n\n');

        res.status(200).json({ message: aiResponse });
    } catch (error) {
        console.error('OpenAI API error:', error);
        res.status(500).json({ 
            error: 'Error processing your request',
            details: error.message 
        });
    }
};
