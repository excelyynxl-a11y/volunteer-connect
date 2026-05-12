import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import "./WelcomeAbroad.css";

const WelcomeAbroad = ({ role, redirectTo, redirectState }) => {
  const navigate = useNavigate();

  const dashboardPath =
    role === "admin"
      ? "/admin-dashboard"
      : role === "organisation"
        ? "/organisation-dashboard"
        : "/volunteer-dashboard";

  const targetPath = redirectTo || dashboardPath;

  // set WelcomeAbroad card to exist for 2.5 seconds only
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(targetPath, { replace: true, state: redirectState });
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate, targetPath, redirectState]);

  return (
    <main className="welcome-page">
      <div className="welcome-card">
        <CheckCircle className="welcome-icon" />

        <h1 className="welcome-heading">Welcome Aboard!</h1>

        <p className="welcome-subtitle">Directing to your dashboard...</p>

        {/* welcome bar track */}
        <div className="welcome-bar-track">
          <div className="welcome-bar-fill" />
        </div>
      </div>
    </main>
  );
};

export default WelcomeAbroad;
