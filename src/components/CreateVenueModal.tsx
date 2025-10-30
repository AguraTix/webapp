import React, { useState } from "react";
import { X, MapPin, Users, Building, Plus, Trash2 } from "lucide-react";
import { createVenue, type VenueSection } from "../api/venue";

interface CreateVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVenueCreated: (venue: unknown) => void;
}

const CreateVenueModal: React.FC<CreateVenueModalProps> = ({
  isOpen,
  onClose,
  onVenueCreated,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    hasSections: false,
    capacity: 0,
    sections: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) {
      newErrors.push("Venue name is required");
    }

    if (!formData.location.trim()) {
      newErrors.push("Location is required");
    }

    if (formData.capacity <= 0) {
      newErrors.push("Capacity must be greater than 0");
    }

    if (formData.hasSections) {
      if (formData.sections.length === 0) {
        newErrors.push("At least one section is required when hasSections is true");
      }

      const totalSectionCapacity = formData.sections.reduce((sum, section) => sum + (section.capacity || 0), 0);
      if (totalSectionCapacity !== formData.capacity) {
        newErrors.push("Sum of section capacities must equal venue capacity");
      }

      formData.sections.forEach((section, index) => {
        if (!section.name.trim()) {
          newErrors.push(`Section ${index + 1} name is required`);
        }
        if (section.capacity <= 0) {
          newErrors.push(`Section ${index + 1} capacity must be greater than 0`);
        }
      });
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

      const response = await createVenue(formData);

      if (response.success && response.data) {
        console.log("Venue created successfully:", response.data);
        setIsSuccess(true);

        // Auto-close after 2 seconds
        setTimeout(() => {
          onVenueCreated(response.data.venue);
          resetForm();
          onClose();
        }, 2000);
      } else {
        throw new Error(response.error || "Failed to create venue");
      }
    } catch (error) {
      console.error("Error creating venue:", error);
      setErrors([
        error instanceof Error ? error.message : "Failed to create venue",
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      hasSections: false,
      capacity: 0,
      sections: [],
    });
    setErrors([]);
    setIsSuccess(false);
  };

  // Section management functions
  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, { name: '', capacity: 0 }]
    }));
  };

  const removeSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const updateSection = (index: number, field: keyof VenueSection, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Building className="w-6 h-6 text-primary" />
            Create New Venue
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
                    Venue Created Successfully!
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

          {/* Venue Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Venue Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 bg-[#101010] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-primary focus:outline-none"
              placeholder="Enter venue name"
              disabled={isSubmitting || isSuccess}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-4 py-3 bg-[#101010] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-primary focus:outline-none"
              placeholder="Enter venue location"
              disabled={isSubmitting || isSuccess}
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Capacity *
            </label>
            <input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  capacity: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-3 bg-[#101010] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-primary focus:outline-none"
              placeholder="Enter venue capacity"
              disabled={isSubmitting || isSuccess}
            />
          </div>

          {/* Has Sections Toggle */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.hasSections}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hasSections: e.target.checked,
                    sections: e.target.checked ? formData.sections : [],
                  })
                }
                className="w-4 h-4 text-primary bg-[#101010] border-gray-700 rounded focus:ring-primary focus:ring-2"
                disabled={isSubmitting || isSuccess}
              />
              <span className="text-sm font-medium text-gray-300">
                This venue has sections
              </span>
            </label>
          </div>

          {/* Sections Management */}
          {formData.hasSections && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-300">
                  Venue Sections *
                </label>
                <button
                  type="button"
                  onClick={addSection}
                  className="flex items-center gap-1 px-3 py-1 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors text-sm"
                  disabled={isSubmitting || isSuccess}
                >
                  <Plus className="w-4 h-4" />
                  Add Section
                </button>
              </div>

              {formData.sections.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-sm">
                  No sections added yet. Click "Add Section" to create one.
                </div>
              ) : (
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {formData.sections.map((section, index) => (
                    <div
                      key={index}
                      className="bg-[#101010] border border-gray-700 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm font-medium">
                          Section {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSection(index)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          disabled={isSubmitting || isSuccess}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={section.name}
                          onChange={(e) =>
                            updateSection(index, "name", e.target.value)
                          }
                          className="px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded text-white placeholder-gray-500 focus:border-primary focus:outline-none text-sm"
                          placeholder="Section name"
                          disabled={isSubmitting || isSuccess}
                        />
                        <input
                          type="number"
                          min="1"
                          value={section.capacity}
                          onChange={(e) =>
                            updateSection(
                              index,
                              "capacity",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="px-3 py-2 bg-[#1A1A1A] border border-gray-600 rounded text-white placeholder-gray-500 focus:border-primary focus:outline-none text-sm"
                          placeholder="Capacity"
                          disabled={isSubmitting || isSuccess}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {formData.sections.length > 0 && (
                <div className="mt-2 text-xs text-gray-400">
                  Total section capacity:{" "}
                  {formData.sections.reduce(
                    (sum, section) => sum + (section.capacity || 0),
                    0
                  )}{" "}
                  / {formData.capacity}
                </div>
              )}
            </div>
          )}

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
              {isSubmitting ? "Creating..." : "Create Venue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVenueModal;
