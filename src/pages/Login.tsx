import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "./AuthLayout";
import { login, authUtils } from "../api/auth";
import GoogleLoginButton from "../components/GoogleLoginButton";

// Define API response type for type safety
interface LoginResponse {
  success: boolean;
  data?: { token: string; user: { id: string; email: string; name: string } };
  error?: string;
}

interface LoginFormData {
  identifier: string; // This can be email or phone number
  password: string;
}

interface FormErrors {
  identifier?: string;
  password?: string;
  general?: string;
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.identifier) {
      newErrors.identifier = "Email or phone number is required";
    } else if (formData.identifier.includes("@")) {
      // Validate as email
      if (!/\S+@\S+\.\S+/.test(formData.identifier)) {
        newErrors.identifier = "Please enter a valid email address";
      }
    } else {
      // Validate as phone number
      if (!/^\+?[\d\s-()]+$/.test(formData.identifier)) {
        newErrors.identifier = "Please enter a valid phone number";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call the login API function
      const response: LoginResponse = await login(formData);

      if (response.success && response.data) {
        // Save authentication data to localStorage
        authUtils.saveAuthData(response.data);

        // Show success message
        setIsSuccess(true);

        // Clear form data
        setFormData({
          identifier: "",
          password: "",
        });

        // Auto-redirect after 2 seconds
        setTimeout(() => {
          // Redirect to the page user was trying to access, or dashboard as default
          const from = location.state?.from?.pathname || "/dashboard";
          navigate(from, { replace: true });
        }, 2000);
      } else {
        // Handle login error with user-friendly messages
        console.error("Login failed:", response.error); // Log actual error for debugging
        
        // Determine user-friendly error message
       
        
        setErrors({
          general: response.error||"Failed to login",
        });
      }
    } catch (error) {
      console.error("Login network error:", error); // Log actual error for debugging
      setErrors({
        general: "Connection error. Please check your internet and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-xl font-bold text-white mb-2">Login</h2>
      <p className="text-[#CDCDE0] text-sm mb-6">
        Login to your account to create and access different events
      </p>

      {/* Success Message */}
      {isSuccess && (
        <div
          className="mb-4 p-4 bg-green-900/20 border border-green-500 rounded-md"
          role="alert"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="text-green-400 font-semibold text-sm">
                Login Successful!
              </p>
              <p className="text-green-300 text-xs mt-1">
                Welcome back! Redirecting to your dashboard in 2 seconds...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* General Error Message */}
      {errors.general && (
        <div
          className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-md"
          role="alert"
        >
          <p className="text-red-400 text-sm">{errors.general}</p>
        </div>
      )}

      {!isSuccess && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email/Phone Input */}
          <div>
            <label htmlFor="identifier" className="sr-only">
              Email or Phone Number
            </label>
            <input
              id="identifier"
              type="text"
              name="identifier"
              placeholder="Email or Phone Number"
              value={formData.identifier}
              onChange={handleInputChange}
              className={`w-full bg-[#23232B] text-white rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.identifier
                  ? "focus:ring-red-500 border border-red-500"
                  : "focus:ring-primary"
              }`}
              aria-invalid={!!errors.identifier}
              aria-describedby={
                errors.identifier ? "identifier-error" : undefined
              }
            />
            {errors.identifier && (
              <p id="identifier-error" className="text-red-400 text-xs mt-1">
                {errors.identifier}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full bg-[#23232B] text-white rounded-md px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.password
                    ? "focus:ring-red-500 border border-red-500"
                    : "focus:ring-primary"
                }`}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-red-400 text-xs mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Forgot Password Link */}
          <Link
            to="/forgot-password"
            className="text-xs text-[#CDCDE0] hover:text-primary mb-2 self-end transition-colors"
          >
            Forgot Password?
          </Link>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-white rounded-full py-3 font-semibold text-lg mt-2 hover:bg-primary/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing In..." : "Login"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-gray-600"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-600"></div>
          </div>

          {/* Google Login Button */}
          <GoogleLoginButton
            onSuccess={() => navigate('/dashboard', { replace: true })}
            onError={(msg) =>
              setErrors({ general: msg || "Google login failed. Please try again." })
            }
            disabled={false}
          />
        </form>
      )}

      

      {/* Success Actions */}
      {isSuccess && (
        <div className="flex flex-col gap-4">
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center">
            <p className="text-primary font-semibold mb-2">🎉 Welcome Back!</p>
            <p className="text-[#CDCDE0] text-sm">
              You have successfully logged in to your account.
            </p>
          </div>
          <button
            onClick={() => {
              const from = location.state?.from?.pathname || "/dashboard";
              navigate(from, { replace: true });
            }}
            className="bg-primary text-white ro-full py-3 font-semibold text-lg text-center hover:bg-primary/80 transition-all duration-200"
          >
            Go to Dashboard
          </button>
        </div>
      )}

      <div className="mt-4 text-center text-[#CDCDE0] text-sm">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="text-primary font-semibold hover:underline"
        >
          Signup
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
