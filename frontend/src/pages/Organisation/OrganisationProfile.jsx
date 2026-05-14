import React from 'react'
import { Link, Route, useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, Settings } from 'lucide-react'
import { getInitials } from '../../lib/utils.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useOrganisationStore } from '../../store/useOrganisationStore.js';
import OpportunityCard from '../../components/OpportunityCard.jsx';
import OrganisationSidebar from '../../components/OrganisationSidebar.jsx';
import './OrganisationDashboard.css'

const OrganisationProfile = () => {
  const { authUser } = useAuthStore();
  const { completedOpportunities, activeOpportunities } = useOrganisationStore();

  const navigate = useNavigate();

  return (
    <div className="org-container">

      <main className="org-main">
        {/* search bar */}
        <header className="org-header">
          <div className="search-bar">
            <Search size={18} />
            <input type="text" placeholder="Search your postings..." />
          </div>
          <div className="header-actions">
            <div className="notification-bell">
              <Bell size={20} />
              <span className="bell-dot"></span>
            </div>
          </div>
        </header>

        <section className="welcome-banner">
          <div className="banner-text">
            <span className="eyebrow-red">
              ORGANISATION CONTROL PANEL
            </span>
            <h1>
              Welcome back, {authUser.name}
            </h1>
            <p>
              Managing {" "}
              <b>
                {activeOpportunities.length} active opportunities
              </b>. Your community impact is growing.
            </p>
          </div>
          <button className="btn-primary-org"><Plus size={18} />
            Create New Posting
          </button>
        </section>

        <section className="organisation-profile-section">
          {/* Header Card with Edit Button */}
          <div className="profile-card profile-header-card">
            <div className="profile-header-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div className="profile-avatar">{getInitials(authUser.name)}</div>
                <div>
                  <span className="profile-eyebrow"><b>Organisation Profile</b></span>
                  <h2>{authUser.name}</h2>
                </div>
              </div>
              {/* <Link to="" className="btn-secondary-org" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <Settings size={18} /> Edit Profile
              </Link> */}
              <button
                className="btn-secondary-org"
                onClick={() => {
                  navigate("/organisation-dashboard/edit-organisation-profile");
                }}
              >Edit Profile
              </button>
            </div>
          </div>

          {/* About Us */}
          <div className="profile-card about-card">
            <div className="card-accent" />
            <h4><b>About Us</b></h4>
            <p>{authUser.biodata || "No description provided yet."}</p>
          </div>

          {/* Previous Events */}
          <div className="profile-card events-card">
            <div className="card-accent" />
            <h4>
              <b>
                Previous Events
              </b>
            </h4>
            <div className="events-list">
              {completedOpportunities && completedOpportunities.length > 0 ? (
                completedOpportunities.map((opp) => (
                  <OpportunityCard 
                    key={opp._id || opp.title} // Always use keys in maps
                    title={opp.title}
                    detail={opp.detail}
                    fixedDate={opp.fixedDate}
                    timeFrame={opp.timeFrame}
                    organisationId={opp.organisationId}
                    status={opp.status}
                    showActionButtons={true}
                  />
                ))
              ) : (
                <p className="no-data-text">No previous events listed.</p>
              )}
            </div>
          </div>
        </section>

        {/* Active Opportunity Section */}
        <div className="main-table-card full-width">
          <div className="card-header">
            <h3>Active Opportunity Postings</h3>
            <span className="count-badge">{activeOpportunities.length} Published</span>
          </div>
          
          {/* opportunities listing */}
          <div className="opportunity-list">
            {activeOpportunities.map((opp) => (
              <OpportunityCard 
                key={opp._id || opp.title} 
                title={opp.title}
                detail={opp.detail}
                fixedDate={opp.fixedDate}
                timeFrame={opp.timeFrame}
                organisationId={opp.organisationId}
                status={opp.status}
                showActionButtons={true}
              />
            ))}
            {activeOpportunities.length === 0 && <p className="empty-msg">No active postings found.</p>}
          </div>

          <button className="view-all-link">Manage all postings</button>
        </div>

      </main>
    </div>
  )
}

export default OrganisationProfile