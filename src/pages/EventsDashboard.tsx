import  { useState, useEffect, useCallback } from "react";
import Sidebar from "../sections/Dashboard/Sidebar";
import Header from "../sections/Dashboard/Header";
import StatsRow from "../sections/Dashboard/StatsRow";
import SimpleCreateEventWizard from "../components/SimpleCreateEventWizard";
import {
  LayoutGrid,
  CalendarDays,
  Ticket,
  User,
  X,
  Search,
  Calendar,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getAllEvents, eventUtils, type Event } from "../api/event";
import { authUtils } from "../api/auth";
import AuthHelper from "../utils/AuthHelper";

const EventsDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);
  const [eventsRefreshKey, setEventsRefreshKey] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "upcoming" | "completed"
  >("all");
  const [userProfile, setUserProfile] = useState(authUtils.getUserProfile());
  const location = useLocation();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await getAllEvents();
      if (response.success && response.data) {
        console.log("Events data received:", response.data.events);

        let eventsData = response.data.events || [];

        // Filter events based on user role
        if (AuthHelper.isAdmin()) {
          const currentUserId = AuthHelper.getUserId();
          eventsData = eventsData.filter(
            (event) =>
              // Check both admin_id and user_id, and use loose equality for string/number mismatch
              event.admin_id == currentUserId ||
              event.user_id == currentUserId
          );
          console.log(`Filtered events for admin ${currentUserId}:`, eventsData);
          setEvents(eventsData);

        }
        else {
          setEvents(eventsData);
        }

      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterEvents = useCallback(() => {
    let filtered = events;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((event) => {
        const status = eventUtils.getEventStatus(event.date);
        return filterStatus === "upcoming"
          ? status === "upcoming"
          : status === "completed";
      });
    }

    // Sort by latest (created_at if available, otherwise date)
    filtered = [...filtered].sort(
      (a, b) =>
        new Date(b.created_at || b.date).getTime() -
        new Date(a.created_at || a.date).getTime()
    );

    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / eventsPerPage);
    setTotalPages(totalPages);

    // Reset to first page if current page is out of bounds
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, filterStatus, currentPage, eventsPerPage]);

  useEffect(() => {
    fetchEvents();
  }, [eventsRefreshKey]);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, filterStatus, filterEvents]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Get paginated events
  const getPaginatedEvents = () => {
    const startIndex = (currentPage - 1) * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;
    return filteredEvents.slice(startIndex, endIndex);
  };

  const paginatedEvents = getPaginatedEvents();

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

  return (
    <div className="flex flex-col w-full min-h-screen overflow-x-hidden bg-black text-opacity-35">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 md:hidden">
          <div className="flex flex-col h-full">
            {/* Close Button */}
            <div className="flex justify-end p-4">
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col items-center justify-center flex-1 space-y-8">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200 ${isActive
                      ? "bg-pink-600 text-white"
                      : "text-white hover:bg-pink-600/20"
                      }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Menu Button */}
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
            <Header userProfile={userProfile} />
            <StatsRow refreshKey={eventsRefreshKey} />

            {/* Search and Filter Section */}
            <section className="w-full mb-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-[#1A1A1A] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 w-full md:w-64"
                    />
                  </div>

                  {/* Filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(
                        e.target.value as "all" | "upcoming" | "completed"
                      )
                    }
                    className="px-4 py-2 bg-[#1A1A1A] rounded-lg text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="all">All Events</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <button
                  onClick={() => setCreateEventModalOpen(true)}
                  className="px-5 py-2 font-normal text-white transition-all rounded-lg bg-primary hover:bg-pink-600"
                >
                  Create Event
                </button>
              </div>
            </section>

            {/* Your Events Section */}
            <section className="w-full mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg md:text-[16px] font-semibold text-[#CDCDE0]">
                    {AuthHelper.isSuperAdmin() ? 'All Events' : 'Your Events'} ({filteredEvents.length})
                  </h3>
                  {AuthHelper.isAdmin() && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
                      Your Events Only
                    </span>
                  )}
                  {AuthHelper.isSuperAdmin() && (
                    <span className="text-xs px-2 py-1 rounded-full bg-pink-600/20 text-pink-400 border border-pink-500/30">
                      All Events
                    </span>
                  )}
                </div>
                {totalPages > 1 && (
                  <div className="text-sm text-gray-400">
                    Page {currentPage} of {totalPages}
                  </div>
                )}
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className="bg-[#101010] rounded-lg shadow-lg p-4 animate-pulse"
                    >
                      <div className="h-4 bg-gray-700 rounded mb-4"></div>
                      <div className="h-20 bg-gray-700 rounded mb-4"></div>
                      <div className="h-3 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Events Grid */}
              {!isLoading && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {filteredEvents.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-[#CDCDE0] mb-2">
                        No events found
                      </h3>
                      <p className="text-gray-400 mb-6">
                        {searchTerm || filterStatus !== "all"
                          ? "Try adjusting your search or filter criteria"
                          : "Create your first event to get started"}
                      </p>
                      {!searchTerm && filterStatus === "all" && (
                        <button
                          onClick={() => setCreateEventModalOpen(true)}
                          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                        >
                          Create Your First Event
                        </button>
                      )}
                    </div>
                  ) : (
                    paginatedEvents.map((event) => {
                      const status = eventUtils.getEventStatus(event.date);
                      const statusColors = {
                        upcoming: "text-green-400 bg-green-900/20",
                        ongoing: "text-yellow-400 bg-yellow-900/20",
                        completed: "text-gray-400 bg-gray-900/20",
                      };

                      return (
                        <div
                          key={event.event_id}
                          className="bg-[#101010] rounded-lg shadow-lg flex flex-col hover:bg-[#151515] transition-colors"
                        >
                          <div className="flex items-center justify-between p-4">
                            <span className="text-sm font-semibold text-[#CDCDE0] truncate">
                              {event.title}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${statusColors[status]}`}
                            >
                              {status}
                            </span>
                          </div>

                          <div className="px-4">
                            <div className="w-full h-20 bg-gray-700 rounded-md flex items-center justify-center mb-4 overflow-hidden">
                              {eventUtils.getEventImageUrl(event) ? (
                                <img
                                  src={eventUtils.getEventImageUrl(event)}
                                  alt={event.title}
                                  className="w-full h-full object-cover rounded-md"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className="w-full h-full flex items-center justify-center" style={{ display: eventUtils.getEventImageUrl(event) ? 'none' : 'flex' }}>
                                <Calendar className="w-8 h-8 text-gray-400" />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-end justify-between p-4">
                            <div className="flex flex-col gap-2 flex-1">
                              <div className="flex items-center gap-2 text-[#CDCDE0] text-[11px]">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  {eventUtils.formatEventDate(event.date)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-[#CDCDE0]">
                                <MapPin className="w-3 h-3" />
                                <span>{eventUtils.getVenueName(event)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-[#CDCDE0]">
                                <Users className="w-3 h-3" />
                                <span>
                                  {event.artist_lineup.length} Artist
                                  {event.artist_lineup.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>
                            {(() => {
                              const eventId = eventUtils.getEventId(event);
                              return eventId ? (
                                <Link
                                  to={`/events-dashboard/${eventId}`}
                                  className="bg-primary text-white rounded-md py-1.5 px-4 font-normal text-sm hover:bg-pink-600 transition-all"
                                >
                                  View
                                </Link>
                              ) : (
                                <button
                                  disabled
                                  className="bg-gray-600 text-gray-400 rounded-md py-1.5 px-4 font-normal text-sm cursor-not-allowed"
                                >
                                  No ID
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Pagination Controls */}
              {!isLoading && filteredEvents.length > 0 && totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 bg-[#101010] text-[#CDCDE0] rounded-lg hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg transition-colors ${currentPage === pageNum
                            ? 'bg-primary text-white'
                            : 'bg-[#101010] text-[#CDCDE0] hover:bg-primary/20'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 bg-[#101010] text-[#CDCDE0] rounded-lg hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Results info */}
              {!isLoading && filteredEvents.length > 0 && (
                <div className="text-center text-[#CDCDE0] text-sm mt-4">
                  Showing {((currentPage - 1) * eventsPerPage) + 1} to {Math.min(currentPage * eventsPerPage, filteredEvents.length)} of {filteredEvents.length} events
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Create Event Modal */}
      <SimpleCreateEventWizard
        isOpen={createEventModalOpen}
        onClose={() => setCreateEventModalOpen(false)}
        onEventCreated={() => {
          // Trigger dependent components to show loading and refetch
          setEventsRefreshKey((k) => k + 1);
          fetchEvents(); // keep immediate refresh for this page list
          try {
            localStorage.setItem('eventsRefreshKey', String(Date.now()));
          } catch { }
          setCreateEventModalOpen(false);
        }}
      />

      {/* Debug component - remove in production */}
      {/* <UserDebugInfo /> */}
    </div>
  );
};

export default EventsDashboard;
