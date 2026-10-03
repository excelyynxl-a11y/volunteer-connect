import React from "react";
import Badge from "./Badge";
import SidebarShell from "./SidebarShell";
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

  const activeKey = navItems.find((item) =>
        item.path === "/organisation-dashboard"
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path),
      )?.key || currentTab;

  return (
    <SidebarShell className="organisation-sidebar" sidebarCollapsed={sidebarCollapsed} label="Organisation">
      {({ collapsed, isMobile, closeMobileMenu }) => <>
      <button
        className="organisation-sidebar-brand"
        onClick={isMobile ? closeMobileMenu : toggleSidebar}
        aria-label={isMobile ? "Close navigation" : collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={isMobile ? "Close navigation" : collapsed ? "Expand sidebar" : "Collapse sidebar"}
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
              closeMobileMenu();
            }}
            aria-label={label}
            title={collapsed ? label : undefined}
          >
            {React.createElement(Icon, { size: 20 })}
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      <div className="organisation-sidebar-footer">
        <button
          className="organisation-sidebar-btn organisation-sidebar-logout"
          onClick={() => { closeMobileMenu(); handleLogout(); }}
          aria-label="Logout"
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
      </>}
    </SidebarShell>
  );
};

export default OrganisationSidebar;
