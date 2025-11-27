import { useEffect, useState } from "react";
import Header from "../sections/Dashboard/Header";
import StatsRow from "../sections/Dashboard/StatsRow";
import RecentEvents from "../sections/Dashboard/RecentEvents";
import TicketingAnalysis from "../sections/Dashboard/TicketingAnalysis";
import SimpleCreateEventWizard from "../components/SimpleCreateEventWizard";
import { Navigate, useLocation } from "react-router-dom";
import { authUtils, type UserProfile } from "../api/auth";
import DashboardLayout from "../components/DashboardLayout";

const Dashboard = () => {
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);
  const [eventsRefreshKey, setEventsRefreshKey] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const location = useLocation();

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
    <DashboardLayout>
      <Header userProfile={userProfile} />

      <StatsRow refreshKey={eventsRefreshKey} />
      <RecentEvents
        onCreateEvent={() => setCreateEventModalOpen(true)}
        refreshKey={eventsRefreshKey}
      />
      <TicketingAnalysis />

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
          } catch { }
        }}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
