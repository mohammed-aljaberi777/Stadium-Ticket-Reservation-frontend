// Placeholder — full implementation in Part 2.
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Matches() {
  const { user, logout } = useAuth();
  return (
    <div className="card">
      <h1>You're signed in! 🎉</h1>
      <p>Welcome, <strong>{user?.full_name}</strong> ({user?.email}).</p>
      <p>Role: <code>{user?.role}</code>. 2FA enabled: <code>{user?.totp_enabled ? "yes" : "no"}</code>.</p>

      {!user?.totp_enabled && (
        <div style={{ background: "#fef3c7", padding: 12, borderRadius: 6, marginBottom: 16 }}>
          <strong>⚠️ 2FA not enabled yet.</strong>{" "}
          <Link to="/2fa/setup">Set up 2FA now →</Link>
        </div>
      )}

      <p>Match browsing UI coming in Part 2.</p>
      <button onClick={logout}>Log out</button>
    </div>
  );
}
