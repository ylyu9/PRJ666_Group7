import { withAuth } from "../../middleware/authMiddleware";
import DashboardLayout from "../../components/DashboardLayout";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AIFitnessAssistant from "../../components/AIFitnessAssistant";

// Update the useCountAnimation hook to include delay
const useCountAnimation = (
  targetValue,
  duration = 1000,
  delay = 0,
  startOnMount = true,
) => {
  const [count, setCount] = useState(0);
  const [shouldStart, setShouldStart] = useState(false);

  useEffect(() => {
    if (!startOnMount) return;

    // Add delay before starting the animation
    const delayTimer = setTimeout(() => {
      setShouldStart(true);
    }, delay);

    return () => clearTimeout(delayTimer);
  }, [startOnMount, delay]);

  useEffect(() => {
    if (!shouldStart) return;

    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(targetValue * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(targetValue);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [targetValue, duration, shouldStart]);

  return count;
};

// Update the formatTimeDisplay function
const formatTimeDisplay = (timeString) => {
  if (!timeString) return "00:00:00";

  // Convert to string if it's a number
  const strTime = String(timeString);

  // If timeString is already in HH:mm:ss format, return it
  if (strTime.includes(":")) return strTime;

  // If timeString is a number, convert it to HH:mm:ss
  const seconds = parseInt(strTime);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// Add this new helper function to convert HH:mm:ss to seconds
const timeToSeconds = (timeString) => {
  if (!timeString) return 0;
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const [timeTrainedSeconds, setTimeTrainedSeconds] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weeklyWorkouts, setWeeklyWorkouts] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const chatContainerRef = useRef(null);
  const router = useRouter();
  const [userStats, setUserStats] = useState({
    workoutsCompleted: 0,
    streak: 0,
    points: 0,
  });
  const [lastWorkout, setLastWorkout] = useState({
    lastWorkoutTime: "00:00:00",
    lastWorkoutDate: null,
  });
  const [lastWorkoutSeconds, setLastWorkoutSeconds] = useState(0);

  // Update the animated values with sequential delays
  const animatedWorkouts = useCountAnimation(
    userStats.workoutsCompleted,
    1000,
    0,
  ); // Starts immediately
  const animatedStreak = useCountAnimation(userStats.streak, 1000, 500); // Starts after 500ms
  const animatedTimeSeconds = useCountAnimation(timeTrainedSeconds, 1000, 1000); // Starts after 1000ms
  const animatedPoints = useCountAnimation(userStats.points, 1000, 1500); // Starts after 1500ms

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getWeekDates = (date) => {
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - date.getDay());

    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(sunday);
      day.setDate(sunday.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessage = {
      type: "user",
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, newMessage]);
    setChatInput("");

    setTimeout(() => {
      const aiResponse = {
        type: "ai",
        content: "I&apos;m analyzing your data",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiResponse]);

      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    }, 1000);
  };

  const handleUpdateTime = (seconds) => {
    setTimeTrainedSeconds(seconds);
  };

  const displayTime = formatTime(animatedTimeSeconds);

  const handleMessageSubmit = handleChatSubmit;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (typeof window === "undefined") return;

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        try {
          const response = await fetch(
            "http://localhost:4000/api/profile/getUserProfile",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              mode: "cors",
              cache: "no-cache",
            },
          );

          if (!response.ok) {
            if (response.status === 401) {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              router.push("/login");
              return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.user) {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Profile completion check
            const completionResponse = await fetch(
              "http://localhost:4000/api/profile/checkProfileCompletion",
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                mode: "cors",
                cache: "no-cache",
              },
            );

            if (completionResponse.ok) {
              const completionData = await completionResponse.json();
              // Only show alert if profile is not complete
              setShowProfileAlert(!completionData.profileComplete);
            }
          }
        } catch (fetchError) {
          console.error("Fetch error:", fetchError);
          if (fetchError.message === "Failed to fetch") {
            // setError("Network error: Unable to connect to server");
          } else {
            // setError(`Error: ${fetchError.message}`);
          }
        }
      } catch (error) {
        console.error("Error in fetchUserProfile:", error);
        // setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleCompleteProfile = () => {
    router.push("/dashboard/profile");
  };

  const handleRemindLater = () => {
    setShowProfileAlert(false);
  };

  useEffect(() => {
    const fetchWeeklyWorkouts = async () => {
      try {
        const startDate = getWeekDates(currentWeek)[0]
          .toISOString()
          .split("T")[0];
        const endDate = getWeekDates(currentWeek)[6]
          .toISOString()
          .split("T")[0];

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/weekly-workouts?start=${startDate}&end=${endDate}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setWeeklyWorkouts(data.workouts || {});
        } else {
          setWeeklyWorkouts({});
          console.error("Failed to fetch weekly workouts");
        }
      } catch (error) {
        console.error("Error fetching weekly workouts:", error);
        setWeeklyWorkouts({});
      }
    };

    fetchWeeklyWorkouts();
  }, [currentWeek]);

  useEffect(() => {
    const fetchLastWorkout = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/last-workout`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          const formattedTime = formatTimeDisplay(data.lastWorkoutTime);
          setLastWorkout({
            lastWorkoutTime: formattedTime,
            lastWorkoutDate: data.lastWorkoutDate,
          });

          // Convert the time to seconds for animation
          const seconds = timeToSeconds(formattedTime);
          setLastWorkoutSeconds(seconds);
        }
      } catch (error) {
        console.error("Error fetching last workout:", error);
      }
    };

    fetchLastWorkout();
  }, []);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/user/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setUserStats({
            workoutsCompleted: data.user.workoutsCompleted || 0,
            streak: data.user.streak || 0,
            points: data.user.points || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    fetchUserStats();
  }, []);

  // Add the animated value for last workout time
  const animatedLastWorkoutSeconds = useCountAnimation(
    lastWorkoutSeconds,
    1000,
    1000,
  ); // Starts after 1000ms

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="h-8 w-64 bg-purple-500/10 animate-pulse rounded-lg mb-8"></div>
        ) : (
          <>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-8">
              Welcome back, {user?.name || user?.fullName || "User"}!
            </h1>

            {/* Profile Completion Alert - Only show if showProfileAlert is true */}
            {showProfileAlert && (
              <div className="mb-8 animate-fade-in-up">
                <div className="bg-[#1E1B29]/95 backdrop-blur-xl border border-purple-500/20 shadow-2xl rounded-2xl p-6">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400/10 to-yellow-600/10 rounded-xl border border-yellow-400/20 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-yellow-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
                        Complete Your Profile
                      </h3>
                      <p className="mt-2 text-gray-300 leading-relaxed">
                        Take a moment to complete your profile information. This
                        helps us provide you with a more personalized experience
                        and tailored workout recommendations.
                      </p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-gray-400">
                          <svg
                            className="w-5 h-5 mr-2 text-purple-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Personalized Workouts
                        </div>
                        <div className="flex items-center text-gray-400">
                          <svg
                            className="w-5 h-5 mr-2 text-purple-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Diet Recommendations
                        </div>
                      </div>
                      <div className="mt-6 flex gap-4">
                        <button
                          onClick={handleCompleteProfile}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 
                                                             hover:from-purple-600 hover:to-violet-600 text-white rounded-lg 
                                                             transition-all duration-300 text-sm font-medium"
                        >
                          Complete Profile
                        </button>
                        <button
                          onClick={handleRemindLater}
                          className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors text-sm"
                        >
                          Remind Me Later
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-[#1E1B29]/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-400 text-sm">Workouts Completed</p>
                    <h3 className="text-2xl font-bold text-white">
                      {animatedWorkouts}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="bg-[#1E1B29]/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl border border-green-500/20 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-400 text-sm">Current Streak</p>
                    <h3 className="text-2xl font-bold text-white">
                      {animatedStreak} days
                    </h3>
                  </div>
                </div>
              </div>

              <div className="bg-[#1E1B29]/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-xl border border-yellow-500/20 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-yellow-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-400 text-sm">Last Workout Time</p>
                    <h3 className="text-xl font-bold text-white font-mono">
                      {formatTimeDisplay(animatedLastWorkoutSeconds)}
                    </h3>
                    {lastWorkout.lastWorkoutDate && (
                      <p className="text-sm text-gray-400">
                        {new Date(
                          lastWorkout.lastWorkoutDate,
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-[#1E1B29]/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl border border-purple-500/20 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-400 text-sm">Points Earned</p>
                    <h3 className="text-2xl font-bold text-white">
                      {animatedPoints}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Overview */}
            <div className="mb-8 bg-[#1E1B29]/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                  Weekly Overview
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const prevWeek = new Date(currentWeek);
                      prevWeek.setDate(currentWeek.getDate() - 7);
                      setCurrentWeek(prevWeek);
                    }}
                    className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <span className="text-gray-400">
                    {formatDate(getWeekDates(currentWeek)[0])} -{" "}
                    {formatDate(getWeekDates(currentWeek)[6])}
                  </span>
                  <button
                    onClick={() => {
                      const nextWeek = new Date(currentWeek);
                      nextWeek.setDate(currentWeek.getDate() + 7);
                      setCurrentWeek(nextWeek);
                    }}
                    className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {getWeekDates(currentWeek).map((date, index) => {
                  const dayKey = date.toISOString().split("T")[0];
                  const hasWorkout = weeklyWorkouts[dayKey] || false;
                  const isCurrentDay = isToday(new Date(date));
                  const isPastDay = isPast(new Date(date));

                  return (
                    <div key={dayKey} className="text-center">
                      <div className="text-sm text-gray-400 mb-2">
                        {
                          ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                            index
                          ]
                        }
                      </div>
                      <div
                        className={`
                                                h-24 rounded-lg border p-2 transition-all duration-300
                                                ${
                                                  isCurrentDay
                                                    ? "bg-purple-500/10 border-purple-500/30"
                                                    : isPastDay
                                                      ? "bg-purple-500/5 border-purple-500/10"
                                                      : "bg-purple-500/5 border-purple-500/10 hover:border-purple-500/20"
                                                }
                                                ${hasWorkout ? "ring-2 ring-purple-500/20" : ""}
                                            `}
                      >
                        <div className="text-xs text-gray-400">
                          {date.getDate()}
                        </div>
                        {hasWorkout && (
                          <div className="mt-2">
                            <span className="inline-block px-2 py-1 bg-purple-500/20 rounded-md text-xs text-purple-400">
                              {hasWorkout.type}
                            </span>
                          </div>
                        )}
                        {isCurrentDay && (
                          <div className="mt-2">
                            <span className="inline-block px-2 py-1 bg-purple-500/20 rounded-md text-xs text-purple-400">
                              Today
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Link href="/dashboard/workouts" className="group">
                    <div
                      className="bg-[#1E1B29]/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 
                                                    hover:border-purple-500/40 transition-all duration-300 h-full"
                    >
                      <div
                        className="w-12 h-12 bg-gradient-to-br from-purple-500/10 to-violet-500/10 
                                                        rounded-xl border border-purple-500/20 flex items-center justify-center mb-4
                                                        group-hover:from-purple-500/20 group-hover:to-violet-500/20 transition-all duration-300"
                      >
                        <svg
                          className="w-6 h-6 text-purple-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Start Workout
                      </h3>
                      <p className="text-gray-400">
                        Begin your fitness journey with a new workout session.
                      </p>
                    </div>
                  </Link>

                  <Link href="/dashboard/nutrition" className="group">
                    <div
                      className="bg-[#1E1B29]/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 
                                                    hover:border-purple-500/40 transition-all duration-300 h-full"
                    >
                      <div
                        className="w-12 h-12 bg-gradient-to-br from-green-500/10 to-emerald-500/10 
                                                        rounded-xl border border-green-500/20 flex items-center justify-center mb-4
                                                        group-hover:from-green-500/20 group-hover:to-emerald-500/20 transition-all duration-300"
                      >
                        <svg
                          className="w-6 h-6 text-green-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16m-7 6h7"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Meal Planning
                      </h3>
                      <p className="text-gray-400">
                        Plan and track your daily nutrition intake.
                      </p>
                    </div>
                  </Link>
                </div>

                {/* AI Training Assistant */}
                <div className="bg-[#1E1B29]/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">
                      AI Training Assistant
                    </h2>
                    <span
                      className="px-3 py-1 bg-gradient-to-r from-purple-500/10 to-violet-500/10 
                                                  border border-purple-500/20 rounded-full text-xs text-purple-400"
                    >
                      AI Powered
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <Link href="/dashboard/ai-coach" className="group">
                      <div
                        className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4 
                                                        hover:border-purple-500/30 transition-all duration-300 h-full flex flex-col"
                      >
                        <div
                          className="w-10 h-10 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 
                                                            rounded-lg border border-indigo-500/20 flex items-center justify-center mb-3"
                        >
                          <svg
                            className="w-5 h-5 text-indigo-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-white font-medium mb-1">
                          AI Form Analysis
                        </h3>
                        <p className="text-sm text-gray-400">
                          Get instant feedback on your exercise form and
                          technique
                        </p>

                        {/* Feature Tags */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                            Form Check
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                              />
                            </svg>
                            Real-time Tips
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                            Performance Tracking
                          </span>
                        </div>

                        {/* Features List */}
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-sm text-gray-400">
                            <svg
                              className="w-4 h-4 mr-2 text-green-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Posture correction suggestions
                          </div>
                          <div className="flex items-center text-sm text-gray-400">
                            <svg
                              className="w-4 h-4 mr-2 text-green-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Exercise technique analysis
                          </div>
                          <div className="flex items-center text-sm text-gray-400">
                            <svg
                              className="w-4 h-4 mr-2 text-green-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Movement pattern insights
                          </div>
                        </div>

                        {/* Progress Indicator */}
                        <div className="mt-4 pt-4 border-t border-purple-500/10">
                          <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                            <span>Analysis Accuracy</span>
                            <span>98%</span>
                          </div>
                          <div className="h-1.5 bg-purple-500/10 rounded-full">
                            <div className="h-full w-[98%] bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <Link href="/dashboard/workout-generator" className="group">
                      <div
                        className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4 
                                                        hover:border-purple-500/30 transition-all duration-300 h-full flex flex-col"
                      >
                        <div
                          className="w-10 h-10 bg-gradient-to-br from-purple-500/10 to-violet-500/10 
                                                            rounded-lg border border-purple-500/20 flex items-center justify-center mb-3"
                        >
                          <svg
                            className="w-5 h-5 text-purple-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-white font-medium mb-1">
                          AI Workout Generator
                        </h3>
                        <p className="text-sm text-gray-400">
                          Create personalized workout plans tailored to your
                          goals and fitness level
                        </p>

                        {/* Feature Tags */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                            Smart Planning
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                            Progressive Load
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              />
                            </svg>
                            Adaptive Plans
                          </span>
                        </div>

                        {/* Features List */}
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center text-sm text-gray-400">
                            <svg
                              className="w-4 h-4 mr-2 text-green-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Personalized workout intensity
                          </div>
                          <div className="flex items-center text-sm text-gray-400">
                            <svg
                              className="w-4 h-4 mr-2 text-green-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Equipment-based adaptations
                          </div>
                          <div className="flex items-center text-sm text-gray-400">
                            <svg
                              className="w-4 h-4 mr-2 text-green-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Rest day optimization
                          </div>
                        </div>

                        {/* Progress Indicator */}
                        <div className="mt-4 pt-4 border-t border-purple-500/10">
                          <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                            <span>Plan Customization</span>
                            <span>95%</span>
                          </div>
                          <div className="h-1.5 bg-purple-500/10 rounded-full">
                            <div className="h-full w-[95%] bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"></div>
                          </div>
                        </div>

                        {/* Coming Soon Badge */}
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Updates Weekly
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            AI-Powered
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* AI Chat Interface */}
                  <AIFitnessAssistant />
                </div>

                {/* Workout Programs */}
                <div className="bg-[#1E1B29]/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">
                      Featured Programs
                    </h2>
                    <Link
                      href="/dashboard/programs"
                      className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="group relative overflow-hidden rounded-xl">
                      <div className="w-full h-48 bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/20" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <h3 className="text-lg font-semibold text-white">HIIT Cardio</h3>
                        <p className="text-sm text-gray-300">High-intensity interval training</p>
                      </div>
                    </div>
                    <div className="group relative overflow-hidden rounded-xl">
                      <div className="w-full h-48 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <h3 className="text-lg font-semibold text-white">Strength Training</h3>
                        <p className="text-sm text-gray-300">Build muscle and strength</p>
                      </div>
                    </div>
                    <div className="group relative overflow-hidden rounded-xl">
                      <div className="w-full h-48 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <h3 className="text-lg font-semibold text-white">Yoga</h3>
                        <p className="text-sm text-gray-300">Flexibility and mindfulness</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-[#1E1B29]/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-6">
                    Recent Activity
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-400">
                      <svg
                        className="w-5 h-5 mr-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm">No recent activity to show</p>
                    </div>
                  </div>
                </div>

                {/* Nutrition Summary */}
                <div className="bg-[#1E1B29]/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">
                      Today's Nutrition
                    </h2>
                    <Link
                      href="/dashboard/nutrition"
                      className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-purple-500/5 border border-purple-500/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Calories</span>
                        <span className="text-sm text-purple-400">0/2000</span>
                      </div>
                      <div className="h-1.5 bg-purple-500/10 rounded-full">
                        <div className="h-full w-0 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"></div>
                      </div>
                    </div>
                    <div className="bg-purple-500/5 border border-purple-500/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Protein</span>
                        <span className="text-sm text-purple-400">0/150g</span>
                      </div>
                      <div className="h-1.5 bg-purple-500/10 rounded-full">
                        <div className="h-full w-0 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"></div>
                      </div>
                    </div>
                    <div className="bg-purple-500/5 border border-purple-500/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Water</span>
                        <span className="text-sm text-purple-400">0/8</span>
                      </div>
                      <div className="h-1.5 bg-purple-500/10 rounded-full">
                        <div className="h-full w-0 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors text-sm">
                    Log Meal
                  </button>
                </div>

                {/* Recommended Workouts */}
                <div className="bg-[#1E1B29]/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-6">
                    Recommended For You
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {["Beginner Yoga", "Core Strength"].map(
                      (workout, index) => (
                        <div
                          key={workout}
                          className="group relative overflow-hidden rounded-xl aspect-video"
                        >
                          <div 
                            className={`w-full h-full bg-gradient-to-br 
                              ${index % 3 === 0 ? 'from-purple-500/20 to-violet-500/20 border-purple-500/20' : 
                              index % 3 === 1 ? 'from-blue-500/20 to-cyan-500/20 border-blue-500/20' : 
                              'from-green-500/20 to-emerald-500/20 border-green-500/20'} 
                              border`}
                          />
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                            <h3 className="text-lg font-semibold text-white">{workout}</h3>
                            <p className="text-sm text-gray-300">Recommended workout</p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Subscription Status */}
                <div className="bg-[#1E1B29]/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Subscription Status
                  </h2>
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                    <span className="text-gray-300">
                      {user?.subscription?.plan || "Free"} Plan
                    </span>
                  </div>
                  {(user?.subscription?.plan === "free" ||
                    !user?.subscription?.plan) && (
                    <Link
                      href="/pricing"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 
                                                     hover:from-purple-600 hover:to-violet-600 text-white rounded-lg transition-all duration-300
                                                     text-sm font-medium"
                    >
                      Upgrade Now
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </Link>
                  )}
                </div>

                {/* Quick Tips */}
                <div className="bg-[#1E1B29]/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Quick Tips
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div
                        className="w-8 h-8 bg-blue-500/10 rounded-lg border border-blue-500/20 
                                                        flex items-center justify-center flex-shrink-0 mt-1"
                      >
                        <svg
                          className="w-4 h-4 text-blue-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-sm ml-3">
                        Stay hydrated! Aim to drink at least 8 glasses of water
                        daily.
                      </p>
                    </div>
                    <div className="flex items-start">
                      <div
                        className="w-8 h-8 bg-green-500/10 rounded-lg border border-green-500/20 
                                                        flex items-center justify-center flex-shrink-0 mt-1"
                      >
                        <svg
                          className="w-4 h-4 text-green-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-sm ml-3">
                        Get enough sleep! Aim for 7-9 hours of quality sleep
                        each night.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upcoming Workouts */}
                <div className="bg-[#1E1B29]/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">
                      Upcoming Workouts
                    </h2>
                    <Link
                      href="/dashboard/schedule"
                      className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-purple-500/5 border border-purple-500/10 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg border border-purple-500/20 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-purple-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-white font-medium">Upper Body</h3>
                          <p className="text-sm text-gray-400">
                            Tomorrow, 9:00 AM
                          </p>
                        </div>
                      </div>
                      <button className="text-purple-400 hover:text-purple-300 transition-colors">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Goals Progress */}
                <div className="bg-[#1E1B29]/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Goals Progress
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">
                          Weekly Workouts
                        </span>
                        <span className="text-sm text-purple-400">0/3</span>
                      </div>
                      <div className="h-2 bg-purple-500/10 rounded-full">
                        <div className="h-full w-0 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">
                          Monthly Goal
                        </span>
                        <span className="text-sm text-purple-400">0/12</span>
                      </div>
                      <div className="h-2 bg-purple-500/10 rounded-full">
                        <div className="h-full w-0 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div className="bg-[#1E1B29]/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Recent Achievements
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-purple-500/5 border border-purple-500/10 rounded-lg">
                      <div className="w-10 h-10 bg-yellow-500/10 rounded-lg border border-yellow-500/20 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 2a1 1 0 01.894.553l2.991 5.657 6.789.907a1 1 0 01.553 1.706l-4.949 4.524 1.173 6.718a1 1 0 01-1.451 1.054L10 19.5l-5.999 2.618a1 1 0 01-1.451-1.054l1.173-6.718-4.949-4.524a1 1 0 01.553-1.706l6.789-.907L9.106 2.553A1 1 0 0110 2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-white font-medium">First Login</h3>
                        <p className="text-sm text-gray-400">
                          Welcome to your fitness journey!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Community Leaderboard */}
                <div className="bg-[#1E1B29]/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">
                      Leaderboard
                    </h2>
                    <Link
                      href="/dashboard/community"
                      className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((position) => (
                      <div
                        key={position}
                        className="flex items-center p-3 bg-purple-500/5 border border-purple-500/10 rounded-lg"
                      >
                        <div className="w-8 h-8 flex items-center justify-center text-lg font-bold text-purple-400">
                          {position}
                        </div>
                        <div className="w-8 h-8 bg-purple-500/20 rounded-full ml-2"></div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-white font-medium">
                            User {position}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {1000 - position * 100} points
                          </p>
                        </div>
                        {position === 1 && (
                          <div className="w-6 h-6 text-yellow-400">
                            <svg fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 2a1 1 0 01.894.553l2.991 5.657 6.789.907a1 1 0 01.553 1.706l-4.949 4.524 1.173 6.718a1 1 0 01-1.451 1.054L10 19.5l-5.999 2.618a1 1 0 01-1.451-1.054l1.173-6.718-4.949-4.524a1 1 0 01.553-1.706l6.789-.907L9.106 2.553A1 1 0 0110 2z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-[#1E1B29]/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">
                      AI Insights
                    </h2>
                    <span
                      className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 
                                                  border border-blue-500/20 rounded-full text-xs text-blue-400"
                    >
                      Powered by AI
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-purple-500/5 border border-purple-500/10 rounded-lg p-4">
                      <div className="flex items-start">
                        <div
                          className="w-8 h-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 
                                                            rounded-lg border border-blue-500/20 flex items-center justify-center mt-1"
                        >
                          <svg
                            className="w-4 h-4 text-blue-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-white font-medium mb-1">
                            Workout Analysis
                          </h3>
                          <p className="text-sm text-gray-400">
                            Based on your recent activities, try increasing your
                            cardio intensity for better results.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-500/5 border border-purple-500/10 rounded-lg p-4">
                      <div className="flex items-start">
                        <div
                          className="w-8 h-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 
                                                            rounded-lg border border-green-500/20 flex items-center justify-center mt-1"
                        >
                          <svg
                            className="w-4 h-4 text-green-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-white font-medium mb-1">
                            Nutrition Suggestion
                          </h3>
                          <p className="text-sm text-gray-400">
                            Consider increasing your protein intake to support
                            muscle recovery.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    className="w-full mt-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 
                                                     border border-blue-500/20 rounded-lg text-blue-400 hover:from-blue-500/20 
                                                     hover:to-cyan-500/20 transition-all duration-300 text-sm"
                  >
                    View Detailed Analysis
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default withAuth(Dashboard);
