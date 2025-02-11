import { useRouter } from "next/router";

export default function ProfileCompletionAlert({ isOpen, onClose }) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-fade-in-up">
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="bg-[#1E1B29]/95 backdrop-blur-xl border border-purple-500/20 shadow-2xl rounded-2xl p-6">
          <div className="flex items-start gap-6">
            {/* Icon Container */}
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

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Complete Your Profile
              </h3>
              <p className="mt-2 text-gray-300 leading-relaxed">
                Take a moment to complete your profile information. This helps
                us provide you with a more personalized experience and tailored
                workout recommendations.
              </p>

              {/* Progress Indicators */}
              <div className="mt-4 flex flex-wrap gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <svg
                    className="w-4 h-4 mr-1.5"
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
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <svg
                    className="w-4 h-4 mr-1.5"
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
                </span>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => router.push("/dashboard/profile")}
                  className="px-6 py-2.5 rounded-xl text-white font-medium 
                                             bg-gradient-to-r from-purple-500 to-violet-500 
                                             hover:from-purple-600 hover:to-violet-600 
                                             transition-all duration-300 transform hover:scale-[1.02]
                                             shadow-lg hover:shadow-purple-500/25
                                             flex items-center gap-2"
                >
                  <span>Complete Profile</span>
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
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-gray-300 font-medium
                                             border border-gray-700 hover:bg-gray-700/50
                                             transition-all duration-300"
                >
                  Remind Me Later
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-300 transition-colors"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
