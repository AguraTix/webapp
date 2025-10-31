// Ticket API based on Swagger documentation
const API_BASE_URL = `${
  import.meta.env.VITE_API_URL || "https://agurabackend.onrender.com"
}/api/tickets`;

// Ticket interfaces based on backend response
export interface Ticket {
  ticket_id?: string;
  name: string;
  price: number;
  event_id: string;
  section_id?: string;
  category_id?: string;
  attendee_id?: string;
  user_id?: string;
  status?: "available" | "sold" | "reserved" | "cancelled" | "Active" | "used";
  purchase_date?: string;
  purchaseDate?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  qrCodeUrl?: string;
  // Related data from backend
  event?: {
    event_id: string;
    title: string;
    date: string;
    venue_id: string;
    description?: string;
  };
  Event?: {
    event_id: string;
    title: string;
    date: string;
  };
  section?: {
    section_id: string;
    name: string;
    description: string;
  };
  ticketCategory?: {
    category_id: string;
    name: string;
    price: number;
    description?: string;
  };
  user?: {
    user_id: string;
    name: string;
    email: string;
    phone_number: string;
  };
  User?: {
    user_id: string;
    name: string;
    email: string;
  };
  Venue?: {
    venue_id: string;
    name: string;
    location: string;
    hasSections: boolean;
  };
}

export interface CreateTicketData {
  name: string;
  price: number;
  event_id: string;
  section_id: string;
}

export interface UpdateTicketData {
  name?: string;
  price?: number;
  event_id?: string;
  section_id?: string;
  status?: "available" | "sold" | "reserved" | "cancelled" | "used";
}

export interface PurchaseTicketData {
  ticket_id: string;
  user_id: string;
  payment_method?: string;
  payment_reference?: string;
}

// API Response interfaces
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface TicketResponse {
  message: string;
  ticket: Ticket;
}

interface TicketsResponse {
  message: string;
  tickets: Ticket[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface AdminBookedTicketsResponse {
  message: string;
  tickets: Ticket[];
  total: number;
  limit: number;
  offset: number;
}

interface TicketStatsResponse {
  message: string;
  stats: {
    total_tickets: number;
    sold_tickets: number;
    available_tickets: number;
    reserved_tickets: number;
    total_revenue: number;
    tickets_by_event: Array<{
      event_id: string;
      event_title: string;
      total_tickets: number;
      sold_tickets: number;
      revenue: number;
    }>;
    tickets_by_status: Array<{
      status: string;
      count: number;
    }>;
  };
}

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

// Create a new ticket (Admin only)
export async function createTicket(
  ticketData: CreateTicketData
): Promise<ApiResponse<TicketResponse>> {
  return apiRequest<TicketResponse>("", {
    method: "POST",
    body: JSON.stringify(ticketData),
  });
}

// Get all booked tickets (Admin only) - MAIN DATA SOURCE
export async function getAllBookedTickets(params?: {
  status?: string | 'all'; // 'sold', 'reserved', 'used', 'all' or comma-separated values
  limit?: number;
  offset?: number;
}): Promise<ApiResponse<AdminBookedTicketsResponse>> {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
  }

  const queryString = searchParams.toString();
  const endpoint = queryString ? `/admin/booked?${queryString}` : "/admin/booked";

  console.log("Fetching admin booked tickets from:", `${API_BASE_URL}${endpoint}`);
  const response = await apiRequest<AdminBookedTicketsResponse>(endpoint);
  console.log("Admin booked tickets response:", response);
  return response;
}

// Get all tickets - REDIRECTED TO ADMIN ENDPOINT
export async function getAllTickets(params?: {
  page?: number;
  limit?: number;
  event_id?: string;
  section_id?: string;
  status?: string;
  user_id?: string;
}): Promise<ApiResponse<AdminBookedTicketsResponse>> {
  console.log("getAllTickets called - redirecting to admin/booked endpoint");
  
  // Convert page-based pagination to offset-based for admin endpoint
  const adminParams = {
    status: params?.status || 'all',
    limit: params?.limit || 50,
    offset: params?.page ? (params.page - 1) * (params.limit || 50) : 0
  };

  return getAllBookedTickets(adminParams);
}

// Get ticket by ID - STILL NEEDS INDIVIDUAL ENDPOINT
export async function getTicketById(
  ticketId: string
): Promise<ApiResponse<TicketResponse>> {
  return apiRequest<TicketResponse>(`/${ticketId}`);
}

// Update ticket (Admin only) - STILL NEEDS INDIVIDUAL ENDPOINT  
export async function updateTicket(
  ticketId: string,
  updateData: UpdateTicketData
): Promise<ApiResponse<TicketResponse>> {
  return apiRequest<TicketResponse>(`/${ticketId}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });
}

// Delete ticket (Admin only) - STILL NEEDS INDIVIDUAL ENDPOINT
export async function deleteTicket(
  ticketId: string
): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>(`/${ticketId}`, {
    method: "DELETE",
  });
}

// Purchase ticket (User) - STILL NEEDS INDIVIDUAL ENDPOINT
export async function purchaseTicket(
  purchaseData: PurchaseTicketData
): Promise<ApiResponse<TicketResponse>> {
  return apiRequest<TicketResponse>("/purchase", {
    method: "POST",
    body: JSON.stringify(purchaseData),
  });
}

// Get tickets by event - REDIRECTED TO ADMIN ENDPOINT
export async function getTicketsByEvent(
  eventId: string,
  params?: { page?: number; limit?: number; status?: string }
): Promise<ApiResponse<AdminBookedTicketsResponse>> {
  console.log("getTicketsByEvent called - using admin/booked endpoint");
  
  // Note: Filtering by event_id will need to be done client-side 
  // since admin/booked endpoint doesn't support event_id filter
  return getAllBookedTickets({
    ...params,
    limit: params?.limit || 1000, // Get more data for client-side filtering
    offset: params?.page ? (params.page - 1) * (params.limit || 50) : 0
  });
}

// Get tickets by user - REDIRECTED TO ADMIN ENDPOINT  
export async function getTicketsByUser(
  userId: string,
  params?: { page?: number; limit?: number; status?: string }
): Promise<ApiResponse<AdminBookedTicketsResponse>> {
  console.log("getTicketsByUser called - using admin/booked endpoint");
  
  // Note: Filtering by user_id will need to be done client-side
  // since admin/booked endpoint doesn't support user_id filter
  return getAllBookedTickets({
    ...params,
    limit: params?.limit || 1000, // Get more data for client-side filtering
    offset: params?.page ? (params.page - 1) * (params.limit || 50) : 0
  });
}

// Get current user's tickets - REDIRECTED TO ADMIN ENDPOINT
export async function getMyTickets(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<ApiResponse<AdminBookedTicketsResponse>> {
  console.log("getMyTickets called - redirecting to admin/booked endpoint");
  
  // For regular users, we'll still use admin endpoint but filter client-side
  const currentUserId = ticketUtils.getCurrentUserId();
  
  const response = await getAllBookedTickets({
    status: params?.status || 'all',
    limit: params?.limit || 1000, // Get more data for client-side filtering
    offset: params?.page ? (params.page - 1) * (params.limit || 50) : 0
  });

  // Filter tickets for current user client-side if needed
  if (response.success && response.data && currentUserId) {
    const userTickets = response.data.tickets.filter(ticket => 
      ticket.user_id === currentUserId || 
      ticket.User?.user_id === currentUserId ||
      (ticket as any).userId === currentUserId
    );
    
    response.data.tickets = userTickets;
    response.data.total = userTickets.length;
  }

  return response;
}

// Get ticket statistics - CALCULATED FROM ADMIN ENDPOINT DATA
export async function getTicketStats(
  eventId?: string
): Promise<ApiResponse<TicketStatsResponse>> {
  console.log("getTicketStats called - calculating from admin/booked endpoint");
  
  try {
    // Fetch all tickets from admin endpoint
    const response = await getAllBookedTickets({ 
      limit: 10000, // Get all tickets for accurate stats
      status: 'all' 
    });
    
    if (!response.success || !response.data) {
      return {
        success: false,
        error: "Failed to fetch tickets for stats calculation"
      };
    }

    let tickets = response.data.tickets || [];

    // Filter by event if specified
    if (eventId) {
      tickets = tickets.filter(ticket => 
        ticket.event_id === eventId || 
        ticket.Event?.event_id === eventId ||
        (ticket as any).eventId === eventId
      );
    }

    // Calculate stats
    const total_tickets = tickets.length;
    const sold_tickets = tickets.filter(t => 
      t.status === 'sold' || t.status === 'Active' || t.status === 'used'
    ).length;
    const available_tickets = tickets.filter(t => t.status === 'available').length;
    const reserved_tickets = tickets.filter(t => t.status === 'reserved').length;
    const cancelled_tickets = tickets.filter(t => t.status === 'cancelled').length;
    
    // Calculate revenue
    const total_revenue = tickets
      .filter(t => t.status === 'sold' || t.status === 'Active' || t.status === 'used')
      .reduce((sum, ticket) => sum + (ticket.price || 0), 0);

    // Group by event
    const eventGroups = tickets.reduce((groups: any, ticket: Ticket) => {
      const eventId = ticket.event_id || ticket.Event?.event_id || (ticket as any).eventId || 'unknown';
      const eventTitle = ticket.Event?.title || ticket.event?.title || (ticket.event as any)?.name || `Event ${eventId}`;
      
      if (!groups[eventId]) {
        groups[eventId] = {
          event_id: eventId,
          event_title: eventTitle,
          total_tickets: 0,
          sold_tickets: 0,
          revenue: 0
        };
      }
      
      groups[eventId].total_tickets++;
      if (ticket.status === 'sold' || ticket.status === 'Active' || ticket.status === 'used') {
        groups[eventId].sold_tickets++;
        groups[eventId].revenue += ticket.price || 0;
      }
      
      return groups;
    }, {});

    const tickets_by_event = Object.values(eventGroups);

    // Group by status
    const statusGroups = [
      { status: 'available', count: available_tickets },
      { status: 'sold', count: sold_tickets },
      { status: 'reserved', count: reserved_tickets },
      { status: 'cancelled', count: cancelled_tickets }
    ].filter(group => group.count > 0);

    const stats = {
      total_tickets,
      sold_tickets,
      available_tickets,
      reserved_tickets,
      total_revenue,
      tickets_by_event,
      tickets_by_status: statusGroups
    };

    return {
      success: true,
      data: {
        message: "Stats calculated successfully",
        stats
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to calculate ticket stats"
    };
  }
}

// Cancel ticket (User/Admin) - STILL NEEDS INDIVIDUAL ENDPOINT
export async function cancelTicket(
  ticketId: string,
  reason?: string
): Promise<ApiResponse<TicketResponse>> {
  return apiRequest<TicketResponse>(`/${ticketId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

// Reserve ticket (User) - STILL NEEDS INDIVIDUAL ENDPOINT
export async function reserveTicket(
  ticketId: string,
  reservationData: { user_id: string; duration_minutes?: number }
): Promise<ApiResponse<TicketResponse>> {
  return apiRequest<TicketResponse>(`/${ticketId}/reserve`, {
    method: "POST",
    body: JSON.stringify(reservationData),
  });
}

// Release reserved ticket - STILL NEEDS INDIVIDUAL ENDPOINT
export async function releaseReservedTicket(
  ticketId: string
): Promise<ApiResponse<TicketResponse>> {
  return apiRequest<TicketResponse>(`/${ticketId}/release`, {
    method: "POST",
  });
}

// Utility functions for ticket management
export const ticketUtils = {
  // Format price for display
  formatPrice: (price: number | undefined | null): string => {
    if (price === undefined || price === null || isNaN(price)) {
      return "Rwf0";
    }
    return `Rwf${price.toLocaleString()}`;
  },

  // Get status color
  getStatusColor: (status: string): string => {
    switch (status?.toLowerCase()) {
      case "available":
        return "text-green-400 bg-green-900/20 border-green-400";
      case "sold":
      case "active":
      case "used":
        return "text-blue-400 bg-blue-900/20 border-blue-400";
      case "reserved":
        return "text-yellow-400 bg-yellow-900/20 border-yellow-400";
      case "cancelled":
        return "text-red-400 bg-red-900/20 border-red-400";
      default:
        return "text-gray-400 bg-gray-900/20 border-gray-400";
    }
  },

  // Get status display text
  getStatusText: (status: string): string => {
    switch (status?.toLowerCase()) {
      case "available":
        return "Available";
      case "sold":
        return "Sold";
      case "active":
        return "Active";
      case "used":
        return "Used";
      case "reserved":
        return "Reserved";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  },

  // Format date for display
  formatDate: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  // Check if user can manage tickets (is admin)
  canManageTickets: (): boolean => {
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

  // Calculate revenue from tickets
  calculateRevenue: (tickets: Ticket[]): number => {
    return tickets
      .filter((ticket) => 
        ticket.status === "sold" || 
        ticket.status === "Active" || 
        ticket.status === "used"
      )
      .reduce((total, ticket) => total + ticket.price, 0);
  },

  // Group tickets by status
  groupByStatus: (tickets: Ticket[]): Record<string, Ticket[]> => {
    return tickets.reduce((groups, ticket) => {
      const status = ticket.status || "unknown";
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(ticket);
      return groups;
    }, {} as Record<string, Ticket[]>);
  },

  // Group tickets by event
  groupByEvent: (tickets: Ticket[]): Record<string, Ticket[]> => {
    return tickets.reduce((groups, ticket) => {
      const eventId = ticket.event_id || ticket.Event?.event_id || 'unknown';
      if (!groups[eventId]) {
        groups[eventId] = [];
      }
      groups[eventId].push(ticket);
      return groups;
    }, {} as Record<string, Ticket[]>);
  },

  // Filter tickets by event ID (client-side filtering)
  filterByEvent: (tickets: Ticket[], eventId: string): Ticket[] => {
    return tickets.filter(ticket => 
      ticket.event_id === eventId || 
      ticket.Event?.event_id === eventId ||
      (ticket as any).eventId === eventId
    );
  },

  // Filter tickets by user ID (client-side filtering)
  filterByUser: (tickets: Ticket[], userId: string): Ticket[] => {
    return tickets.filter(ticket => 
      ticket.user_id === userId || 
      ticket.User?.user_id === userId ||
      (ticket as any).userId === userId
    );
  },
};

// Export types for use in components
export type {
  ApiResponse,
  TicketResponse,
  TicketsResponse,
  AdminBookedTicketsResponse,
  TicketStatsResponse,
};