import React, { useState } from "react";
import { X, UserPlus, Mail, Phone, User, Calendar } from "lucide-react";
import { createAdmin } from "../api/admin";
import CustomCalendar from "./ui/CustomCalendar";
import CustomTimePicker from "./ui/CustomTimePicker";

interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminCreated: () => void;
}

const CreateAdminModal: React.FC<CreateAdminModalProps> = ({
  isOpen,
  onClose,
  onAdminCreated,
}) => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone_number: "",
  });
  const [expiresDate, setExpiresDate] = useState("");
  const [expiresTime, setExpiresTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.email.trim()) {
      newErrors.push("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push("Invalid email format");
    }

    if (!formData.name.trim()) {
      newErrors.push("Name is required");
    }

    if (!formData.phone_number.trim()) {
      newErrors.push("Phone number is required");
    }

    if (!expiresDate) {
      newErrors.push("Expiration date is required");
    }

    if (!expiresTime) {
      newErrors.push("Expiration time is required");
    }

    if (expiresDate && expiresTime) {
      const expiresDateTime = new Date(`${expiresDate}T${expiresTime}`);
      const now = new Date();
      if (expiresDateTime <= now) {
        newErrors.push("Expiration date and time must be in the future");
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors([]);

      // Combine date and time into ISO 8601 format
      const expiresDateTime = new Date(`${expiresDate}T${expiresTime}`);
      const formattedData = {
        ...formData,
        expires_at: expiresDateTime.toISOString(),
      };

      const response = await createAdmin(formattedData as any);

      if (response.success && response.data) {
        console.log("Admin created successfully:", response.data);
        setIsSuccess(true);

        // Auto-close after 2 seconds
        setTimeout(() => {
          onAdminCreated();
          resetForm();
          onClose();
        }, 2000);
      } else {
        throw new Error(response.error || "Failed to create admin");
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      setErrors([
        error instanceof Error ? error.message : "Failed to create admin",
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      name: "",
      phone_number: "",
    });
    setExpiresDate("");
    setExpiresTime("");
    setErrors([]);
    setIsSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">.
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-primary" />
            Create New Admin
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success Message */}
          {isSuccess && (
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
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
                    Admin Created Successfully!
                  </p>
                  <p className="text-green-300 text-xs mt-1">
                    Closing in 2 seconds...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Messages */}
          {errors.length > 0 && !isSuccess && (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <ul className="text-red-400 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 focus:ring-2 bg-[#101010] ring-primary rounded-lg text-white placeholder-gray-500 focus:border-primary focus:outline-none"
              placeholder="admin@example.com"
              disabled={isSubmitting || isSuccess}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 focus:ring-2 bg-[#101010] ring-primary rounded-lg text-white placeholder-gray-500 focus:border-primary focus:outline-none"
              placeholder="John Admin"
              disabled={isSubmitting || isSuccess}
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
              className="w-full px-4 py-3 focus:ring-2 bg-[#101010] ring-primary rounded-lg text-white placeholder-gray-500 focus:border-primary focus:outline-none"
              placeholder="+1234567890"
              disabled={isSubmitting || isSuccess}
            />
          </div>

          {/* Expiration Date and Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Expires At *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <CustomCalendar 
                value={expiresDate} 
                onChange={setExpiresDate}
              />
              <CustomTimePicker 
                value={expiresTime} 
                onChange={setExpiresTime}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Admin access will expire on this date and time
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAdminModal;
