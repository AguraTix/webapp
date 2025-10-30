import React, { useState } from "react";
import {
  X,
  ChefHat,
  DollarSign,
  Package,
  FileText,
  Camera,
} from "lucide-react";

interface AddMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onMenuItemAdded: () => void;
}

interface MenuItemData {
  FoodName: string;
  Quantity: number;
  FoodPrice: number;
  FoodDescription: string;
  foodimage: File | null;
}

const AddMenuItemModal: React.FC<AddMenuItemModalProps> = ({
  isOpen,
  onClose,
  eventId,
  onMenuItemAdded,
}) => {
  const [formData, setFormData] = useState<MenuItemData>({
    FoodName: "",
    Quantity: 0,
    FoodPrice: 0,
    FoodDescription: "",
    foodimage: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "Quantity" || name === "FoodPrice" ? Number(value) : value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image file
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      setErrors(["Please select a valid image file (JPEG, PNG, GIF, or WebP)"]);
      return;
    }

    if (file.size > maxSize) {
      setErrors(["Image size must be less than 2MB"]);
      return;
    }

    setFormData((prev) => ({ ...prev, foodimage: file }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Clear any previous errors
    setErrors([]);
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, foodimage: null }));
    setImagePreview(null);
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    console.log("Validating form data:", formData);

    if (!formData.FoodName || !formData.FoodName.trim()) {
      newErrors.push("Food name is required");
      console.log("Food name validation failed:", formData.FoodName);
    }

    if (formData.Quantity <= 0) {
      newErrors.push("Quantity must be greater than 0");
      console.log("Quantity validation failed:", formData.Quantity);
    }

    if (formData.FoodPrice <= 0) {
      newErrors.push("Price must be greater than 0");
      console.log("Price validation failed:", formData.FoodPrice);
    }

    if (!formData.FoodDescription || !formData.FoodDescription.trim()) {
      newErrors.push("Description is required");
      console.log("Description validation failed:", formData.FoodDescription);
    }

    console.log("Validation errors:", newErrors);
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append("FoodName", formData.FoodName);
      submitData.append("Quantity", formData.Quantity.toString());
      submitData.append("FoodPrice", formData.FoodPrice.toString());
      submitData.append("FoodDescription", formData.FoodDescription);
      submitData.append("event_id", eventId);

      if (formData.foodimage) {
        submitData.append("foodimage", formData.foodimage);
      }

      // Debug: Log the form data before sending
      console.log("Form data being sent:", {
        FoodName: formData.FoodName,
        Quantity: formData.Quantity,
        FoodPrice: formData.FoodPrice,
        FoodDescription: formData.FoodDescription,
        event_id: eventId,
        foodimage: formData.foodimage,
      });

      // Make API call to add menu item using the menu API
      const menuItemData = {
        FoodName: formData.FoodName.trim(),
        Quantity: formData.Quantity,
        FoodPrice: formData.FoodPrice,
        FoodDescription: formData.FoodDescription.trim(),
        event_id: eventId,
        foodimage: formData.foodimage || undefined,
      };

      // Test with different field names that the backend might expect
      const alternativeData = {
        foodName: formData.FoodName.trim(), // lowercase
        quantity: formData.Quantity,
        foodPrice: formData.FoodPrice,
        foodDescription: formData.FoodDescription.trim(),
        eventId: eventId, // camelCase
        foodimage: formData.foodimage || undefined,
      };

      console.log("Alternative data format:", alternativeData);

      const { createMenuItem } = await import("../api/menu");
      const response = await createMenuItem(menuItemData);

      if (!response.success) {
        throw new Error(response.error || "Failed to add menu item");
      }

      // Success - show success message
      console.log("Menu item created successfully!");
      setIsSuccess(true);
      
      // Auto-close after 2 seconds and refresh menu
      setTimeout(() => {
        onMenuItemAdded();
        resetForm();
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error adding menu item:", error);
      setErrors([
        error instanceof Error ? error.message : "Failed to add menu item",
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      FoodName: "",
      Quantity: 0,
      FoodPrice: 0,
      FoodDescription: "",
      foodimage: null,
    });
    setImagePreview(null);
    setErrors([]);
    setIsSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-[#1A1A1A] rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Add Menu Item
              </h2>
              <p className="text-sm text-gray-400">
                Add a new food item to the event menu
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success Message */}
          {isSuccess && (
            <div
              className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg"
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
                    Menu Item Added Successfully!
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
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-red-400 font-medium">
                  Please fix the following errors:
                </span>
              </div>
              <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Food Name */}
          <div>
            <label className="block text-sm font-medium text-[#CDCDE0] mb-2">
              Food Name *
            </label>
            <div className="relative">
              <ChefHat className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="FoodName"
                value={formData.FoodName}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-[#101010] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-primary focus:outline-none"
                placeholder="Enter food item name"
                required
              />
            </div>
          </div>

          {/* Quantity and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#CDCDE0] mb-2">
                Quantity *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="Quantity"
                  value={formData.Quantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full pl-10 pr-4 py-3 bg-[#101010] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-primary focus:outline-none"
                  placeholder="Available quantity"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#CDCDE0] mb-2">
                Price (Rwf) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="FoodPrice"
                  value={formData.FoodPrice}
                  onChange={handleInputChange}
                  min="1"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 bg-[#101010] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-primary focus:outline-none"
                  placeholder="Price in Naira"
                  required
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#CDCDE0] mb-2">
              Description *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                name="FoodDescription"
                value={formData.FoodDescription}
                onChange={handleInputChange}
                rows={4}
                className="w-full pl-10 pr-4 py-3 bg-[#101010] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-primary focus:outline-none resize-none"
                placeholder="Describe the food item, ingredients, etc."
                required
              />
            </div>
          </div>

          {/* Food Image */}
          <div>
            <label className="block text-sm font-medium text-[#CDCDE0] mb-2">
              Food Image
            </label>

            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Food preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-800"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-800 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="food-image-upload"
                />
                <label
                  htmlFor="food-image-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Camera className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Upload Food Image</p>
                    <p className="text-sm text-gray-400">
                      PNG, JPG, GIF up to 2MB
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <ChefHat className="w-4 h-4" />
                  Add Menu Item
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMenuItemModal;
