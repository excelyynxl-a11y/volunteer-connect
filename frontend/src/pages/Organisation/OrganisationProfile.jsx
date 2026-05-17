import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Plus } from 'lucide-react'
import { getInitials } from '../../lib/utils.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useOrganisationStore } from '../../store/useOrganisationStore.js';
import OpportunityCard from '../../components/OpportunityCard.jsx';

const OrganisationProfile = () => {
  const { authUser } = useAuthStore();
  const {
    closedOpportunities,
    activeOpportunities,
    cancelledOpportunities,
    getActiveOpportunities,
    getClosedOpportunities,
    getCancelledOpportunities,
  } = useOrganisationStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeOpportunities.length === 0) getActiveOpportunities(authUser?._id);
    getClosedOpportunities(authUser?._id);
    getCancelledOpportunities(authUser?._id);
  }, [authUser?._id, getActiveOpportunities, getClosedOpportunities, getCancelledOpportunities]);

  return (
    <div className="org-profile-page">

      <div className="org-profile-main">

        <header className="org-profile-header">
          <div className="org-profile-search">
            <Search size={18} />
            <input type="text" placeholder="Search your postings..." />
          </div>
          <div className="org-profile-header-actions">
            <div className="org-profile-notification">
              <Bell size={20} />
              <span className="org-profile-bell-dot"></span>
            </div>
          </div>
        </header>
        
        <section className="org-profile-banner">
          <div className="org-profile-banner-text">
            <span className="org-profile-eyebrow">
              ORGANISATION CONTROL PANEL
            </span>
            <h1>
              Welcome back, {authUser?.name} 
            </h1>
            <p>
              Managing {" "}
              <b>
                {activeOpportunities.length} active opportunities
              </b>. Your community impact is growing.
            </p>
          </div>
          <button className="org-profile-primary-btn"><Plus size={18} />
            Create New Posting
          </button>
        </section>

        <section className="org-profile-section">
          {/* Header Card with Edit Button */}
          <div className="org-profile-card org-profile-header-card">
            <div className="org-profile-header-inner">
              <div className="org-profile-title-row">
                <div className="org-profile-avatar">
                  {getInitials(authUser?.name)}
                </div>
                <div>
                  <span className="org-profile-eyebrow">
                    <b>
                      Organisation Profile
                    </b>
                  </span>
                  <h2>{authUser?.name}</h2>
                </div>
              </div>
              <button
                className="org-profile-secondary-btn"
                onClick={() => {
                  navigate("/organisation-dashboard/edit-organisation-profile");
                }}
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* About Us */}
          <div className="org-profile-card">
            <div className="org-profile-card-accent" />
            <h4>
              <b>
                About Us
              </b>
            </h4>
            <p>
              {authUser?.biodata || "No description provided yet."}
            </p>
          </div>

          {/* Previous Events */}
          <div className="org-profile-card org-profile-events-card">
            <div className="org-profile-card-accent" />
              <h4>
                <b>
                  Previous Events
                </b>
              </h4>
            <div className="org-profile-events-list">
              {closedOpportunities && closedOpportunities.length > 0 ? (
                closedOpportunities.map((opp) => (
                  <OpportunityCard 
                    key={opp._id || opp.title} // Always use keys in maps
                    opportunity={opp}
                    showActionButtons={false}
                  />
                ))
              ) : (
                <p className="org-profile-empty-text">No previous events listed.</p>
              )}
              {cancelledOpportunities && cancelledOpportunities.length > 0 ? (
                cancelledOpportunities.map((opp) => (
                  <OpportunityCard 
                    key={opp._id || opp.title} // Always use keys in maps
                    opportunity={opp}
                    showActionButtons={false}
                  />
                ))
              ) : (
                <p className="org-profile-empty-text">
                  No previous events listed.
                </p>
              )}
            </div>
          </div>
        </section>
        
        <div className="org-profile-postings-card">
          <div className="org-profile-card-header">
            <h3>
              Active Opportunity Postings
            </h3>
            <span className="org-profile-count-badge">{activeOpportunities.length} Published</span>
          </div>

          <div className="org-profile-opportunity-list">
            {activeOpportunities.map((opp) => (
              <OpportunityCard
                key={opp._id}
                opportunity={opp}
                actions={['view', 'edit']}
                onAction={(type, id) => {
                  if (type === 'edit') {
                    navigate(`/organisation-dashboard/edit-opportunity/${id}`)
                  } // add view when needed
                }
              }
              />
            ))}
            {activeOpportunities.length === 0 && <p className="org-profile-empty-text">No active postings found.</p>}
          </div>

          <button className="org-profile-view-all-link">Manage all postings</button>
        </div>

      </div>
    </div>
  )
}

export default OrganisationProfile
