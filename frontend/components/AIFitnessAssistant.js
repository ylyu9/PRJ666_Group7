import { useState, useRef, useEffect } from 'react';

export default function AIFitnessAssistant() {
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const chatContainerRef = useRef(null);

    // Fetch user profile and stats on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                // Fetch all required data in parallel
                const [profileResponse, statsResponse, lastWorkoutResponse, weeklyWorkoutsResponse, restDaysResponse] = 
                    await Promise.all([
                        fetch('http://localhost:4000/api/profile/getUserProfile', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        }),
                        fetch('http://localhost:4000/api/user/stats', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        }),
                        fetch('http://localhost:4000/api/user/last-workout', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        }),
                        fetch('http://localhost:4000/api/user/weekly-workouts', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        }),
                        fetch('http://localhost:4000/api/user/rest-days', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        })
                    ]);

                // Process all responses
                const [profileData, statsData, lastWorkoutData, weeklyWorkoutsData, restDaysData] = 
                    await Promise.all([
                        profileResponse.json(),
                        statsResponse.json(),
                        lastWorkoutResponse.json(),
                        weeklyWorkoutsResponse.json(),
                        restDaysResponse.json()
                    ]);

                // Combine all stats into one comprehensive object
                const combinedStats = {
                    ...statsData.user,
                    lastWorkout: {
                        time: lastWorkoutData.lastWorkoutTime,
                        date: lastWorkoutData.lastWorkoutDate
                    },
                    weeklyWorkouts: weeklyWorkoutsData.weeklyWorkouts,
                    restDays: restDaysData.restDays
                };

                setUserProfile(profileData.user);
                setUserStats(combinedStats);

                // Add initial greeting with comprehensive stats
                if (profileData.user && chatMessages.length === 0) {
                    const greeting = generateInitialGreeting(profileData.user, combinedStats);
                    setChatMessages([{
                        type: 'ai',
                        content: greeting,
                        timestamp: new Date()
                    }]);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    // Add this helper function to generate a more comprehensive greeting
    const generateInitialGreeting = (user, stats) => {
        const name = user.fullName || user.name;
        const workouts = stats.workoutsCompleted || 0;
        const streak = stats.streak || 0;
        const lastWorkoutDate = stats.lastWorkout.date 
            ? new Date(stats.lastWorkout.date).toLocaleDateString() 
            : 'not recorded';

        return `Hi ${name}! 👋 I'm your AI Fitness Assistant. Here's your current status:

🏋️‍♂️ You've completed ${workouts} workouts
🔥 Current streak: ${streak} days
📅 Last workout: ${lastWorkoutDate}
💪 Weekly progress: ${Object.keys(stats.weeklyWorkouts || {}).length} workouts this week
🎯 Total points: ${stats.points || 0}

I can help you with workouts, nutrition advice, and tracking your progress. What would you like to know?`;
    };

    // Map keywords to emojis for AI responses
    const getMessageIcon = (content) => {
        if (!content) return null;

        const contentLower = content.toLowerCase();
        if (contentLower.includes('workout') || contentLower.includes('exercise')) return '💪';
        if (contentLower.includes('diet') || contentLower.includes('nutrition')) return '🥗';
        if (contentLower.includes('motivation') || contentLower.includes('mindset')) return '🔥';
        return '🤖'; // Default AI icon
    };

    // Helper function to format AI response
    const formatAIResponse = (content) => {
        if (!content) return null;

        return (
            <div className="space-y-3">
                {content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="leading-relaxed">
                        {paragraph}
                    </p>
                ))}
            </div>
        );
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const newMessage = { type: 'user', content: chatInput, timestamp: new Date() };
        setChatMessages((prev) => [...prev, newMessage]);
        setChatInput('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const response = await fetch('http://localhost:4000/api/ai/chat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    messages: [
                        ...chatMessages.map(msg => ({ 
                            role: msg.type === 'user' ? 'user' : 'assistant', 
                            content: msg.content 
                        })),
                        { role: 'user', content: chatInput }
                    ],
                    userProfile: userProfile,
                    userStats: userStats // Include user stats in the request
                }),
            });

            if (!response.ok) throw new Error((await response.json()).details || 'API request failed');

            const data = await response.json();
            const aiResponse = { type: 'ai', content: data.message || 'I apologize, but I cannot provide a response at this moment.', timestamp: new Date() };

            setChatMessages((prev) => [...prev, aiResponse]);
        } catch (error) {
            console.error('Error getting AI response:', error);
            setChatMessages((prev) => [
                ...prev,
                { 
                    type: 'ai', 
                    content: 'I\'m having trouble processing your request right now. Try again later!',
                    timestamp: new Date() 
                },
            ]);
        } finally {
            setIsLoading(false);
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        }
    };

    return (
        <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">💬 AI Fitness Assistant</h3>
                {chatMessages.length > 0 && (
                    <button onClick={() => setChatMessages([])} className="text-xs text-gray-400 hover:text-gray-300">
                        Clear Chat
                    </button>
                )}
            </div>

            {/* Chat Messages */}
            <div ref={chatContainerRef} className="mb-4 space-y-4 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20">
                {chatMessages.length === 0 ? (
                    <p className="text-sm text-gray-400">Hi! Ask me anything about workouts, nutrition, or fitness tips! 💪</p>
                ) : (
                    chatMessages.map((message, index) => (
                        <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 ${message.type === 'user' ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-violet-500/10 border border-violet-500/20'}`}>
                                {message.type === 'ai' && <span className="text-lg">{getMessageIcon(message.content)}</span>}
                                <div className="text-sm text-gray-300">{message.type === 'ai' ? formatAIResponse(message.content) : message.content}</div>
                                <span className="text-xs text-gray-500 block">{new Date(message.timestamp).toLocaleTimeString()}</span>
                            </div>
                        </div>
                    ))
                )}
                {isLoading && <p className="text-gray-400">⏳ AI is thinking...</p>}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} className="relative">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask about workouts, nutrition, or fitness..." className="w-full bg-purple-500/5 border border-purple-500/20 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none" />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300" disabled={!chatInput.trim() || isLoading}>
                    ➡️
                </button>
            </form>
        </div>
    );
}
