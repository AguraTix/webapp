import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Calendar,
  Edit,
  Trash2,
  LayoutGrid,
  CalendarDays,
  Ticket,
  User,
  X,
  MapPin,
  Users,
  Music,
  Clock,
  Package,
  Star,
  Eye,
  Download,
  Share2,
  ChefHat,
  Utensils,
  Building,
  Camera,
  Plus,
} from "lucide-react";
import Sidebar from "../sections/Dashboard/Sidebar";
import EditEventModal from "../components/EditEventModal";
import AddMenuItemModal from "../components/AddMenuItemModal";
import {
  getEventById,
  deleteEvent,
  eventUtils,
  type Event,
} from "../api/event";
import { authUtils } from "../api/auth";
import {
  getMenuItemsByEvent,
  deleteMenuItem,
  menuUtils,
  type MenuItem,
  getFoodOrdersByEvent,
} from "../api/menu";

const EventDetails = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editEventModalOpen, setEditEventModalOpen] = useState(false);
  const [addMenuModalOpen, setAddMenuModalOpen] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [foodOrders, setFoodOrders] = useState<FoodOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile] = useState(authUtils.getUserProfile());
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

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

  useEffect(() => {
    console.log("Event ID from URL params:", id);
    if (id && id !== "undefined") {
      fetchEvent(id);
      fetchMenuItems(id);
      fetchFoodOrders(id);
    } else {
      setError("Invalid event ID");
      setIsLoading(false);
    }
  }, [id]);

  const fetchEvent = async (eventId: string) => {
    try {
      setIsLoading(true);
      const response = await getEventById(eventId);
      if (response.success && response.data) {
        const eventData = response.data.event;

        if (typeof eventData.artist_lineup === "string") {
          try {
            eventData.artist_lineup = JSON.parse(eventData.artist_lineup);
          } catch (error) {
            console.error("Error parsing artist_lineup:", error);
            eventData.artist_lineup = eventData.artist_lineup
              .split(",")
              .map((artist) => artist.trim())
              .filter(Boolean);
          }
        }

        if (!Array.isArray(eventData.artist_lineup)) {
          eventData.artist_lineup = [];
        }

        setEvent(eventData);
      } else {
        setError(response.error || "Event not found");
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      setError("Failed to load event details");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMenuItems = async (eventId: string) => {
    try {
      setIsLoadingMenu(true);
      console.log("Fetching menu items for event ID:", eventId);
      const response = await getMenuItemsByEvent(eventId);
      console.log("Menu items response:", response);

      if (response.success && response.data) {
        let rawItems: unknown[] = [];
        if (Array.isArray(response.data)) {
          rawItems = response.data;
        } else if (response.data.menuItems) {
          rawItems = response.data.menuItems;
        } else if (response.data.foods) {
          rawItems = response.data.foods;
        } else if (response.data.data) {
          rawItems = Array.isArray(response.data.data)
            ? response.data.data
            : response.data.data.menuItems || [];
        }

        const items: MenuItem[] = rawItems.map((item: unknown) => ({
          menu_id: item.menu_id || item.id,
          FoodName: item.FoodName || item.foodname || item.name || "",
          Quantity: item.Quantity || item.quantity || 0,
          FoodPrice: item.FoodPrice || item.foodprice || item.price || 0,
          FoodDescription:
            item.FoodDescription ||
            item.fooddescription ||
            item.description ||
            "",
          foodimage: item.foodimage || item.image || "",
          event_id: item.event_id || item.eventId || "",
          created_at: item.created_at || item.createdAt,
          updated_at: item.updated_at || item.updatedAt,
        }));

        console.log("Raw items from backend:", rawItems);
        console.log("Processed menu items:", items);
        setMenuItems(items || []);
      } else {
        console.error("Failed to fetch menu items:", response.error);
        setMenuItems([]);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      setMenuItems([]);
    } finally {
      setIsLoadingMenu(false);
    }
  };

  const fetchFoodOrders = async (eventId: string) => {
    try {
      setIsLoadingOrders(true);
      console.log("Fetching food orders for event:", eventId);
      const response = await getFoodOrdersByEvent(eventId);
      console.log("Food orders response:", response);

      if (response.success && response.data) {
        setFoodOrders(response.data.orders || []);
      } else {
        console.error("Failed to fetch food orders:", response.error);
        setFoodOrders([]);
      }
    } catch (error) {
      console.error("Error fetching food orders:", error);
      setFoodOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };
  const handleMenuItemAdded = () => {
    if (id) {
      fetchMenuItems(id);
    }
  };

  const handleDeleteMenuItem = async (menuId: string) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) {
      return;
    }

    try {
      const response = await deleteMenuItem(menuId);
      if (response.success) {
        setMenuItems((prev) => prev.filter((item) => item.menu_id !== menuId));
      } else {
        alert(response.error || "Failed to delete menu item");
      }
    } catch (error) {
      console.error("Error deleting menu item:", error);
      alert("Failed to delete menu item");
    }
  };

  const handleDeleteEvent = async () => {
    const eventId = event ? eventUtils.getEventId(event) : undefined;
    if (!eventId || !window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      const response = await deleteEvent(eventId);
      if (response.success) {
        navigate("/events-dashboard");
      } else {
        alert(response.error || "Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event");
    }
  };

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
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200 ${
                      isActive ? "bg-pink-600 text-white" : "text-white hover:bg-pink-600/20"
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
            {isLoading && (
              <div className="animate-pulse">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
                    <div className="h-6 bg-gray-700 rounded w-48"></div>
                  </div>
                </div>
                <div className="h-64 bg-gray-700 rounded-lg mb-6"></div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="h-32 bg-gray-700 rounded-lg"></div>
                  <div className="h-32 bg-gray-700 rounded-lg"></div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <div className="text-red-400 mb-4">
                  <Calendar className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Event Not Found
                  </h3>
                  <p>{error}</p>
                </div>
                <Link
                  to="/events-dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Events
                </Link>
              </div>
            )}

            {event && !isLoading && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <Link
                      to="/events-dashboard"
                      className="p-2 rounded-full bg-[#23232B] hover:bg-primary/20 text-[#CDCDE0] transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                      <h2 className="text-lg md:text-[16px] font-semibold text-[#CDCDE0]">
                        Welcome back {userProfile?.name || "User"}
                      </h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="p-2 rounded-full bg-[#23232B] hover:bg-primary/20 text-[#CDCDE0] transition-colors">
                      <Bell className="w-5 h-5" />
                    </button>
                    <div className="flex items-center justify-center text-lg font-bold text-white rounded-full w-9 h-9 bg-gradient-to-tr from-primary to-pink-600">
                      {userProfile?.name
                        ? userProfile.name[0].toUpperCase()
                        : "U"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-white">
                      {event.title}
                    </h1>
                    {(() => {
                      const status = eventUtils.getEventStatus(event.date);
                      const statusConfig = {
                        upcoming: {
                          color:
                            "bg-green-900/20 text-green-400 border-green-400",
                          text: "Upcoming Event",
                        },
                        ongoing: {
                          color:
                            "bg-yellow-900/20 text-yellow-400 border-yellow-400",
                          text: "Event in Progress",
                        },
                        completed: {
                          color: "bg-gray-900/20 text-gray-400 border-gray-400",
                          text: "Event Completed",
                        },
                      };
                      const config = statusConfig[status];

                      return (
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${config.color}`}
                        >
                          <div className="w-2 h-2 rounded-full bg-current"></div>
                          <span className="text-sm font-medium">
                            {config.text}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setEditEventModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Event
                    </button>
                    <button
                      onClick={handleDeleteEvent}
                      className="flex items-center gap-2 px-4 py-2 text-white transition-all bg-red-600 rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Event
                    </button>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="w-full h-80 bg-[#101010] rounded-lg flex items-center justify-center border border-gray-800 overflow-hidden mb-4 relative group">
                    {eventUtils.getEventImageUrl(event) ? (
                      <>
                        <img
                          src={eventUtils.getEventImageUrl(event)}
                          alt={event.title}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            console.error(
                              "Failed to load main image:",
                              eventUtils.getEventImageUrl(event)
                            );
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling.style.display =
                              "flex";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                          <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                            <Eye className="w-5 h-5 text-white" />
                          </button>
                          <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                            <Download className="w-5 h-5 text-white" />
                          </button>
                          <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                            <Share2 className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      </>
                    ) : null}
                    <div
                      className="w-full h-full flex items-center justify-center text-center"
                      style={{
                        display: eventUtils.getEventImageUrl(event)
                          ? "none"
                          : "flex",
                      }}
                    >
                      <div>
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Camera className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {event.title}
                        </h3>
                        <p className="text-gray-400">No main image available</p>
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const allImages = eventUtils.getAllEventImageUrls(event);
                    const hasGalleryImages = allImages.length > 1;
                    return (
                      hasGalleryImages && (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                              <Camera className="w-5 h-5 text-primary" />
                              Event Gallery (
                              {eventUtils.getAllEventImageUrls(event).length -
                                1}{" "}
                              additional images)
                            </h4>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {(() => {
                              const allImageUrls =
                                eventUtils.getAllEventImageUrls(event);
                              const galleryImages = allImageUrls.slice(1);

                              console.log(
                                "All event image URLs:",
                                allImageUrls
                              );
                              console.log("Gallery images:", galleryImages);

                              return galleryImages.map(
                                (imageUrl: string, index: number) => (
                                  <div
                                    key={index}
                                    className="aspect-square bg-[#101010] rounded-lg overflow-hidden border border-gray-800 group cursor-pointer hover:border-primary/50 transition-colors"
                                    onClick={() => {
                                      window.open(imageUrl, "_blank");
                                    }}
                                  >
                                    <img
                                      src={imageUrl}
                                      alt={`${event.title} - Gallery ${
                                        index + 1
                                      }`}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      onError={(e) => {
                                        console.error(
                                          `Failed to load gallery image ${
                                            index + 1
                                          }:`,
                                          imageUrl
                                        );
                                        const target = e.currentTarget;
                                        target.style.display = "none";
                                        const parent = target.parentElement;
                                        if (
                                          parent &&
                                          !parent.querySelector(
                                            ".image-placeholder"
                                          )
                                        ) {
                                          const placeholder =
                                            document.createElement("div");
                                          placeholder.className =
                                            "image-placeholder w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 text-xs";
                                          placeholder.innerHTML = `
                                        <div class="text-center">
                                          <div class="w-6 h-6 mx-auto mb-1 opacity-50">📷</div>
                                          <div>Image ${index + 1}</div>
                                          <div>Not Available</div>
                                        </div>
                                      `;
                                          parent.appendChild(placeholder);
                                        }
                                      }}
                                      onLoad={() => {
                                        console.log(
                                          `Gallery image ${
                                            index + 1
                                          } loaded successfully:`,
                                          imageUrl
                                        );
                                      }}
                                    />
                                  </div>
                                )
                              );
                            })()}
                          </div>
                        </div>
                      )
                    );
                  })()}
                </div>
                <div className="bg-[#101010] rounded-lg p-6 mb-8">
                  <h3 className="mb-6 text-xl font-semibold text-white flex items-center gap-2">
                    <Package className="w-6 h-6 text-primary" />
                    Event Analytics
                  </h3>
                  <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Music className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {event.artist_lineup.length}
                      </div>
                      <p className="text-gray-400 text-sm">Featured Artists</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="w-8 h-8 text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {event.venue?.capacity
                          ? event.venue.capacity.toLocaleString()
                          : "N/A"}
                      </div>
                      <p className="text-gray-400 text-sm">Max Capacity</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Ticket className="w-8 h-8 text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {(() => {
                          try {
                            const tickets =
                              event.tickets && typeof event.tickets === "string"
                                ? JSON.parse(event.tickets)
                                : event.tickets || [];
                            return tickets.length || 0;
                          } catch {
                            return 0;
                          }
                        })()}
                      </div>
                      <p className="text-gray-400 text-sm">Ticket Types</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Camera className="w-8 h-8 text-purple-400" />
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {eventUtils.getAllEventImageUrls(event).length}
                      </div>
                      <p className="text-gray-400 text-sm">Event Images</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">
                  <div className="bg-[#101010] rounded-lg p-6">
                    <h3 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Event Details
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-400">Date & Time</p>
                          <p className="text-white font-medium">
                            {eventUtils.formatEventDate(event.date)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {eventUtils.getEventStatus(event.date) ===
                            "upcoming"
                              ? "Upcoming Event"
                              : eventUtils.getEventStatus(event.date) ===
                                "ongoing"
                              ? "Currently Live"
                              : "Event Completed"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-400">Venue</p>
                          <p className="text-white font-medium">
                            {eventUtils.getVenueName(event)}
                          </p>
                          {event.venue?.location && (
                            <p className="text-sm text-gray-400 mt-1">
                              {event.venue.location}
                            </p>
                          )}
                          {event.venue?.capacity && (
                            <p className="text-xs text-gray-500 mt-1">
                              Capacity: {event.venue.capacity.toLocaleString()}{" "}
                              people
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-400">Performers</p>
                          <p className="text-white font-medium">
                            {event.artist_lineup.length} Artist
                            {event.artist_lineup.length !== 1 ? "s" : ""}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Featured lineup ready
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#101010] rounded-lg p-6">
                    <h3 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
                      <Star className="w-5 h-5 text-primary" />
                      Description
                    </h3>
                    <div className="space-y-3">
                      <p className="text-gray-300 leading-relaxed">
                        {event.description ||
                          "No description available for this event."}
                      </p>
                      <div className="pt-3 border-t border-gray-800">
                        <p className="text-xs text-gray-500">
                          Event ID: {event.event_id}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created:{" "}
                          {event.created_at
                            ? new Date(event.created_at).toLocaleDateString()
                            : "N/A"}
                        </p>
                        {event.updated_at && (
                          <p className="text-xs text-gray-500">
                            Last Updated:{" "}
                            {new Date(event.updated_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#101010] rounded-lg p-6">
                    <h3 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      Quick Stats
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Status</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            eventUtils.getEventStatus(event.date) === "upcoming"
                              ? "bg-green-900/20 text-green-400"
                              : eventUtils.getEventStatus(event.date) ===
                                "ongoing"
                              ? "bg-yellow-900/20 text-yellow-400"
                              : "bg-gray-900/20 text-gray-400"
                          }`}
                        >
                          {eventUtils.getEventStatus(event.date) === "upcoming"
                            ? "Upcoming"
                            : eventUtils.getEventStatus(event.date) ===
                              "ongoing"
                            ? "Live"
                            : "Completed"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Artists</span>
                        <span className="text-white font-medium">
                          {event.artist_lineup.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Venue Capacity</span>
                        <span className="text-white font-medium">
                          {event.venue?.capacity
                            ? event.venue.capacity.toLocaleString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Images</span>
                        <span className="text-white font-medium">
                          {eventUtils.getAllEventImageUrls(event).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {event.artist_lineup.length > 0 && (
                  <div className="bg-[#101010] rounded-lg p-6 mb-8">
                    <h3 className="mb-6 text-xl font-semibold text-white flex items-center gap-2">
                      <Music className="w-6 h-6 text-primary" />
                      Featured Artists ({event.artist_lineup.length})
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {event.artist_lineup.map((artist, index) => (
                        <div
                          key={index}
                          className="bg-[#1A1A1A] rounded-lg p-5 flex items-center gap-4 hover:bg-[#252525] transition-colors group"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-pink-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Music className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-semibold text-lg">
                              {artist}
                            </p>
                            <p className="text-sm text-gray-400">
                              Featured Performer
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-xs text-green-400">
                                Confirmed
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-[#101010] rounded-lg p-6 mb-8">
                  <h3 className="mb-6 text-xl font-semibold text-white flex items-center gap-2">
                    <Ticket className="w-6 h-6 text-primary" />
                    Ticket Information
                  </h3>
                  {(() => {
                    try {
                      const tickets =
                        event.tickets && typeof event.tickets === "string"
                          ? JSON.parse(event.tickets)
                          : event.tickets || [];

                      if (tickets.length > 0) {
                        return (
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {tickets.map((ticket: unknown, index: number) => (
                              <div
                                key={index}
                                className="bg-[#1A1A1A] rounded-lg p-5 border border-gray-800 hover:border-primary/30 transition-colors"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className="text-white font-semibold text-lg">
                                      {ticket.type ||
                                        ticket.name ||
                                        `Ticket ${index + 1}`}
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                      {ticket.quantity ||event.venue.capacity || "N/A"} available
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-primary font-bold text-xl">
                                      Rwf{(ticket.price || 0).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-400">
                                    Category
                                  </span>
                                  <span className="text-white">
                                    {ticket.type || "General"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }
                    } catch (error) {
                      console.error("Error parsing tickets:", error);
                    }

                    return (
                      <div className="text-center py-8">
                        <Ticket className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">
                          No ticket information available
                        </p>
                      </div>
                    );
                  })()}
                </div>

                <div className="bg-[#101010] rounded-lg p-6 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <ChefHat className="w-6 h-6 text-primary" />
                      Food & Beverages ({menuItems.length})
                    </h3>
                    <button
                      onClick={() => setAddMenuModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Menu Item
                    </button>
                  </div>

                  {isLoadingMenu ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-gray-400">Loading menu items...</p>
                    </div>
                  ) : menuItems.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {menuItems.map((item) => {
                        const availability =
                          menuUtils.getAvailabilityStatus(item);
                        return (
                          <div
                            key={item.menu_id}
                            className="bg-[#1A1A1A] rounded-lg p-5 hover:bg-[#252525] transition-colors group"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-16 h-16 bg-orange-600/20 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                {menuUtils.getMenuItemImageUrl(item) ? (
                                  <img
                                    src={menuUtils.getMenuItemImageUrl(item)}
                                    alt={item.FoodName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                      e.currentTarget.nextElementSibling.style.display =
                                        "flex";
                                    }}
                                  />
                                ) : null}
                                <Utensils
                                  className="w-8 h-8 text-orange-400"
                                  style={{
                                    display: menuUtils.getMenuItemImageUrl(item)
                                      ? "none"
                                      : "block",
                                  }}
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-semibold text-lg truncate">
                                      {item.FoodName}
                                    </h4>
                                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                      {item.FoodDescription}
                                    </p>
                                  </div>
                                  <div className="text-right ml-3">
                                    <p className="text-primary font-bold text-lg">
                                      {menuUtils.formatPrice(item.FoodPrice)}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={`text-xs font-medium ${availability.color}`}
                                    >
                                      {availability.status}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      Qty: {item.Quantity}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => {
                                        /* TODO: Add edit functionality */
                                      }}
                                      className="p-1.5 bg-blue-600/20 hover:bg-blue-600/30 rounded text-blue-400 transition-colors"
                                      title="Edit menu item"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteMenuItem(item.menu_id!)
                                      }
                                      className="p-1.5 bg-red-600/20 hover:bg-red-600/30 rounded text-red-400 transition-colors"
                                      title="Delete menu item"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ChefHat className="w-8 h-8 text-orange-400" />
                      </div>
                      <h4 className="text-white font-semibold mb-2">
                        No Menu Items Yet
                      </h4>
                      <p className="text-gray-400 mb-4">
                        Add food and beverage items to your event menu
                      </p>
                      <button
                        onClick={() => setAddMenuModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add First Menu Item
                      </button>
                    </div>
                  )}
                </div>

                {/* Food Orders Section */}
                <div className="bg-[#101010] rounded-lg p-6 mb-8">
                  <h3 className="mb-6 text-xl font-semibold text-white flex items-center gap-2">
                    <Utensils className="w-6 h-6 text-primary" />
                    Food Orders ({foodOrders.length})
                  </h3>

                  {isLoadingOrders ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-gray-400">Loading food orders...</p>
                    </div>
                  ) : foodOrders.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {foodOrders.map((order) => {
                        const orderStatus =
                          order.quantity > 0
                            ? "Pending"
                            : "Completed"; // Simplified status logic
                        const statusConfig = {
                          Pending: {
                            color: "bg-yellow-900/20 text-yellow-400 border-yellow-400",
                            text: "Pending",
                          },
                          Completed: {
                            color: "bg-green-900/20 text-green-400 border-green-400",
                            text: "Completed",
                          },
                        };
                        const config = statusConfig[orderStatus];

                        return (
                          <div
                            key={order.food_id}
                            className="bg-[#1A1A1A] rounded-lg p-5 hover:bg-[#252525] transition-colors"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-16 h-16 bg-gray-800/20 rounded-lg flex items-center justify-center">
                                <Utensils className="w-8 h-8 text-gray-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-semibold text-lg truncate">
                                      {menuItems.find(
                                        (item) => item.menu_id === order.food_id
                                      )?.FoodName || "Unknown Item"}
                                    </h4>
                                    <p className="text-sm text-gray-400 mt-1">
                                      {order.special_instructions ||
                                        "No special instructions"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`inline-flex items-center gap-2 px-2 py-1 rounded-full border ${config.color}`}
                                    >
                                      <div className="w-2 h-2 rounded-full bg-current"></div>
                                      <span className="text-xs font-medium">
                                        {config.text}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      Qty: {order.quantity}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-gray-400">
                                      Ordered at:{" "}
                                      {new Date().toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-800/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Utensils className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-white font-semibold mb-2">
                        No Food Orders Yet
                      </h4>
                      <p className="text-gray-400 mb-4">
                        No orders have been placed for this event.
                      </p>
                    </div>
                  )}
                </div>

                {event.venue && (
                  <div className="bg-[#101010] rounded-lg p-6 mb-8">
                    <h3 className="mb-6 text-xl font-semibold text-white flex items-center gap-2">
                      <Building className="w-6 h-6 text-primary" />
                      Venue Information
                    </h3>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-white font-semibold text-lg mb-2">
                            {event.venue.name}
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <MapPin className="w-5 h-5 text-primary mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-400">Address</p>
                                <p className="text-white">
                                  {event.venue.location}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <Users className="w-5 h-5 text-primary mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-400">
                                  Capacity
                                </p>
                                <p className="text-white">
                                  {event.venue.capacity?.toLocaleString() ||
                                    "N/A"}{" "}
                                  people
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-[#1A1A1A] rounded-lg p-4">
                          <h5 className="text-white font-medium mb-3">
                            Venue Features
                          </h5>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-gray-300">
                                Parking Available
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-gray-300">Accessible</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-gray-300">
                                Air Conditioned
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-gray-300">
                                Sound System
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {event && (
              <EditEventModal
                isOpen={editEventModalOpen}
                onClose={() => setEditEventModalOpen(false)}
                eventId={event ? eventUtils.getEventId(event) : id}
                initialEvent={event}
                onEventUpdated={() => {
                  if (id) {
                    fetchEvent(id);
                  }
                }}
              />
            )}

            <AddMenuItemModal
              isOpen={addMenuModalOpen}
              onClose={() => setAddMenuModalOpen(false)}
              eventId={id || ""}
              onMenuItemAdded={handleMenuItemAdded}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default EventDetails;

// Food Order Interface
export interface FoodOrder {
  food_id: number;
  event_id: number;
  quantity: number;
  special_instructions: string;
}