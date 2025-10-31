import type { FoodOrder } from "../pages/EventDetails";

// Menu item interfaces
export interface MenuItem {
  menu_id?: string;
  FoodName: string;
  Quantity: number;
  FoodPrice: number;
  FoodDescription: string;
  foodimage?: string;
  event_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMenuItemData {
  FoodName: string;
  Quantity: number;
  FoodPrice: number;
  FoodDescription: string;
  foodimage?: File;
  event_id: string;
}

// API Response interfaces
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface MenuResponse {
  message: string;
  menuItem: MenuItem;
}

interface MenuListResponse {
  message: string;
  menuItems: MenuItem[];
}
interface FoodOrderListResponse {
  message: string;
  orders: FoodOrder[];
}

const API_BASE_URL = `${
  import.meta.env.VITE_API_URL || "https://agurabackend.onrender.com"
}/api`;



async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem("token");
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error:
          data.message ||
          data.error ||
          `HTTP error! status: ${response.status}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

// Create a new menu item (POST /api/foods)
export async function createMenuItem(
  menuData: CreateMenuItemData
): Promise<ApiResponse<MenuResponse>> {

  // Use FormData with correct backend field names (lowercase)
  const formData = new FormData();
  formData.append("foodname", menuData.FoodName);
  formData.append("quantity", menuData.Quantity.toString());
  formData.append("foodprice", menuData.FoodPrice.toString());
  formData.append("fooddescription", menuData.FoodDescription);
  formData.append("event_id", menuData.event_id);

  if (menuData.foodimage) {
    formData.append("foodimage", menuData.foodimage);
  }

  

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_BASE_URL}/foods`,{
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Request failed:", response.status, data);
      return {
        success: false,
        error:
          data.message ||
          data.error ||
          `HTTP error! status: ${response.status}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Network error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

// Get all food items (GET /api/foods)
export async function getAllFoodItems(): Promise<
  ApiResponse<MenuListResponse>
> {
  return apiRequest<MenuListResponse>("");
}

// Get food item by ID (GET /api/foods/{id})
export async function getFoodItemById(
  foodId: string
): Promise<ApiResponse<MenuResponse>> {
  return apiRequest<MenuResponse>(`/${foodId}`);
}

// Update food item (PUT /api/foods/{id})
export async function updateFoodItem(
  foodId: string,
  updateData: Partial<CreateMenuItemData>
): Promise<ApiResponse<MenuResponse>> {
  if (updateData.foodimage) {
    // If updating with image, use FormData with correct backend field names
    const formData = new FormData();

    // Map frontend field names to backend field names
    const fieldMapping: Record<string, string> = {
      FoodName: "foodname",
      Quantity: "quantity",
      FoodPrice: "foodprice",
      FoodDescription: "fooddescription",
      event_id: "event_id",
      foodimage: "foodimage",
    };

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        const backendKey = fieldMapping[key] || key;
        if (key === "foodimage" && value instanceof File) {
          formData.append(backendKey, value);
        } else {
          formData.append(backendKey, value.toString());
        }
      }
    });

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/foods/${foodId}`, {
        method: "PUT",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error:
            data.message ||
            data.error ||
            `HTTP error! status: ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  } else {
    // If no image, use JSON approach with correct backend field names
    const { foodimage, ...frontendData } = updateData;

    // Map frontend field names to backend field names
    const backendData: Record<string, unknown> = {};
    Object.entries(frontendData).forEach(([key, value]) => {
      const fieldMapping: Record<string, string> = {
        FoodName: "foodname",
        Quantity: "quantity",
        FoodPrice: "foodprice",
        FoodDescription: "fooddescription",
        event_id: "event_id",
      };
      const backendKey = fieldMapping[key] || key;
      backendData[backendKey] = value;
    });

    return apiRequest<MenuResponse>(`/foods/${foodId}`, {
      method: "PUT",
      body: JSON.stringify(backendData),
    });
  }
}

// Delete food item (DELETE /api/foods/{id})
export async function deleteFoodItem(
  foodId: string
): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>(`/foods/${foodId}`, {
    method: "DELETE",
  });
}

// Get menu items by event using the specific endpoint
export async function getMenuItemsByEvent(
  eventId: string
): Promise<ApiResponse<MenuListResponse>> {
  const response = await apiRequest<MenuListResponse>(`/foods/event/${eventId}`);
  return response;
}

// Backward compatibility aliases
export const getMenuItemById = getFoodItemById;
export const updateMenuItem = updateFoodItem;
export const deleteMenuItem = deleteFoodItem;

// Utility functions for menu management
export const menuUtils = {
  // Get menu item image URL with fallback
  getMenuItemImageUrl: (menuItem: MenuItem): string | null => {
    if (menuItem.foodimage) {
      // If it's already a data URL (base64), return as is
      if (menuItem.foodimage.startsWith("data:")) {
        return menuItem.foodimage;
      }
      // If it's a relative path, prepend base URL
      const baseUrl =
        import.meta.env.VITE_API_URL ||
        "https://agura-ticketing-backend.onrender.com";
      return `${baseUrl}${menuItem.foodimage}`;
    }
    return null;
  },

  // Format price for display
  formatPrice: (price: number | undefined | null): string => {
    if (price === undefined || price === null || isNaN(price)) {
      return "Rwf0";
    }
    return `Rwf${price.toLocaleString()}`;
  },

  // Check if menu item is available
  isAvailable: (menuItem: MenuItem): boolean => {
    return (menuItem.Quantity || 0) > 0;
  },

  // Get availability status
  getAvailabilityStatus: (
    menuItem: MenuItem
  ): { status: string; color: string } => {
    const quantity = menuItem.Quantity || 0;
    if (quantity > 10) {
      return { status: "In Stock", color: "text-green-400" };
    } else if (quantity > 0) {
      return { status: "Low Stock", color: "text-yellow-400" };
    } else {
      return { status: "Out of Stock", color: "text-red-400" };
    }
  },
};
export async function getFoodOrdersByEvent(
  eventId: string
): Promise<ApiResponse<FoodOrderListResponse>> {
  const response = await apiRequest<FoodOrderListResponse>(`/food-orders/event/${eventId}`);
  return response;
}

// Export types for use in components
export type { ApiResponse, MenuResponse, MenuListResponse };
