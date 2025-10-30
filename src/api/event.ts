import { getVenueById } from "./venue";

const API_BASE_URL = `${
  import.meta.env.VITE_API_URL || "https://agura-ticketing-backend.onrender.com"
}/api/events`;

// Event interfaces based on your backend structure
export interface Event {
  event_id?: string; // Primary key from Sequelize model
  title: string;
  description: string;
  date: string; // ISO date string
  venue_id: string;
  venue?: {
    id: string;
    name: string;
    location: string;
    capacity: number;
  }; // Populated venue details
  artist_lineup: string[]; // For display purposes
  tickets?: TicketType[]; // Parsed ticket data
  created_at?: string;
  updated_at?: string;
  admin_id?: string;
  event_image?: string;
  event_images?: string[];
  image_url?: string; // Backend returns image_url
}

// Ticket type interface
export interface TicketType {
  type: string;
  price: number;
  quantity: number;
}

export interface CreateEventData {
  title: string;
  description: string;
  date: string; // ISO date string like "2025-08-03T06:24:10.360Z"
  venue_id: string;
  artist_lineup: string; // JSON string or comma-separated list of artists
  tickets: CreateTicketData[]; // Array of ticket data with sections
  event_image: File | string; // Main event image file (binary) or base64 string
  event_images: (File | string)[]; // Additional event images array
}

// Note: Removed fileToBase64 function as we now use FormData for file uploads

export interface UpdateEventData {
  title?: string;
  description?: string;
  date?: string;
  venue_id?: string;
  artist_lineup?: string | string[];
  event_image?: File | string;
  event_images?: (File | string)[];
}

// Ticket interfaces based on swagger documentation
export interface CreateTicketData {
  name: string;
  price: number;
  event_id: string;
  section_id: string;
}

export interface Ticket {
  ticket_id?: string;
  name: string;
  price: number;
  event_id: string;
  section_id: string;
  created_at?: string;
  updated_at?: string;
}

// Section interfaces based on swagger documentation
export interface CreateSectionData {
  name: string;
  description: string;
  venue_id: string;
  parent_section_id?: string;
}

export interface Section {
  section_id?: string;
  name: string;
  description: string;
  venue_id: string;
  parent_section_id?: string;
  created_at?: string;
  updated_at?: string;
}

// API Response interfaces
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface EventResponse {
  message: string;
  event: Event;
}

interface EventsResponse {
  message: string;
  events: Event[];
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = getAuthToken();
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

// Create a new event (Admin only)
export async function createEvent(
  eventData: CreateEventData
): Promise<ApiResponse<EventResponse>> {
  // Use FormData like menu creation (which works correctly)
  const formData = new FormData();
  formData.append("title", eventData.title);
  formData.append("description", eventData.description);
  formData.append("date", eventData.date);
  formData.append("venue_id", eventData.venue_id);
  formData.append("artist_lineup", eventData.artist_lineup);
  formData.append("tickets", JSON.stringify(eventData.tickets));

  // Add main event image if exists
  if (eventData.event_image) {
    if (eventData.event_image instanceof File) {
      formData.append("event_image", eventData.event_image);
    } else if (
      typeof eventData.event_image === "string" &&
      eventData.event_image.trim()
    ) {
      // Handle string URLs or base64 data
      formData.append("event_image", eventData.event_image);
    }
  }

  // Add additional event images if they exist
  if (eventData.event_images && eventData.event_images.length > 0) {
    eventData.event_images.forEach((image, index) => {
      if (image instanceof File) {
        formData.append("event_images", image);
      } else if (typeof image === "string" && image.trim()) {
        // Handle string URLs or base64 data
        formData.append("event_images", image);
      }
    });
  }

  // Debug: Log FormData contents

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Event creation failed:", response.status, data);
      return {
        success: false,
        error:
          data.message ||
          data.error ||
          `HTTP error! status: ${response.status}`,
      };
    }

    // If event creation was successful and we have tickets to create
    if (eventData.tickets && eventData.tickets.length > 0) {
      // Create tickets for each section
      const ticketPromises = eventData.tickets.map((ticket) =>
        createTicket({
          ...ticket,
          event_id: data.event.event_id,
        })
      );

      try {
        const ticketResults = await Promise.all(ticketPromises);
        const failedTickets = ticketResults.filter((result) => !result.success);

        if (failedTickets.length > 0) {
          console.warn("Some tickets failed to create:", failedTickets);
          // Event was created successfully, but some tickets failed
          // We'll still return success but with a warning
        }
      } catch (ticketError) {
        console.error("Error creating tickets:", ticketError);
        // Event was created successfully, but tickets failed
        // We'll still return success but log the error
      }
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Network error during event creation:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

// Get all events (Public)
export async function getAllEvents(): Promise<ApiResponse<EventsResponse>> {
  try {
    // First, get all events
    const eventsResponse = await apiRequest<EventsResponse>("");

    if (!eventsResponse.success || !eventsResponse.data?.events) {
      return eventsResponse;
    }

    const events = eventsResponse.data.events;

    // Create a cache for venue details to avoid duplicate requests
    const venueCache = new Map<string, unknown>();

    // Fetch venue details for each event
    const eventsWithVenues = await Promise.all(
      events.map(async (event) => {
        if (event.venue_id) {
          try {
            // Check cache first
            let venueData = venueCache.get(event.venue_id);

            if (!venueData) {
              const venueResponse = await getVenueById(event.venue_id);
              if (venueResponse.success && venueResponse.data?.venue) {
                venueData = venueResponse.data.venue;
                venueCache.set(event.venue_id, venueData);
              }
            }

            if (venueData) {
              event.venue = {
                id: venueData.venue_id || venueData.id || event.venue_id,
                name: venueData.name,
                location: venueData.location,
                capacity: venueData.capacity,
              };
            }
          } catch (error) {
            console.warn(
              `Failed to fetch venue details for event ${event.event_id}:`,
              error
            );
          }
        }
        return event;
      })
    );

    return {
      success: true,
      data: {
        message: eventsResponse.data.message,
        events: eventsWithVenues,
      },
    };
  } catch (error) {
    console.error("Error in getAllEvents:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch events",
    };
  }
}

// Get event by ID (Public)
export async function getEventById(
  eventId: string
): Promise<ApiResponse<EventResponse>> {
  try {
    // First, get the event data
    const eventResponse = await apiRequest<EventResponse>(`/${eventId}`);

    if (!eventResponse.success || !eventResponse.data?.event) {
      return eventResponse;
    }

    const event = eventResponse.data.event;

    // Then, get the venue details using the venue_id
    if (event.venue_id) {
      const venueResponse = await getVenueById(event.venue_id);

      if (venueResponse.success && venueResponse.data?.venue) {
        // Add venue details to the event object
        event.venue = {
          id:
            venueResponse.data.venue.venue_id ||
            venueResponse.data.venue.id ||
            event.venue_id,
          name: venueResponse.data.venue.name,
          location: venueResponse.data.venue.location,
          capacity: venueResponse.data.venue.capacity,
        };
      } else {
        console.warn("Failed to fetch venue details:", venueResponse.error);
      }
    }

    return {
      success: true,
      data: {
        message: eventResponse.data.message,
        event: event,
      },
    };
  } catch (error) {
    console.error("Error in getEventById:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch event details",
    };
  }
}

// Update event (Admin only)
export async function updateEvent(
  eventId: string,
  updateData: UpdateEventData
): Promise<ApiResponse<EventResponse>> {
  // Check if we have file uploads
  const hasFiles =
    (updateData.event_image && updateData.event_image instanceof File) ||
    (updateData.event_images &&
      updateData.event_images.some((img) => img instanceof File));

  if (hasFiles) {
    // Use FormData for file uploads
    const formData = new FormData();

    // Add text fields
    if (updateData.title) formData.append("title", updateData.title);
    if (updateData.description)
      formData.append("description", updateData.description);
    if (updateData.date) formData.append("date", updateData.date);
    if (updateData.venue_id) formData.append("venue_id", updateData.venue_id);

    // Handle artist_lineup
    if (updateData.artist_lineup) {
      const artistLineup = Array.isArray(updateData.artist_lineup)
        ? JSON.stringify(updateData.artist_lineup)
        : updateData.artist_lineup;
      formData.append("artist_lineup", artistLineup);
    }

    // Add main image file if exists
    if (updateData.event_image && updateData.event_image instanceof File) {
      formData.append("event_image", updateData.event_image);
    }

    // Add additional image files
    if (updateData.event_images && updateData.event_images.length > 0) {
      for (const image of updateData.event_images) {
        if (image instanceof File) {
          formData.append("event_images", image);
        }
      }
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/${eventId}`, {
        method: "PUT",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Don't set Content-Type for FormData - browser will set it with boundary
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
    // Use JSON for text-only updates
    const jsonData = { ...updateData };

    // Convert artist_lineup to string if it's an array
    if (Array.isArray(jsonData.artist_lineup)) {
      jsonData.artist_lineup = JSON.stringify(jsonData.artist_lineup);
    }

    return apiRequest<EventResponse>(`/${eventId}`, {
      method: "PUT",
      body: JSON.stringify(jsonData),
    });
  }
}

// Delete event (Admin only)
export async function deleteEvent(
  eventId: string
): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>(`/${eventId}`, {
    method: "DELETE",
  });
}

// Get events by venue (Public)
export async function getEventsByVenue(
  venueId: string
): Promise<ApiResponse<EventsResponse>> {
  return apiRequest<EventsResponse>(`/venue/${venueId}`);
}

// Get recent events (Public)
export async function getRecentEvents(
  limit?: number
): Promise<ApiResponse<EventsResponse>> {
  const endpoint = limit ? `/recent?limit=${limit}` : "/recent";
  return apiRequest<EventsResponse>(endpoint);
}

// Utility functions for event management
export const eventUtils = {
  // Get the correct ID from event object (handles event_id, id, and _id)
  getEventId: (event: Event): string | undefined => {
    return event.event_id;
  },

  // Get venue name from event (with fallback to venue_id)
  getVenueName: (event: Event): string => {
    return event.venue?.name || `Venue ID: ${event.venue_id}`;
  },

  // Get venue location from event
  getVenueLocation: (event: Event): string => {
    return event.venue?.location || "Location not available";
  },

  // Get venue capacity from event
  getVenueCapacity: (event: Event): number | null => {
    return event.venue?.capacity || null;
  },

  // Get event image URL with fallback
  getEventImageUrl: (event: Event): string | null => {
    const baseUrl =
      import.meta.env.VITE_API_URL ||
      "https://agura-ticketing-backend.onrender.com";

    // Check multiple possible image fields
    const imageFields = [
      event.image_url,
      event.event_image,
      event.event_images?.[0], // First image from array
    ];

    for (const imageField of imageFields) {
      if (
        imageField &&
        typeof imageField === "string" &&
        imageField.trim() !== ""
      ) {
        // If it's already a full URL (http/https), return as is
        if (
          imageField.startsWith("http://") ||
          imageField.startsWith("https://")
        ) {
          return imageField;
        }

        // If it's already a data URL (base64), return as is
        if (imageField.startsWith("data:")) {
          return imageField;
        }

        // If it's a relative path, prepend base URL
        let finalUrl;
        if (imageField.startsWith("/")) {
          finalUrl = `${baseUrl}${imageField}`;
        } else {
          finalUrl = `${baseUrl}/${imageField}`;
        }

        // Test if the URL is accessible (optional - can be removed in production)
        if (typeof window !== "undefined") {
          fetch(finalUrl, { method: "HEAD" })
            .then((response) => {
              if (!response.ok) {
                console.warn(
                  "Image URL not accessible:",
                  finalUrl,
                  "Status:",
                  response.status
                );
              } else {
                console.log("Image URL is accessible:", finalUrl);
              }
            })
            .catch((error) => {
              console.warn("Error checking image URL:", finalUrl, error);
            });
        }

        return finalUrl;
      }
    }

    return null;
  },

  // Get all event image URLs (main + gallery)
  getAllEventImageUrls: (event: Event): string[] => {
    const baseUrl =
      import.meta.env.VITE_API_URL ||
      "https://agura-ticketing-backend.onrender.com";
    const imageUrls: string[] = [];

    // Add main image
    const mainImageUrl = eventUtils.getEventImageUrl(event);
    if (mainImageUrl) {
      imageUrls.push(mainImageUrl);
    }

    // Add gallery images
    if (event.event_images && Array.isArray(event.event_images)) {
      event.event_images.forEach((imageData: unknown, index: number) => {
        console.log(`Processing gallery image ${index + 1}:`, imageData);

        let imageUrl: string | null = null;

        if (imageData) {
          if (typeof imageData === "string") {
            // Direct string URL or path
            if (
              imageData.startsWith("http://") ||
              imageData.startsWith("https://")
            ) {
              imageUrl = imageData;
            } else if (imageData.startsWith("data:")) {
              imageUrl = imageData;
            } else if (imageData.trim()) {
              // Relative path
              imageUrl = imageData.startsWith("/")
                ? `${baseUrl}${imageData}`
                : `${baseUrl}/${imageData}`;
            }
          } else if (imageData.data && imageData.mimetype) {
            // Base64 data with mimetype
            imageUrl = `data:${imageData.mimetype};base64,${imageData.data}`;
          } else if (imageData.url) {
            // Object with URL property
            imageUrl = imageData.url.startsWith("http")
              ? imageData.url
              : `${baseUrl}${imageData.url}`;
          }
        }

        if (imageUrl) {
          imageUrls.push(imageUrl);
        }
      });
    }

    return imageUrls;
  },

  // Format date for display
  formatEventDate: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  // Check if user can manage events (is admin)
  canManageEvents: (): boolean => {
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

  // Validate event data before submission
  validateEventData: (eventData: CreateEventData): string[] => {
    const errors: string[] = [];

    if (!eventData.title?.trim()) {
      errors.push("Event title is required");
    }

    if (!eventData.description?.trim()) {
      errors.push("Event description is required");
    }

    if (!eventData.date) {
      errors.push("Event date is required");
    } else {
      const eventDate = new Date(eventData.date);
      const now = new Date();
      if (eventDate <= now) {
        errors.push("Event date must be in the future");
      }
    }

    if (!eventData.venue_id?.trim()) {
      errors.push("Venue is required");
    }

    if (!eventData.artist_lineup || eventData.artist_lineup.length === 0) {
      errors.push("At least one artist is required");
    }

    return errors;
  },

  formatEventDataForAPI: (formData: unknown): CreateEventData => {
    // Format artist lineup as JSON string
    const artistLineup = formData.artists
      ? JSON.stringify(
          formData.artists.filter((artist: string) => artist.trim())
        )
      : formData.artist_lineup
      ? Array.isArray(formData.artist_lineup)
        ? JSON.stringify(
            formData.artist_lineup.filter((artist: string) => artist.trim())
          )
        : formData.artist_lineup
      : "[]";

    // Format tickets - now as array of CreateTicketData objects
    const tickets = formData.tickets || [];

    return {
      title: formData.eventName || formData.title,
      description:
        formData.description ||
        formData.eventDescription ||
        "Event description",
      date:
        formData.eventDate && formData.eventTime
          ? `${formData.eventDate}T${formData.eventTime}:00.000Z`
          : formData.date,
      venue_id: formData.venue_id || formData.eventLocation,
      artist_lineup: artistLineup,
      tickets: tickets,
      event_image: formData.event_image || "", // This will be the File object
      event_images: formData.event_images || [], // This will be array of File objects
    };
  },

  // Check if event is upcoming
  isUpcoming: (eventDate: string): boolean => {
    return new Date(eventDate) > new Date();
  },

  // Get event status
  getEventStatus: (eventDate: string): "upcoming" | "ongoing" | "completed" => {
    const now = new Date();
    const event = new Date(eventDate);
    const eventEnd = new Date(event.getTime() + 4 * 60 * 60 * 1000); // Assume 4 hours duration

    if (now < event) return "upcoming";
    if (now >= event && now <= eventEnd) return "ongoing";
    return "completed";
  },
};

// Event management hooks for React components
export const useEventManagement = () => {
  const canManage = eventUtils.canManageEvents();
  const userId = eventUtils.getCurrentUserId();

  return {
    canManage,
    userId,
    createEvent,
    updateEvent,
    deleteEvent,
    getAllEvents,
    getEventById,
    getEventsByVenue,
    getRecentEvents,
  };
};

// Ticket management functions
export async function createTicket(
  ticketData: CreateTicketData
): Promise<ApiResponse<{ message: string; ticket: Ticket }>> {

  const token = getAuthToken();

  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL ||
        "https://agura-ticketing-backend.onrender.com"
      }/api/tickets`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(ticketData),
      }
    );

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
    console.error("Error creating ticket:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function getTicketsByEvent(
  eventId: string
): Promise<ApiResponse<{ message: string; tickets: Ticket[] }>> {
  const token = getAuthToken();

  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL ||
        "https://agura-ticketing-backend.onrender.com"
      }/api/tickets/event/${eventId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

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
    console.error("Error fetching tickets:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function getTicketsBySection(
  sectionId: string
): Promise<ApiResponse<{ message: string; tickets: Ticket[] }>> {
  const token = getAuthToken();

  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL ||
        "https://agura-ticketing-backend.onrender.com"
      }/api/tickets/section/${sectionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

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
    console.error("Error fetching tickets by section:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

// Export types for use in components
