import React, { useState, useEffect } from 'react'
import './OrganisationDashboard.css'
import { Search, Bell,  Plus } from 'lucide-react'
import { getInitials } from '../../lib/utils.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useOrganisationStore } from '../../store/useOrganisationStore.js';
import OpportunityCard from '../../components/OpportunityCard.jsx';
import OrganisationSidebar from '../../components/OrganisationSidebar.jsx';

const OrganisationDashboard = () => {

  // organisation of this account = authUser
  const { authUser } = useAuthStore();

  // previous events = completedOpportunities
  // active opportunities = activeOpportunities
  const { 
    completedOpportunities, 
    activeOpportunities
  } = useOrganisationStore();

  return (
    <div className="org-container">
      <aside className="org-sidebar">

        {/* organisation sidebar */}
        <OrganisationSidebar 
          icon={getInitials(authUser.name)}
          orgName={authUser.name}
        />

      </aside>

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
          
          {/* organisation name */}
          <div className="profile-card profile-header-card">
            <div className="profile-header-inner">
              <div className="profile-avatar">
                {getInitials(authUser.name)}
              </div>
              <div>
                <span className="profile-eyebrow">
                  <b>
                    Organisation Profile
                  </b>
                </span>
                <h2>{authUser.name}</h2>
              </div>
            </div>
          </div>

          {/* about us  */}
          <div className="profile-card about-card">
            <div className="card-accent" />
            <h4>
              <b>
                About Us
              </b>
            </h4>
            <p>
              {authUser.biodata || "No description provided yet."}
            </p>
          </div>

          {/* previous events (opportunities that has been completed) section */}
          <div className="profile-card events-card">
            <div className="card-accent" />
            <h4>
              <b>
                Previous Events
              </b>
            </h4>
            <div className="events-list">
              {completedOpportunities && completedOpportunities.length > 0 ? (
                completedOpportunities.map((opp, index) => (
                  <OpportunityCard 
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
                <p className="no-data-text">
                  No previous events listed.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* active oppotunity section */}
        <div className="main-table-card full-width">
          <div className="card-header">
            <h3>
              Active Opportunity Postings
            </h3>
            <span className="count-badge">
              {activeOpportunities.length} Published
            </span>
          </div>
          
          {/* opportunities listing */}
          <div className="opportunity-list">
            {activeOpportunities.map((opp) => (
              <OpportunityCard 
                title={opp.title}
                detail={opp.detail}
                fixedDate={opp.fixedDate}
                timeFrame={opp.timeFrame}
                organisationId={opp.organisationId}
                status={opp.status}
                showActionButtons={true}
              />
            ))}
            {activeOpportunities.length === 0 && <p className="empty-msg">
              No active postings found.
            </p>}
          </div>

          <button className="view-all-link">
            Manage all postings
          </button>
        </div>

      </main>
    </div>
  )
}

export default OrganisationDashboard