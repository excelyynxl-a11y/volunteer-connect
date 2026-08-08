import React from "react";
import Badge from "./Badge";
import {
  AlertCircle,
  File,
  Home,
  LogOut,
  MessageCircle,
  Search,
  User,
  Users,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useOrganisationStore } from "../store/useOrganisationStore";
import { useNavigate, useLocation } from "react-router-dom";
import "../pages/Organisation/Organisation.css";

const navItems = [
  { key: "homepage", path: "/organisation-dashboard", label: "Homepage", Icon: Home },
  { key: "opportunity", path: "/organisation-dashboard/opportunities", label: "Opportunity", Icon: Search },
  { key: "application", path: "/organisation-dashboard/applications", label: "Application", Icon: File },
  { key: "followers", path: "/organisation-dashboard/followers", label: "Followers", Icon: Users },
  { key: "messages", path: "/organisation-dashboard/messages", label: "Messages", Icon: MessageCircle },
  { key: "report", path: "/organisation-dashboard/report", label: "Report", Icon: AlertCircle },
  { key: "profile", path: "/organisation-dashboard/profile", label: "Profile", Icon: User },

];

const OrganisationSidebar = () => {
  const { authUser, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar, setCurrentTab, currentTab } = useOrganisationStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/logging-out");
  };

  const activeItem = navItems.find((item) => {
    if (item.path === "/organisation-dashboard") {
      return location.pathname === item.path;
    }

    return (
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`)
    );
  });
  const activeKey = activeItem?.key || currentTab;

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
