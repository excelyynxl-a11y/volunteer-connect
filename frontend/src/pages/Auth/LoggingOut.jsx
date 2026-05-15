import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import "./WelcomeAbroad.css";

const LoggingOut = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="welcome-page">
      <div className="welcome-card">
        <LogOut className="welcome-icon" />

        <h1 className="welcome-heading">Logging Out</h1>

        <p className="welcome-subtitle">See you next time!</p>

        <div className="welcome-bar-track">
          <div className="welcome-bar-fill" />
        </div>
      </div>
    </main>
  );
};

export default LoggingOut;
