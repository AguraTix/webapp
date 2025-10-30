import { useEffect, useState } from "react";
import Sidebar from "../sections/Dashboard/Sidebar";
import Header from "../sections/Dashboard/Header";
import StatsRow from "../sections/Dashboard/StatsRow";
import RecentEvents from "../sections/Dashboard/RecentEvents";
import TicketingAnalysis from "../sections/Dashboard/TicketingAnalysis";
import SimpleCreateEventWizard from "../components/SimpleCreateEventWizard";
import { LayoutGrid, CalendarDays, Ticket, User, X } from "lucide-react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { authUtils, type UserProfile } from "../api/auth";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);
  const [eventsRefreshKey, setEventsRefreshKey] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const location = useLocation();

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
    const checkAuth = () => {
      const isValid = authUtils.isAuthenticated();
      setIsAuthenticated(isValid);
      if (isValid) {
        const profile = authUtils.getUserProfile();
        setUserProfile(profile);
      }
    };
    checkAuth();
  }, []);
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  console.log("User Profile:", userProfile);
  console.log("Auth Token:", authUtils.getAuthToken());
  console.log("Is Authenticated:", authUtils.isAuthenticated());

  return (
    <div className="flex flex-col min-h-screen w-full bg-black text-opacity-35 overflow-x-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 md:hidden">
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
                    className={`flex items-center gap-3 px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200 ${
                      isActive
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
        <main className="flex-1 py-8 md:py-10 w-full overflow-x-hidden">
          <div className="max-w-6xl mx-auto w-full px-4 md:px-8">
            <Header userProfile={userProfile} />
            <StatsRow refreshKey={eventsRefreshKey} />
            <RecentEvents
              onCreateEvent={() => setCreateEventModalOpen(true)}
              refreshKey={eventsRefreshKey}
            />
            <TicketingAnalysis />
          </div>
        </main>
      </div>

      {/* Create Event Modal */}
      <SimpleCreateEventWizard
        isOpen={createEventModalOpen}
        onClose={() => setCreateEventModalOpen(false)}
        onEventCreated={() => {
          setCreateEventModalOpen(false);
          // Trigger RecentEvents to refetch and show its loading state
          setEventsRefreshKey((k) => k + 1);
          // Broadcast refresh to other tabs/pages
          try {
            localStorage.setItem('eventsRefreshKey', String(Date.now()));
          } catch {}
        }}
      />
    </div>
  );
};

export default Dashboard;
