import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function ResetPassword() {
  const router = useRouter();
  const { token: resetToken } = router.query;

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Wait for router to be ready before checking token
  useEffect(() => {
    if (router.isReady) {
      setIsReady(true);
    }
  }, [router.isReady]);

  // Password validation
  const validatePassword = (password) => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return "Password must contain at least one special character (!@#$%^&*)";
    }
    return "";
  };

  // Handle password change with validation
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resetToken) {
      setError("Invalid reset token. Please try again.");
      return;
    }

    // Validate password before submission
    const passwordValidationError = validatePassword(newPassword);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:4000/api/auth/resetPassword",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ resetToken, newPassword }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setError("");
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setSuccess(false);
        setError(data.error || "Failed to reset password.");
      }
    } catch (error) {
      console.error('Error:', error);
      setError("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while router is not ready
  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] bg-gradient-to-br from-[#0A0A0F] via-[#13111C] to-[#170F23] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  // If router is ready but no token is present, show error page
  if (isReady && !resetToken) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] bg-gradient-to-br from-[#0A0A0F] via-[#13111C] to-[#170F23] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-[#13111C] p-10 rounded-2xl shadow-lg border border-purple-900/20">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-transparent bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text">
              Invalid Reset Link
            </h2>
            <p className="mt-4 text-gray-400">
              This password reset link is invalid or has expired. Please request
              a new password reset link.
            </p>
            <button
              onClick={() => router.push("/forgot-password")}
              className="mt-6 w-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500 text-white py-3 px-4 rounded-full font-medium transition-all duration-300"
            >
              Request New Reset Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] bg-gradient-to-br from-[#0A0A0F] via-[#13111C] to-[#170F23] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[#13111C] p-10 rounded-2xl shadow-lg border border-purple-900/20">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-transparent bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text">
            Reset Password
          </h2>
          <p className="mt-2 text-gray-400">Enter your new password</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
          {error && (
            <div className="text-red-500 text-center text-sm">{error}</div>
          )}
          {success && (
            <div className="text-green-500 text-center text-sm">
              Password reset successfully! Redirecting to login...
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className={`appearance-none block w-full px-4 py-3 border ${
                  passwordError ? "border-red-500" : "border-purple-900/20"
                } placeholder-gray-500 text-gray-300 bg-[#1A1723] rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm pr-12`}
                placeholder="Enter your new password"
                value={newPassword}
                onChange={handlePasswordChange}
                onBlur={() => setPasswordError(validatePassword(newPassword))}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-300 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <EyeIcon className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
            {passwordError && (
              <p className="mt-1 text-sm text-red-500">{passwordError}</p>
            )}
          </div>

          <button
            type="submit"
            className={`w-full ${
              loading || passwordError || !newPassword
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500"
            } text-white py-3 px-4 rounded-full font-medium transition-all duration-300`}
            disabled={loading || passwordError || !newPassword}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
