import React from "react";
import Badge from "./Badge";
import SidebarShell from "./SidebarShell";
import {
  Home,
  Users,
  Building2,
  Lightbulb,
  AlertCircle,
  BarChart3,
  User,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useAdminStore } from "../store/useAdminStore";
import { useNavigate, useLocation } from "react-router-dom";
import "../pages/Admin/Admin.css";


// each button on AdminSidebar will navigate to a path
const navItems = [
  { key: "homepage", path: "/admin-dashboard", label: "Homepage", Icon: Home },
  { key: "volunteer", path: "/admin-dashboard/manage-volunteer", label: "Volunteer", Icon: Users },
  { key: "organisation", path: "/admin-dashboard/manage-organisation", label: "Organisation", Icon: Building2 },
  { key: "opportunity", path: "/admin-dashboard/manage-opportunity", label: "Opportunity", Icon: Lightbulb },
  { key: "report", path: "/admin-dashboard/manage-report", label: "Report", Icon: AlertCircle },
  { key: "analytics", path: "/admin-dashboard/analytics", label: "Analytics", Icon: BarChart3 },
  { key: "profile", path: "/admin-dashboard/profile", label: "Profile", Icon: User },
];

const AdminSidebar = () => {
  
  const { authUser, logout } = useAuthStore();

  const { sidebarCollapsed, toggleSidebar, setCurrentTab, currentTab } = useAdminStore();

  const navigate = useNavigate();
  
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/logging-out");
  };

  // const activeKey = navItems.find((item) => item.path === location.pathname)?.key || "homepage";

  const activeKey = navItems.find((item) =>
        item.path === "/admin-dashboard"
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path),
      )?.key || currentTab;

  return (
    <SidebarShell className="admin-sidebar" sidebarCollapsed={sidebarCollapsed} label="Admin">
      {({ collapsed, isMobile, closeMobileMenu }) => <>
      {/* Badge: click to collapse or expand */}
      <button
        className="admin-sidebar-brand"
        onClick={isMobile ? closeMobileMenu : toggleSidebar}
        aria-label={isMobile ? "Close navigation" : collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={isMobile ? "Close navigation" : collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <Badge
          icon="V"
          name="VolunteerConnect"
          subtitle={authUser?.name || "Admin"}
        />
      </button>

      {/* navigations */}
      <nav className="admin-sidebar-nav">
        {navItems.map(({ key, path, label, Icon }) => (
          <button
            key={key}
            className={`admin-sidebar-btn${
              activeKey === key ? " active" : ""
            }`}
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

      {/* Logout button */}
      <div className="admin-sidebar-footer">
        <button
          className="admin-sidebar-btn admin-sidebar-logout"
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

export default AdminSidebar;
