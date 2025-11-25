
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import SeatSelection from "./pages/SeatSelection";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyAccount from "./pages/VerifyAccount";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import EventsDashboard from "./pages/EventsDashboard";
import SpecificEvent from "./pages/SpecificEvent";
import Tickets from "./pages/Tickets";
import Account from "./pages/Account";
import GoogleCallback from "./pages/GoogleCallback";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminListDashboard from "./pages/adminListDashboard";

function App() {
  return (
    <Routes>
      {/* Public Routes - No authentication required */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/events" element={<Events />} />
      <Route path="/specificEvent/:id" element={<SpecificEvent />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-account" element={<VerifyAccount />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />

      {/* Protected Routes - Authentication required */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events-dashboard"
        element={
          <ProtectedRoute>
            <EventsDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events-dashboard/:id"
        element={
          <ProtectedRoute>
            <EventDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <Tickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id/seats"
        element={
          <ProtectedRoute>
            <SeatSelection />
          </ProtectedRoute>
        }
      />
      <Route path="/admin-list" element={<ProtectedRoute><AdminListDashboard /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
