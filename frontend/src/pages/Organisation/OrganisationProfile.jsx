import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, Plus, Search } from 'lucide-react'
import { getInitials } from '../../lib/utils.js';
import { opportunityMatchesSearch } from '../../lib/opportunity.js';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useOrganisationStore } from '../../store/useOrganisationStore.js';
import OpportunityCard from '../../components/OpportunityCard.jsx';

const OrganisationProfile = () => {
  const { authUser } = useAuthStore();
  const {
    closedOpportunities,
    activeOpportunities,
    cancelledOpportunities,
    getMyOpportunities,
    isOpportunitiesLoading,
    opportunitiesError,
  } = useOrganisationStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (authUser?._id) {
      getMyOpportunities();
    }
  }, [authUser?._id, getMyOpportunities]);

  const filteredActiveOpportunities = useMemo(
    () =>
      activeOpportunities.filter((opportunity) =>
        opportunityMatchesSearch(opportunity, searchQuery),
      ),
    [activeOpportunities, searchQuery],
  );
  const filteredHistoricalOpportunities = useMemo(
    () =>
      [...closedOpportunities, ...cancelledOpportunities].filter(
        (opportunity) => opportunityMatchesSearch(opportunity, searchQuery),
      ),
    [cancelledOpportunities, closedOpportunities, searchQuery],
  );

  return (
    <div className="org-profile-page">

      <div className="org-profile-main">

        <header className="org-profile-header">
          <div className="org-profile-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search your postings..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
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
          <button
            className="org-profile-primary-btn"
            onClick={() => navigate("/organisation-dashboard/create-opportunity")}
          >
            <Plus size={18} />
            Create New Posting
          </button>
        </section>
        <section className="org-profile-section">
          {/* Header Card with Edit Button */}
          <div className="org-profile-card org-profile-header-card">
            <div className="org-profile-header-inner">
              <div className="org-profile-title-row">
                <div className="org-profile-avatar">
                  {authUser?.avatar ? (
                    <img
                      src={authUser.avatar}
                      alt={`${authUser?.name || 'Organisation'} avatar`}
                    />
                  ) : (
                    getInitials(authUser?.name)
                  )}
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
            <h4><b>Previous Events</b></h4>
            <div className="org-profile-events-list">
              {isOpportunitiesLoading ? (
                <p className="org-profile-empty-text">
                  <Loader2 size={18} /> Loading historical postings...
                </p>
              ) : opportunitiesError ? (
                <p className="org-profile-empty-text">
                  Historical postings are currently unavailable.
                </p>
              ) : filteredHistoricalOpportunities.length > 0 ? (
                filteredHistoricalOpportunities.map((opp) => (
                  <OpportunityCard 
                    key={opp._id} 
                    opportunity={opp}
                    showActionButtons={false}
                  />
                ))
              ) : (
                <p className="org-profile-empty-text">
                  {searchQuery.trim()
                    ? 'No historical postings match your search.'
                    : 'No previous or historical events found in the database.'}
                </p>
              )}
            </div>
          </div>
        </section>


        {/* Current Active events */}
        <div className="org-profile-postings-card">
          <div className="org-profile-card-header">
            <h3>Active Opportunity Postings</h3>
            <span className="org-profile-count-badge">
              {activeOpportunities?.length || 0} Published
            </span>
          </div>

          <div className="org-profile-opportunity-list">
            {isOpportunitiesLoading ? (
              <p className="org-profile-empty-text">
                <Loader2 size={18} /> Loading postings...
              </p>
            ) : opportunitiesError ? (
              <div className="org-profile-load-error" role="alert">
                <AlertCircle size={20} />
                <div>
                  <strong>Unable to load postings</strong>
                  <p>{opportunitiesError}</p>
                </div>
                <button type="button" onClick={getMyOpportunities}>
                  Try Again
                </button>
              </div>
            ) : filteredActiveOpportunities.length > 0 ? (
              filteredActiveOpportunities.map((opp) => (
                <OpportunityCard
                  key={opp._id}
                  opportunity={opp}
                  actions={['view', 'edit']}
                  onAction={(type, id) => {
                    if (type === 'edit') {
                      navigate(`/organisation-dashboard/edit-opportunity/${id}`);
                    }
                    if (type === 'view') {
                      navigate(`/organisation-dashboard/view-opportunity/${id}`);
                    }
                  }
                }
                />
              ))
            ) : (
              <p className="org-profile-empty-text">
                {searchQuery.trim()
                  ? 'No active postings match your search.'
                  : "No active postings found. Click 'Create New Posting' above to publish one."}
              </p>
            )}
          </div>

          <button className="org-profile-view-all-link" onClick={() => navigate("/organisation-dashboard/opportunities")}>
        Manage all postings
        </button>
        </div>

      </div>
    </div>
  )
}

export default OrganisationProfile
