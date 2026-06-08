import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Matches from "./pages/Matches";
import Register from "./pages/Register";
import TwoFASetup from "./pages/TwoFASetup";

export default function App() {
  return (
    <div className="page">
      <header className="header">
        <h2>Bayern Tickets</h2>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/matches" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/2fa/setup" element={<ProtectedRoute><TwoFASetup /></ProtectedRoute>} />
          <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
