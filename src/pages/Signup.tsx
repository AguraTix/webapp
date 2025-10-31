import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "./AuthLayout";
import { register } from "../api/auth";
import GoogleLoginButton from "../components/GoogleLoginButton";

// Define API response type for type safety
interface RegisterResponse {
  success: boolean;
  data?: { token: string; user: { id: string; email: string } };
  error?: string;
}

interface SignupFormData {
  email: string;
  name: string;
  phone_number: string;
  password: string;
}

interface FormErrors {
  email?: string;
  name?: string;
  phone_number?: string;
  password?: string;
  general?: string;
}

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    name: "",
    phone_number: "",
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

    // Reset success state if user starts typing again
    if (isSuccess) {
      setIsSuccess(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.name) {
      newErrors.name = "Full name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Full name must be at least 2 characters";
    }

    if (!formData.phone_number) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone_number)) {
      newErrors.phone_number = "Phone number is invalid";
    } else if (formData.phone_number.replace(/\D/g, "").length < 10) {
      newErrors.phone_number = "Phone number must be at least 10 digits";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
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
      const response: RegisterResponse = await register(formData);

      if (response.success && response.data) {
        // Save authentication data to localStorage
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Show success message
        setIsSuccess(true);

        // Clear form data
        setFormData({
          email: "",
          name: "",
          phone_number: "",
          password: "",
        });

        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        // Handle signup error with user-friendly messages
        console.log("Registration failed:", response.error); // Log actual error for debugging
        
      
        setErrors({
          general: response.error||"Failed to Register User",
        });
      }
    } catch (error) {
      console.error("Registration network error:", error); // Log actual error for debugging
      setErrors({
        general: "Connection error. Please check your internet and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Removed unused social login placeholders

  return (
    <AuthLayout>
      <h2 className="text-xl font-bold text-white mb-2">Create account</h2>
      <p className="text-[#CDCDE0] text-sm mb-6">
        Create a new account and be able to create new events
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
                Account Created Successfully!
              </p>
              <p className="text-green-300 text-xs mt-1">
                Welcome to our platform! You can now{" "}
                <Link
                  to="/login"
                  className="text-green-200 underline hover:text-green-100"
                >
                  sign in to your account
                </Link>{" "}
                to start creating events. Redirecting in 3 seconds...
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
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full bg-[#23232B] text-white rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.email
                  ? "focus:ring-red-500 border border-red-500"
                  : "focus:ring-primary"
              }`}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-red-400 text-xs mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Full Name Input */}
          <div>
            <label htmlFor="name" className="sr-only">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full bg-[#23232B] text-white rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? "focus:ring-red-500 border border-red-500"
                  : "focus:ring-primary"
              }`}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-red-400 text-xs mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Phone Number Input */}
          <div>
            <label htmlFor="phone_number" className="sr-only">
              Phone Number
            </label>
            <input
              id="phone_number"
              type="tel"
              name="phone_number"
              placeholder="Phone Number (e.g., 123-456-7890)"
              value={formData.phone_number}
              onChange={handleInputChange}
              className={`w-full bg-[#23232B] text-white rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.phone_number
                  ? "focus:ring-red-500 border border-red-500"
                  : "focus:ring-primary"
              }`}
              aria-invalid={!!errors.phone_number}
              aria-describedby={errors.phone_number ? "phone-error" : undefined}
            />
            {errors.phone_number && (
              <p id="phone-error" className="text-red-400 text-xs mt-1">
                {errors.phone_number}
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

          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-white rounded-full py-3 font-semibold text-lg mt-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Register"}
          </button>
        </form>
      )}

      {!isSuccess && (
        <div className="mt-4">
          {/* Divider */}
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-gray-600"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-600"></div>
          </div>

          {/* Google Signup Button */}
          <GoogleLoginButton
            onSuccess={() => navigate('/dashboard', { replace: true })}
            onError={(msg) =>
              setErrors({ general: msg || "Google signup failed. Please try again." })
            }
            disabled={false}
          />
        </div>
      )}

      {isSuccess && (
        <div className="flex flex-col gap-4">
          <Link
            to="/login"
            className="bg-primary text-white rounded-full py-3 font-semibold text-lg text-center  transition-all duration-200"
          >
            Sign In to Your Account
          </Link>
          <button
            onClick={() => {
              setIsSuccess(false);
              setErrors({});
            }}
            className="bg-gray-700 text-white rounded-full py-2 font-medium text-center hover:bg-gray-600 transition-all duration-200"
          >
            Create Another Account
          </button>
        </div>
      )}

      <div className="mt-4 text-center text-[#CDCDE0] text-sm">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-primary font-semibold hover:underline"
        >
          Login
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Signup;
