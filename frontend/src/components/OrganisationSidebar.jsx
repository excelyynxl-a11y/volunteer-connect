import React from "react";
import Badge from "./Badge";
import {
  Home,
  LogOut,
  User,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useOrganisationStore } from "../store/useOrganisationStore";
import { useNavigate, useLocation } from "react-router-dom";
import "../pages/Organisation/Organisation.css";

const navItems = [
  { key: "homepage", path: "/organisation-dashboard", label: "Homepage", Icon: Home },
  { key: "profile", path: "/organisation-dashboard/profile", label: "Profile", Icon: User },
];

const OrganisationSidebar = () => {
  const { authUser, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar, setCurrentTab } = useOrganisationStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/logging-out");
  };

  const activeKey = location.pathname.startsWith("/organisation-dashboard/profile") ||
    location.pathname.startsWith("/organisation-dashboard/edit-organisation-profile")
      ? "profile"
      : navItems.find((item) => item.path === location.pathname)?.key || "homepage";

  return (
    <aside className={`organisation-sidebar${sidebarCollapsed ? " collapsed" : ""}`}>
      <button
        className="organisation-sidebar-brand"
        onClick={toggleSidebar}
        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <Badge
          icon="V"
          name="VolunteerConnect"
          subtitle={authUser?.name || "Organisation"}
        />
      </button>

      <nav className="organisation-sidebar-nav">
        {navItems.map(({ key, path, label, Icon }) => (
          <button
            key={key}
            className={`organisation-sidebar-btn${activeKey === key ? " active" : ""}`}
            onClick={() => {
              setCurrentTab(key);
              navigate(path);
            }}
            title={sidebarCollapsed ? label : undefined}
          >
            {React.createElement(Icon, { size: 20 })}
            {!sidebarCollapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      <div className="organisation-sidebar-footer">
        <button
          className="organisation-sidebar-btn organisation-sidebar-logout"
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

export default OrganisationSidebar;
