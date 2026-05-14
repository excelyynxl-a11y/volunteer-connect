// import React from 'react';
// import Badge from './Badge';
// import { LayoutDashboard, Megaphone, FileText, LogOut } from 'lucide-react';
// import './OrganisationSidebar.css';

// const OrganisationSidebar = ({
//     icon,
//     orgName
// }) => {

//   return (
//     <div className="org-sidebar">
//         <div className="brand">
//             <Badge
//                 icon={icon}
//                 name={orgName}
//                 subtitle="ORGANISATION"
//             />
//         </div>

//         <nav className="side-nav">
//             <div className="nav-item active"><LayoutDashboard size={20} />
//                 Dashboard
//             </div>
//             <div className="nav-item"><Megaphone size={20} />
//                 Opportunities
//             </div>
//             <div className="nav-item"><FileText size={20} />
//                 Applications
//             </div>
//         </nav>
//         <div className="logout-btn-container" style={{marginTop: 'auto'}}>
//             <div className="nav-item" style={{color: '#a64d3d'}}><LogOut size={20} />
//                 Logout
//             </div>
//         </div>
//     </div>
//   )
// }

// export default OrganisationSidebar


import React from "react";
import Badge from "./Badge";
import {
  Home,
  User,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useOrganisationStore } from "../store/useOrganisationStore";
import { getInitials } from '../lib/utils.js';
import { useNavigate, useLocation } from "react-router-dom";
import "../pages/Organisation/Organisation.css";


// each button on OrganisationSidebar will navigate to a path
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
      {/* Badge: click to collapse or expand */}
      <button
        className="organisation-sidebar-brand"
        onClick={toggleSidebar}
        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <Badge
          icon={getInitials(authUser.name)}
          name={authUser.name}
          subtitle={authUser?.name || "Organisation"}
        />
      </button>

      {/* navigations */}
      <nav className="organisation-sidebar-nav">
        {navItems.map(({ key, path, label, Icon }) => (
          <button
            key={key}
            className={`organisation-sidebar-btn${
              activeKey === key ? " active" : ""
            }`}
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

      {/* Logout button */}
      <div className="organisation-sidebar-footer">
        <button
          className="Organisation-sidebar-btn organisation-sidebar-logout"
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
