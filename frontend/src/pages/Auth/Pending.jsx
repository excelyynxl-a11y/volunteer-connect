import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, Clock } from "lucide-react";
import "./Pending.css";
import Badge from "../../components/Badge";
import { useAuthStore } from "../../store/useAuthStore";

const Pending = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser, logout } = useAuthStore();

  const approvalStatus =
    location.state?.status || authUser?.approvalStatus || "pending";
  const isRejected = approvalStatus === "rejected";
  const StatusIcon = isRejected ? AlertTriangle : Clock;

  const heading = isRejected
    ? "Account not approved"
    : "Account pending approval";

  const message = isRejected
    ? "Your account was not approved. Please contact support or try again with updated details."
    : "Your account is under review. We will notify you once approval is complete.";

  const hint = isRejected
    ? "If you believe this is a mistake, reach out to the admin team for assistance."
    : "This typically takes one to two business days.";

  const handleNavigate = async (path) => {
    try {
      await logout();
    } finally {
      navigate(path, { replace: true });
    }
  };

  return (
    <main className="pending-page">
      <section className="pending-card">
        <div className="pending-brand">
          <Badge
            icon="V"
            name="VolunteerConnect"
            subtitle="COMMUNITY PLATFORM"
          />
        </div>

        <StatusIcon className="pending-icon" />

        <h1 className="pending-heading">{heading}</h1>
        <p className="pending-message">{message}</p>
        <p className="pending-hint">{hint}</p>

        <div className="pending-actions">
          <button
            type="button"
            className="pending-button"
            onClick={() => handleNavigate("/")}
          >
            Back Home
          </button>
          <button
            type="button"
            className="pending-button secondary"
            onClick={() => handleNavigate("/login")}
          >
            Try another account
          </button>
        </div>
      </section>
    </main>
  );
};

export default Pending;
