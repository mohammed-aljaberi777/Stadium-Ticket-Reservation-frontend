import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";
import Admin from "./pages/Admin";
import ConfirmBooking from "./pages/ConfirmBooking";
import Login from "./pages/Login";
import MatchDetail from "./pages/MatchDetail";
import Matches from "./pages/Matches";
import MyTickets from "./pages/MyTickets";
import Register from "./pages/Register";
import Scanner from "./pages/Scanner";
import TwoFASetup from "./pages/TwoFASetup";

function Nav() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const initials = user.full_name
    ? user.full_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <nav className="nav">
      <NavLink to="/matches" className="nav-brand">
        <div className="nav-crest">⚽</div>
        Bayern Tickets
      </NavLink>

      <div className="nav-links">
        <NavLink to="/matches" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          Matches
        </NavLink>
        <NavLink to="/tickets" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
          My Tickets
        </NavLink>
        {user.role === "ADMIN" && (
          <NavLink to="/admin" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            Admin
          </NavLink>
        )}
        {user.role === "GATE_SCANNER" && (
          <NavLink to="/scan" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            Scanner
          </NavLink>
        )}
        <div className="nav-avatar" title={user.full_name}>{initials}</div>
        <button
          className="btn-sm"
          onClick={logout}
          style={{ marginLeft: 4, background: "rgba(255,255,255,.15)", color: "white", fontWeight: 600 }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Navigate to="/matches" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/2fa/setup" element={<ProtectedRoute><TwoFASetup /></ProtectedRoute>} />
        <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
        <Route path="/matches/:matchId" element={<ProtectedRoute><MatchDetail /></ProtectedRoute>} />
        <Route path="/confirm/:holdId" element={<ProtectedRoute><ConfirmBooking /></ProtectedRoute>} />
        <Route path="/tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
        <Route path="/scan" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
