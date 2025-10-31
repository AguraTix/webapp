// Venue API for frontend integration with backend

// Base API URL - using the same as other APIs
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://agurabackend.onrender.com";

// Venue interfaces based on your backend structure
export interface Venue {
  venue_id?: string; // Primary key from backend
  id?: string; // Fallback for compatibility
  name: string;
  location: string;
  hasSections: boolean;
  capacity: number;
  sections: VenueSection[];
  created_at?: string;
  updated_at?: string;
  admin_id?: string;
}

export interface VenueSection {
  section_id?: string;
  name: string;
  capacity: number;
}

export interface CreateVenueData {
  name: string;
  location: string;
  hasSections: boolean;
  capacity: number;
  sections: VenueSection[];
}

export interface UpdateVenueData {
  name?: string;
  location?: string;
  hasSections?: boolean;
  capacity?: number;
  sections?: VenueSection[];
}

// API Response interfaces
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface VenueResponse {
  message: string;
  venue: Venue;
}

interface VenuesResponse {
  message: string;
  venues: Venue[];
}

// Helper function to make authenticated API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem("token");
    const url = `${API_BASE_URL}/api/venues${endpoint}`;

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
          data.error ||
          data.message ||
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

// Create a new venue (Admin only)
export async function createVenue(
  venueData: CreateVenueData
): Promise<ApiResponse<VenueResponse>> {
  return apiRequest<VenueResponse>("", {
    method: "POST",
    body: JSON.stringify(venueData),
  });
}

// Get all venues (Public)
export async function getAllVenues(): Promise<ApiResponse<VenuesResponse>> {
  return apiRequest<VenuesResponse>("");
}

// Get venue by ID (Public)
export async function getVenueById(
  venueId: string
): Promise<ApiResponse<VenueResponse>> {
  return apiRequest<VenueResponse>(`/${venueId}`);
}

// Update venue (Admin only)
export async function updateVenue(
  venueId: string,
  updateData: UpdateVenueData
): Promise<ApiResponse<VenueResponse>> {
  return apiRequest<VenueResponse>(`/${venueId}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });
}

// Delete venue (Admin only)
export async function deleteVenue(
  venueId: string
): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>(`/${venueId}`, {
    method: "DELETE",
  });
}

// Utility functions for venue management
export const venueUtils = {
  // Get the correct ID from venue object (handles both venue_id and id)
  getVenueId: (venue: Venue): string | undefined => {
    return venue.venue_id || venue.id;
  },
  // Check if user can manage venues (is admin)
  canManageVenues: (): boolean => {
    const userProfile = localStorage.getItem("userProfile");
    if (!userProfile) return false;

    try {
      const user = JSON.parse(userProfile);
      return user.role === "admin" || user.role === "ADMIN";
    } catch {
      return false;
    }
  },

  // Get current user ID
  getCurrentUserId: (): string | null => {
    const userProfile = localStorage.getItem("userProfile");
    if (!userProfile) return null;

    try {
      const user = JSON.parse(userProfile);
      return user.id || user.user_id;
    } catch {
      return null;
    }
  },

  // Validate venue data before submission
  validateVenueData: (venueData: CreateVenueData): string[] => {
    const errors: string[] = [];

    if (!venueData.name?.trim()) {
      errors.push("Venue name is required");
    }

    if (!venueData.location?.trim()) {
      errors.push("Venue location is required");
    }

    if (!venueData.capacity || venueData.capacity <= 0) {
      errors.push("Venue capacity must be greater than 0");
    }

    if (venueData.capacity && venueData.capacity > 100000) {
      errors.push("Venue capacity seems too large");
    }

    return errors;
  },

  // Format venue data for display
  formatVenueInfo: (venue: Venue): string => {
    return `${venue.name} - ${venue.location} (Capacity: ${venue.capacity})`;
  },

  // Get venue capacity status
  getCapacityStatus: (
    venue: Venue,
    currentAttendees: number = 0
  ): {
    status: "low" | "medium" | "high" | "full";
    percentage: number;
    color: string;
  } => {
    const percentage = (currentAttendees / venue.capacity) * 100;

    if (percentage >= 100) {
      return { status: "full", percentage: 100, color: "text-red-500" };
    } else if (percentage >= 80) {
      return { status: "high", percentage, color: "text-orange-500" };
    } else if (percentage >= 50) {
      return { status: "medium", percentage, color: "text-yellow-500" };
    } else {
      return { status: "low", percentage, color: "text-green-500" };
    }
  },

  // Sort venues by different criteria
  sortVenues: (
    venues: Venue[],
    sortBy: "name" | "location" | "capacity" | "created_at" = "name"
  ): Venue[] => {
    return [...venues].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "location":
          return a.location.localeCompare(b.location);
        case "capacity":
          return b.capacity - a.capacity; // Descending order
        case "created_at":
          return (
            new Date(b.created_at || "").getTime() -
            new Date(a.created_at || "").getTime()
          );
        default:
          return 0;
      }
    });
  },

  // Filter venues by capacity range
  filterByCapacity: (
    venues: Venue[],
    minCapacity: number = 0,
    maxCapacity: number = Infinity
  ): Venue[] => {
    return venues.filter(
      (venue) => venue.capacity >= minCapacity && venue.capacity <= maxCapacity
    );
  },

  // Search venues by name or location
  searchVenues: (venues: Venue[], searchTerm: string): Venue[] => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return venues;

    return venues.filter(
      (venue) =>
        venue.name.toLowerCase().includes(term) ||
        venue.location.toLowerCase().includes(term)
    );
  },
};

// Venue management hooks for React components
export const useVenueManagement = () => {
  const canManage = venueUtils.canManageVenues();
  const userId = venueUtils.getCurrentUserId();

  return {
    canManage,
    userId,
    createVenue,
    updateVenue,
    deleteVenue,
    getAllVenues,
    getVenueById,
    venueUtils,
  };
};

// Export types for use in components
export type { VenueResponse, VenuesResponse };
