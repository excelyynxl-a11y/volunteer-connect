import React from "react";
import Badge from "./Badge";
import {
  Home,
  LogOut,
  Search,
  User,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getInitials } from "../lib/utils";
import { useAuthStore } from "../store/useAuthStore";
import { useVolunteerStore } from "../store/useVolunteerStore";
import "../pages/Volunteer/Volunteer.css";

const navItems = [
  { key: "homepage", path: "/volunteer-dashboard", label: "Homepage", Icon: Home },
  { key: "profile", path: "/volunteer-dashboard/profile", label: "Profile", Icon: User },
  { key: "opportunities", path: "/volunteer-dashboard/opportunities", label: "Opportunities", Icon: Search },
];

const VolunteerSidebar = () => {
  const { authUser, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar, setCurrentTab } = useVolunteerStore();
  const navigate = useNavigate();
  const location = useLocation();
  const volunteerInitials = getInitials(authUser?.name);

  const handleLogout = async () => {
    await logout();
    navigate("/logging-out");
  };

  const activeKey = location.pathname.startsWith("/volunteer-dashboard/edit-profile")
    ? "profile"
    : navItems.find((item) => item.path === location.pathname)?.key || "homepage";

  return (
    <aside className={`volunteer-sidebar${sidebarCollapsed ? " collapsed" : ""}`}>
      <button
        className="volunteer-sidebar-brand"
        onClick={toggleSidebar}
        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <Badge
          icon={volunteerInitials}
          name="VolunteerConnect"
          subtitle={authUser?.name || "Volunteer"}
        />
      </button>

      <nav className="volunteer-sidebar-nav">
        {navItems.map(({ key, path, label, Icon: NavIcon }) => (
          <button
            key={key}
            className={`volunteer-sidebar-btn${activeKey === key ? " active" : ""}`}
            onClick={() => {
              setCurrentTab(key);
              navigate(path);
            }}
            title={sidebarCollapsed ? label : undefined}
          >
            {React.createElement(NavIcon, { size: 20 })}
            {!sidebarCollapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      <div className="volunteer-sidebar-footer">
        <button
          className="volunteer-sidebar-btn volunteer-sidebar-logout"
          onClick={handleLogout}
          title={sidebarCollapsed ? "Logout" : undefined}
        >
          <LogOut size={20} />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default VolunteerSidebar;
