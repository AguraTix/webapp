import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutGrid,
  CalendarDays,
  Ticket,
  User,
  X,
  Check,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Clock,
  Mail,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import Sidebar from "../sections/Dashboard/Sidebar";
import { authUtils } from "../api/auth";
import {
  getAllTickets,
  getAllBookedTickets,
  getTicketStats,
  updateTicket,
  deleteTicket,
  ticketUtils,
  type Ticket as TicketType,
  type TicketStatsResponse,
} from "../api/ticket";
import TicketingAnalysis from "../sections/Dashboard/TicketingAnalysis";
import CustomDropdown from "../components/ui/CustomDropdown";

// Default objects to prevent undefined values
const defaultUser = {
  user_id: "",
  name: "Unknown",
  email: "",
  phone_number: "",
};

const defaultEvent = {
  event_id: "",
  title: "Unknown Event",
  date: "",
  venue_id: "",
  description: "",
};

const defaultVenue = {
  venue_id: "",
  name: "Unknown Venue",
  location: "",
  hasSections: false,
};

// Utility function to map ticket data
const mapTicketData = (ticket: unknown): TicketType => {
  const eventData = ticket.Event || ticket.event || defaultEvent;
  const userData = ticket.User || ticket.user || defaultUser;
  const venueData = ticket.Venue || ticket.venue || defaultVenue;

  return {
    ticket_id: ticket.ticket_id || ticket.id || "",
    name:
      ticket.name ||
      ticket.title ||
      `${ticket.sectionName || "Section"} - Seat ${ticket.seatNumber || "N/A"}`,
    price: ticket.price || 0,
    event_id: ticket.event_id || ticket.eventId || "",
    section_id: ticket.section_id || ticket.sectionId || "",
    category_id: ticket.category_id || ticket.categoryId || "",
    attendee_id: ticket.attendee_id || ticket.attendeeId || "",
    user_id: ticket.user_id || ticket.userId || "",
    status: ticket.status || "available",
    purchase_date:
      ticket.purchase_date || ticket.purchaseDate || ticket.createdAt || "",
    created_at: ticket.created_at || ticket.createdAt || "",
    updated_at: ticket.updated_at || ticket.updatedAt || "",
    qrCodeUrl: ticket.qrCodeUrl || ticket.qrCode || "",
    seatNumber: ticket.seatNumber || "",
    sectionName: ticket.sectionName || "",
    event: {
      event_id: eventData.event_id || eventData.id || "",
      title: eventData.title || eventData.name || "",
      date: eventData.date || eventData.eventDate || "",
      venue_id: eventData.venue_id || eventData.venueId || "",
      description: eventData.description || "",
    },
    user: {
      user_id: userData.user_id || userData.id || "",
      name: userData.name || userData.username || "",
      email: userData.email || "",
      phone_number: userData.phone_number || userData.phone || "",
    },
    Venue: {
      venue_id: venueData.venue_id || venueData.id || "",
      name: venueData.name || "",
      location: venueData.location || "",
      hasSections: venueData.hasSections || false,
    },
    ticketCategory: ticket.ticketCategory
      ? {
          category_id:
            ticket.ticketCategory.category_id || ticket.ticketCategory.id || "",
          name: ticket.ticketCategory.name || "",
          price: ticket.ticketCategory.price || 0,
          description: ticket.ticketCategory.description || "",
        }
      : undefined,
  };
};

const Tickets = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [recentBookings, setRecentBookings] = useState<TicketType[]>([]);
  const [stats, setStats] = useState<TicketStatsResponse["stats"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingRecentBookings, setIsLoadingRecentBookings] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [userProfile] = useState(authUtils.getUserProfile());
  const location = useLocation();
  const [ticketsRefreshKey, setTicketsRefreshKey] = useState(0);

  const isAdmin = ticketUtils.canManageTickets();

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <LayoutGrid className="w-5 h-5" />,
    },
    {
      label: "Events",
      path: "/events-dashboard",
      icon: <CalendarDays className="w-5 h-5" />,
    },
    {
      label: "Tickets",
      path: "/tickets",
      icon: <Ticket className="w-5 h-5" />,
    },
    { label: "Account", path: "/account", icon: <User className="w-5 h-5" /> },
  ];

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = isAdmin
        ? {
            limit: itemsPerPage,
            offset: (currentPage - 1) * itemsPerPage,
            ...(statusFilter !== "all" && { status: statusFilter }),
          }
        : {
            page: currentPage,
            limit: itemsPerPage,
            ...(statusFilter !== "all" && { status: statusFilter }),
          };

      const response = isAdmin
        ? await getAllBookedTickets(params)
        : await getAllTickets(params);
      console.log(`${isAdmin ? "Admin" : "User"} tickets response:`, response);

      if (response.success && response.data) {
        const rawTickets =
          response.data.tickets ||
          (Array.isArray(response.data)
            ? response.data
            : response.data.data?.tickets || []);
        const mappedTickets = rawTickets.map(mapTicketData);

        setTickets(mappedTickets);
        setTotalTickets(response.data.total || rawTickets.length);
        setTotalPages(
          Math.ceil(
            (response.data.total || rawTickets.length) / itemsPerPage
          ) || 1
        );
      } else {
        setError(
          response.error ||
            `Failed to fetch ${isAdmin ? "admin" : "user"} tickets`
        );
        setTickets([]);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch tickets"
      );
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, isAdmin, itemsPerPage]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const response = await getTicketStats();
      setStats(
        response.success && response.data
          ? response.data.stats
          : {
              total_tickets: 0,
              sold_tickets: 0,
              available_tickets: 0,
              reserved_tickets: 0,
              total_revenue: 0,
              tickets_by_event: [],
              tickets_by_status: [],
            }
      );
    } catch (error) {
      console.error("Error fetching ticket stats:", error);
      setStats({
        total_tickets: 0,
        sold_tickets: 0,
        available_tickets: 0,
        reserved_tickets: 0,
        total_revenue: 0,
        tickets_by_event: [],
        tickets_by_status: [],
      });
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const fetchRecentBookings = useCallback(async () => {
    try {
      setIsLoadingRecentBookings(true);
      const params = isAdmin
        ? { status: "sold,used", limit: 5, offset: 0 }
        : { limit: 5, status: "sold" };
      const response = isAdmin
        ? await getAllBookedTickets(params)
        : (await import("../api/ticket")).getMyTickets(params);

      if (response.success && response.data) {
        const rawBookings =
          response.data.tickets ||
          (Array.isArray(response.data)
            ? response.data
            : response.data.data?.tickets || []);
        const mappedBookings = rawBookings
          .map(mapTicketData)
          .sort((a, b) => {
            const dateA = new Date(a.purchase_date || a.created_at || 0);
            const dateB = new Date(b.purchase_date || b.created_at || 0);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5);

        setRecentBookings(mappedBookings);
      } else {
        console.error(
          `Failed to fetch recent ${isAdmin ? "admin" : "user"} bookings:`,
          response.error
        );
        setRecentBookings([]);
      }
    } catch (error) {
      console.error("Error fetching recent bookings:", error);
      setRecentBookings([]);
    } finally {
      setIsLoadingRecentBookings(false);
    }
  }, [isAdmin]);

  // Listen for tickets refresh broadcasts from other pages/tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'ticketsRefreshKey') {
        setTicketsRefreshKey((k) => k + 1);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Refetch datasets when refresh key changes
  useEffect(() => {
    fetchTickets();
    fetchStats();
    fetchRecentBookings();
  }, [ticketsRefreshKey]);

  const broadcastTicketsRefresh = () => {
    try {
      localStorage.setItem('ticketsRefreshKey', String(Date.now()));
    } catch {}
  };

  useEffect(() => {
    fetchTickets();
    fetchStats();
    fetchRecentBookings();
  }, [fetchTickets, fetchStats, fetchRecentBookings]);

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const response = await updateTicket(ticketId, {
        status: newStatus as unknown,
      });
      if (response.success) {
        fetchTickets();
        fetchStats();
        fetchRecentBookings();
        setTicketsRefreshKey((k) => k + 1);
        broadcastTicketsRefresh();
      } else {
        alert(response.error || "Failed to update ticket status");
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update ticket status"
      );
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      const response = await deleteTicket(ticketId);
      if (response.success) {
        fetchTickets();
        fetchStats();
        fetchRecentBookings();
        setTicketsRefreshKey((k) => k + 1);
        broadcastTicketsRefresh();
      } else {
        alert(response.error || "Failed to delete ticket");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete ticket");
    }
  };

  const filteredTickets = tickets.filter(
    (ticket) =>
      !ticket ||
      searchTerm === "" ||
      ticket.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.event?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusData = [
    {
      label: "Available",
      value: stats?.available_tickets || 0,
      color: "#10B981",
    },
    { label: "Sold", value: stats?.sold_tickets || 0, color: "#3B82F6" },
    {
      label: "Reserved",
      value: stats?.reserved_tickets || 0,
      color: "#F59E0B",
    },
    {
      label: "Cancelled",
      value:
        stats?.tickets_by_status?.find((s) => s.status === "cancelled")
          ?.count || 0,
      color: "#EF4444",
    },
  ];

  const eventRevenueData = (stats?.tickets_by_event || []).slice(0, 5);
  const maxRevenue =
    eventRevenueData.length > 0
      ? Math.max(...eventRevenueData.map((e) => e.revenue || 0), 1)
      : 1;

  const ticketSalesData = (stats?.tickets_by_event || []).slice(0, 6);
  const maxSales =
    ticketSalesData.length > 0
      ? Math.max(...ticketSalesData.map((e) => e.sold_tickets || 0), 1)
      : 1;

  return (
    <div className="flex flex-col w-full min-h-screen overflow-x-hidden bg-black text-opacity-35">
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 md:hidden">
          <div className="flex flex-col h-full">
            <div className="flex justify-end p-4">
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 space-y-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200 ${
                    location.pathname === item.path
                      ? "bg-pink-600 text-white"
                      : "text-white hover:bg-pink-600/20"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <button
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 md:hidden bg-[#23232B] p-2 rounded-lg"
        onClick={() => setSidebarOpen(true)}
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <div className="flex flex-1 w-full md:pl-80">
        <main className="flex-1 w-full py-8 overflow-x-hidden md:py-10">
          <div className="w-full max-w-6xl px-4 mx-auto md:px-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-lg md:text-[16px] font-semibold text-[#CDCDE0]">
                    Welcome back {userProfile?.name || "User"}
                  </h2>
                  {isAdmin && (
                    <p className="text-sm text-primary">
                      Admin Dashboard - Managing All Tickets
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    fetchTickets();
                    fetchStats();
                    fetchRecentBookings();
                    setTicketsRefreshKey((k) => k + 1);
                    broadcastTicketsRefresh();
                  }}
                  className="p-2 rounded-full bg-[#23232B] hover:bg-primary/20 text-[#CDCDE0] transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <div className="flex items-center justify-center text-lg font-bold text-white rounded-full w-9 h-9 bg-gradient-to-tr from-primary to-pink-600">
                  {userProfile?.name ? userProfile.name[0].toUpperCase() : "U"}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
              <div className="bg-[#101010] rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Tickets</p>
                    <p className="text-2xl font-bold text-white">
                      {isLoadingStats
                        ? "..."
                        : stats?.total_tickets?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                    <Ticket className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>
              <div className="bg-[#101010] rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Sold Tickets</p>
                    <p className="text-2xl font-bold text-white">
                      {isLoadingStats
                        ? "..."
                        : stats?.sold_tickets?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>
              <div className="bg-[#101010] rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Available</p>
                    <p className="text-2xl font-bold text-white">
                      {isLoadingStats
                        ? "..."
                        : stats?.available_tickets?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-600/20 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </div>
              <div className="bg-[#101010] rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">
                      {isLoadingStats
                        ? "..."
                        : ticketUtils.formatPrice(stats?.total_revenue || 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
            </div>
            <TicketingAnalysis stats={stats} isLoading={isLoadingStats} />
            <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">
              <div className="bg-[#101010] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Ticket Status Distribution
                </h3>
                <div className="h-64">
                  {isLoadingStats ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                  ) : statusData.every((item) => item.value === 0) ? (
                    <div className="flex flex-col items-center justify-center h-full py-8">
                      <TrendingUp className="w-12 h-12 text-gray-600 mb-3" />
                      <p className="text-gray-400 text-sm text-center">
                        No ticket data available
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {statusData.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-sm text-gray-300">
                              {item.label}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-white">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-[#101010] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Revenue by Event
                </h3>
                <div className="h-64">
                  {isLoadingStats ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                  ) : eventRevenueData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-8">
                      <DollarSign className="w-12 h-12 text-gray-600 mb-3" />
                      <p className="text-gray-400 text-sm text-center">
                        No revenue data available
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {eventRevenueData.map((event, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300 truncate">
                              {event.event_title}
                            </span>
                            <span className="text-white font-medium">
                              {ticketUtils.formatPrice(event.revenue)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${(event.revenue / maxRevenue) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-[#101010] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Bookings
                </h3>
                <div className="h-64 overflow-y-auto">
                  {isLoadingRecentBookings ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                  ) : recentBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-8">
                      <Users className="w-8 h-8 text-gray-600 mb-2" />
                      <p className="text-gray-400 text-sm font-medium mb-1">
                        No recent bookings
                      </p>
                      <p className="text-gray-500 text-xs">
                        Ticket purchases will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-400 pb-2 border-b border-gray-800">
                        <div className="col-span-4">Customer</div>
                        <div className="col-span-3">Event</div>
                        <div className="col-span-2">Price</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-1">Status</div>
                      </div>
                      {recentBookings.map((booking) => (
                        <div
                          key={booking.ticket_id}
                          className="grid grid-cols-12 gap-2 text-xs py-2 hover:bg-[#1A1A1A] rounded transition-colors"
                        >
                          <div className="col-span-4 flex items-center gap-2">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-3 h-3 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-white font-medium truncate text-xs">
                                {booking.user.name}
                              </p>
                              <p className="text-gray-400 truncate text-xs">
                                {booking.user.email}
                              </p>
                            </div>
                          </div>
                          <div className="col-span-3">
                            <p className="text-white truncate text-xs font-medium">
                              {booking.event.title}
                            </p>
                            <p className="text-gray-400 truncate text-xs">
                              {booking.event.date
                                ? new Date(
                                    booking.event.date
                                  ).toLocaleDateString()
                                : ""}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-primary font-medium text-xs">
                              {ticketUtils.formatPrice(booking.price)}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-400 text-xs">
                              {booking.purchase_date
                                ? new Date(
                                    booking.purchase_date
                                  ).toLocaleDateString()
                                : booking.created_at
                                ? new Date(
                                    booking.created_at
                                  ).toLocaleDateString()
                                : "Recent"}
                            </span>
                          </div>
                          <div className="col-span-1">
                            <span
                              className={`px-1 py-0.5 text-xs rounded-full ${ticketUtils.getStatusColor(
                                booking.status || "sold"
                              )}`}
                            >
                              {ticketUtils
                                .getStatusText(booking.status || "sold")
                                .slice(0, 3)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {recentBookings.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <Link
                      to="/tickets?status=sold"
                      className="text-primary text-sm hover:text-primary/80 transition-colors"
                    >
                      View all bookings →
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-[#101010] rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Ticket Sales by Event
              </h3>
              <div className="h-64">
                {isLoadingStats ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  </div>
                ) : ticketSalesData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-8">
                    <TrendingUp className="w-12 h-12 text-gray-600 mb-3" />
                    <p className="text-gray-400 text-sm text-center">
                      No ticket sales data available
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ticketSalesData.map((event, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300 truncate">
                            {event.event_title}
                          </span>
                          <span className="text-white font-medium">
                            {event.sold_tickets} sold
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${
                                (event.sold_tickets / maxSales) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="bg-[#101010] rounded-lg p-6 mb-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-[#1A1A1A] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="w-48">
                    <CustomDropdown
                      options={[
                        "All Status",
                        "Available",
                        "Sold",
                        "Used",
                        "Reserved",
                        "Cancelled",
                      ]}
                      value={
                        statusFilter === "all"
                          ? "All Status"
                          : statusFilter.charAt(0).toUpperCase() +
                            statusFilter.slice(1)
                      }
                      onChange={(value) => {
                        const filterValue =
                          value === "All Status" ? "all" : value.toLowerCase();
                        setStatusFilter(filterValue);
                      }}
                      placeholder="Filter by Status"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <span className="text-sm text-gray-400">
                      Total: {totalTickets.toLocaleString()} tickets
                    </span>
                  )}
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-[#101010] rounded-lg">
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h3 className="text-lg font-semibold text-white">
                  {isAdmin ? "All Booked Tickets" : "My Tickets"}
                </h3>
                <span className="text-sm text-primary">
                  {filteredTickets.length} of {tickets.length} tickets
                </span>
              </div>
              {error && (
                <div className="p-6 border-b border-gray-800">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <span className="ml-3 text-gray-400">
                      Loading tickets...
                    </span>
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="text-center py-12">
                    <Ticket className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-lg font-medium mb-2">
                      No tickets available
                    </p>
                    <p className="text-gray-500 text-sm">
                      {searchTerm || statusFilter !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : "No ticket sales data found"}
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="px-6 py-4 text-left">
                          <div className="flex items-center gap-2 text-[#CDCDE0] font-medium">
                            <Ticket className="w-4 h-4" />
                            Ticket Info
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left">
                          <div className="flex items-center gap-2 text-[#CDCDE0] font-medium">
                            <User className="w-4 h-4" />
                            Customer
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left">
                          <div className="flex items-center gap-2 text-[#CDCDE0] font-medium">
                            <Calendar className="w-4 h-4" />
                            Event
                          </div>
                        </th>
                        {isAdmin && (
                          <th className="px-6 py-4 text-left">
                            <div className="flex items-center gap-2 text-[#CDCDE0] font-medium">
                              <MapPin className="w-4 h-4" />
                              Venue
                            </div>
                          </th>
                        )}
                        <th className="px-6 py-4 text-left">
                          <div className="flex items-center gap-2 text-[#CDCDE0] font-medium">
                            <DollarSign className="w-4 h-4" />
                            Price
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left">
                          <div className="flex items-center gap-2 text-[#CDCDE0] font-medium">
                            <Check className="w-4 h-4" />
                            Status
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left">
                          <div className="flex items-center gap-2 text-[#CDCDE0] font-medium">
                            Actions
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTickets.map((ticket) => (
                        <tr
                          key={ticket.ticket_id}
                          className="border-b border-gray-800 hover:bg-[#1A1A1A] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-white font-medium">
                                {ticket.name}
                              </p>
                              <p className="text-sm text-gray-400">
                                ID: {ticket.ticket_id?.slice(-8)}
                              </p>
                              {ticket.sectionName && (
                                <p className="text-xs text-blue-400">
                                  Section: {ticket.sectionName}
                                  {ticket.seatNumber &&
                                    ` | Seat: ${ticket.seatNumber}`}
                                </p>
                              )}
                              {ticket.qrCodeUrl && (
                                <p className="text-xs text-green-400">
                                  QR Code Available
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-medium text-sm">
                                  {ticket.user.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {ticket.user.email}
                                </p>
                                {ticket.user.phone_number && (
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {ticket.user.phone_number}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-white font-medium text-sm">
                                {ticket.event.title}
                              </p>
                              <p className="text-xs text-gray-400">
                                {ticket.event.date
                                  ? ticketUtils.formatDate(ticket.event.date)
                                  : ""}
                              </p>
                            </div>
                          </td>
                          {isAdmin && (
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-white text-sm">
                                  {ticket.Venue.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {ticket.Venue.location}
                                </p>
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4">
                            <span className="text-white font-medium">
                              {ticketUtils.formatPrice(ticket.price)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {isAdmin ? (
                              <select
                                value={ticket.status}
                                onChange={(e) =>
                                  handleStatusChange(
                                    ticket.ticket_id,
                                    e.target.value
                                  )
                                }
                                className={`px-3 py-1 text-xs rounded-full border ${ticketUtils.getStatusColor(
                                  ticket.status
                                )} bg-transparent focus:outline-none`}
                              >
                                <option value="available">Available</option>
                                <option value="sold">Sold</option>
                                <option value="used">Used</option>
                                <option value="reserved">Reserved</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            ) : (
                              <span
                                className={`px-3 py-1 text-xs rounded-full border ${ticketUtils.getStatusColor(
                                  ticket.status
                                )}`}
                              >
                                {ticketUtils.getStatusText(ticket.status)}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                className="p-2 text-blue-400 hover:bg-blue-900/20 rounded transition-colors"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {isAdmin && (
                                <>
                                  <button
                                    className="p-2 text-green-400 hover:bg-green-900/20 rounded transition-colors"
                                    title="Edit ticket"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteTicket(ticket.ticket_id)
                                    }
                                    className="p-2 text-red-400 hover:bg-red-900/20 rounded transition-colors"
                                    title="Delete ticket"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {/* Enhanced Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-gray-800 gap-4">
                {/* Results Info */}
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-400">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, totalTickets)} of{" "}
                    {totalTickets.toLocaleString()} tickets
                  </div>

                  {/* Items per page selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Show:</span>
                    <CustomDropdown
                      options={["10", "25", "50", "100"]}
                      value={itemsPerPage.toString()}
                      onChange={(value) => {
                        setItemsPerPage(parseInt(value));
                        setCurrentPage(1); // Reset to first page
                      }}
                      placeholder="Items per page"
                    />
                  </div>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    {/* First Page */}
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                      title="First page"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>

                    {/* Previous Page */}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {(() => {
                        const pages = [];
                        const maxVisiblePages = 5;
                        let startPage = Math.max(
                          1,
                          currentPage - Math.floor(maxVisiblePages / 2)
                        );
                        const endPage = Math.min(
                          totalPages,
                          startPage + maxVisiblePages - 1
                        );

                        // Adjust start page if we're near the end
                        if (endPage - startPage < maxVisiblePages - 1) {
                          startPage = Math.max(
                            1,
                            endPage - maxVisiblePages + 1
                          );
                        }

                        // Add first page and ellipsis if needed
                        if (startPage > 1) {
                          pages.push(
                            <button
                              key={1}
                              onClick={() => setCurrentPage(1)}
                              className="px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                            >
                              1
                            </button>
                          );
                          if (startPage > 2) {
                            pages.push(
                              <span
                                key="ellipsis1"
                                className="px-2 text-gray-500"
                              >
                                ...
                              </span>
                            );
                          }
                        }

                        // Add visible page numbers
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i)}
                              className={`px-3 py-2 rounded transition-colors ${
                                currentPage === i
                                  ? "bg-primary text-white"
                                  : "text-gray-400 hover:text-white hover:bg-gray-700"
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }

                        // Add ellipsis and last page if needed
                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            pages.push(
                              <span
                                key="ellipsis2"
                                className="px-2 text-gray-500"
                              >
                                ...
                              </span>
                            );
                          }
                          pages.push(
                            <button
                              key={totalPages}
                              onClick={() => setCurrentPage(totalPages)}
                              className="px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                            >
                              {totalPages}
                            </button>
                          );
                        }

                        return pages;
                      })()}
                    </div>

                    {/* Next Page */}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Last Page */}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                      title="Last page"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Tickets;
