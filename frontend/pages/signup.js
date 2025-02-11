import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation patterns
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;

  // Validation functions
  const validateName = (name) => {
    if (!name) return "Name is required";
    if (!nameRegex.test(name))
      return "Name should only contain letters and spaces (2-50 characters)";
    return "";
  };

  const validateEmail = (email) => {
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8)
      return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(password))
      return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password))
      return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password))
      return "Password must contain at least one number";
    if (!/[!@#$%^&*]/.test(password))
      return "Password must contain at least one special character (!@#$%^&*)";
    return "";
  };

  const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== formData.password) return "Passwords do not match";
    return "";
  };

  // Handle input changes with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation
    switch (name) {
      case "name":
        setErrors((prev) => ({ ...prev, name: validateName(value) }));
        break;
      case "email":
        setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
        break;
      case "password":
        setErrors((prev) => ({
          ...prev,
          password: validatePassword(value),
          confirmPassword: formData.confirmPassword
            ? validateConfirmPassword(formData.confirmPassword)
            : "",
        }));
        break;
      case "confirmPassword":
        setErrors((prev) => ({
          ...prev,
          confirmPassword: validateConfirmPassword(value),
        }));
        break;
    }
  };

  // Check form validity
  useEffect(() => {
    const isValid =
      formData.name !== "" &&
      formData.email !== "" &&
      formData.password !== "" &&
      formData.confirmPassword !== "" &&
      errors.name === "" &&
      errors.email === "" &&
      errors.password === "" &&
      errors.confirmPassword === "";

    setIsFormValid(isValid);
  }, [formData, errors]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation check
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(
      formData.confirmPassword,
    );

    if (nameError || emailError || passwordError || confirmPasswordError) {
      setErrors({
        name: nameError,
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
      });
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData; // Remove confirmPassword from submission
      const res = await fetch("http://localhost:4000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/auth/googleAuth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Google signup failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] bg-gradient-to-br from-[#0A0A0F] via-[#13111C] to-[#170F23] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-[#13111C] p-10 rounded-2xl shadow-lg border border-purple-900/20">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-transparent bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text">
            Create Your Account
          </h2>
          <p className="mt-2 text-gray-400">
            Join CoreHealth AI to achieve your fitness goals!
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="text-red-500 text-center text-sm">{error}</div>
          )}
          <div className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                className={`appearance-none block w-full px-4 py-3 border ${
                  errors.name ? "border-red-500" : "border-purple-900/20"
                } placeholder-gray-500 text-gray-300 bg-[#1A1723] rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                onBlur={() =>
                  setErrors((prev) => ({
                    ...prev,
                    name: validateName(formData.name),
                  }))
                }
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`appearance-none block w-full px-4 py-3 border ${
                  errors.email ? "border-red-500" : "border-purple-900/20"
                } placeholder-gray-500 text-gray-300 bg-[#1A1723] rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={() =>
                  setErrors((prev) => ({
                    ...prev,
                    email: validateEmail(formData.email),
                  }))
                }
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`appearance-none block w-full px-4 py-3 border ${
                    errors.password ? "border-red-500" : "border-purple-900/20"
                  } placeholder-gray-500 text-gray-300 bg-[#1A1723] rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm pr-12`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={() =>
                    setErrors((prev) => ({
                      ...prev,
                      password: validatePassword(formData.password),
                    }))
                  }
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
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`appearance-none block w-full px-4 py-3 border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-purple-900/20"
                  } placeholder-gray-500 text-gray-300 bg-[#1A1723] rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm pr-12`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={() =>
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: validateConfirmPassword(
                        formData.confirmPassword,
                      ),
                    }))
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-300 focus:outline-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className={`w-full ${
                loading || !isFormValid
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500"
              } text-white py-3 px-4 rounded-full font-medium transition-all duration-300`}
              disabled={loading || !isFormValid}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-900/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#13111C] text-gray-400">
                Or sign up with
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google signup failed")}
              useOneTap
              cookiePolicy="single_host_origin"
            />
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
