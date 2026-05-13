import React from 'react';
import Badge from './Badge';
import { LayoutDashboard, Megaphone, FileText, LogOut } from 'lucide-react';
import './OrganisationSidebar.css';

const OrganisationSidebar = ({
    icon,
    orgName
}) => {

  return (
    <div className="org-sidebar">
        <div className="brand">
            <Badge
                icon={icon}
                name={orgName}
                subtitle="ORGANISATION"
            />
        </div>

        <nav className="side-nav">
            <div className="nav-item active"><LayoutDashboard size={20} />
                Dashboard
            </div>
            <div className="nav-item"><Megaphone size={20} />
                Opportunities
            </div>
            <div className="nav-item"><FileText size={20} />
                Applications
            </div>
        </nav>
        <div className="logout-btn-container" style={{marginTop: 'auto'}}>
            <div className="nav-item" style={{color: '#a64d3d'}}><LogOut size={20} />
                Logout
            </div>
        </div>
    </div>
  )
}

export default OrganisationSidebar
