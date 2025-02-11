import { useRouter } from "next/router";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/signup');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] bg-gradient-to-br from-[#0A0A0F] via-[#13111C] to-[#170F23]">
      {/* Navigation */}
      <nav className="bg-[#0A0A0F]/80 backdrop-blur-sm fixed w-full z-10 border-b border-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link
                href="/"
                className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-violet-400 to-fuchsia-400 
                                    bg-clip-text text-transparent hover:from-purple-400 hover:via-violet-500 hover:to-fuchsia-500 
                                    transition-all duration-300"
              >
                CoreHealth AI
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-300 hover:text-purple-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500
                                text-white px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 
                                shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              <span className="block text-transparent bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text">
                Transform Your Health Journey
              </span>
              <span className="block text-gray-400 text-2xl sm:text-3xl md:text-4xl mt-4 font-normal">
                with AI-Powered Health Insights
              </span>
            </h1>
            <p className="mt-6 max-w-md mx-auto text-lg md:mt-8 md:max-w-3xl text-gray-400">
              Get personalized health recommendations, track your progress, and
              achieve your wellness goals with CoreHealth AI.
            </p>
            <div className="mt-8 max-w-md mx-auto sm:flex sm:justify-center md:mt-10">
              <Link
                href="/signup"
                className="group w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 rounded-full
                                    bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500
                                    text-white font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40
                                    transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Get Started
                <svg
                  className="w-5 h-5 ml-2 transform transition-transform duration-300 group-hover:translate-x-1"
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
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 opacity-0 group-hover:opacity-30 blur transition duration-300"></div>
              <div className="relative bg-[#13111C] rounded-2xl p-8 h-full border border-purple-900/20 hover:border-purple-500/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500/10 to-violet-500/10 flex items-center justify-center mb-4">
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">
                  AI-Powered Plans
                </h3>
                <p className="mt-2 text-gray-400 leading-relaxed">
                  Personalized workout and diet plans tailored to your goals.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 opacity-0 group-hover:opacity-30 blur transition duration-300"></div>
              <div className="relative bg-[#13111C] rounded-2xl p-8 h-full border border-purple-900/20 hover:border-purple-500/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500/10 to-violet-500/10 flex items-center justify-center mb-4">
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Progress Tracking
                </h3>
                <p className="mt-2 text-gray-400 leading-relaxed">
                  Track your fitness journey with detailed analytics and
                  insights.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative group">
              <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 opacity-0 group-hover:opacity-30 blur transition duration-300"></div>
              <div className="relative bg-[#13111C] rounded-2xl p-8 h-full border border-purple-900/20 hover:border-purple-500/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500/10 to-violet-500/10 flex items-center justify-center mb-4">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Real-time Updates
                </h3>
                <p className="mt-2 text-gray-400 leading-relaxed">
                  Get instant feedback and adjustments to optimize your routine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
