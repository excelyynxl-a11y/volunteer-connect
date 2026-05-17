const VolunteerHomepage = () => {
  return (
    <div className="volunteer-homepage">
      <div className="volunteer-homepage-content">
        <div className="volunteer-homepage-header">
          <h1>Volunteer Homepage</h1>
          <p>
            Welcome back. Track your volunteering progress and find opportunities
            that match your availability.
          </p>
        </div>

        <div className="volunteer-summary-grid">
          <div className="profile-detail-card volunteer-summary-card">
            <span>Volunteer Hours</span>
            <strong>0.0h</strong>
          </div>

          <div className="profile-detail-card volunteer-summary-card">
            <span>Past Opportunities</span>
            <strong>0</strong>
          </div>

          <div className="profile-detail-card volunteer-summary-card">
            <span>Pending Applications</span>
            <strong>0</strong>
          </div>

          <div className="profile-detail-card volunteer-summary-card">
            <span>Availability Slots</span>
            <strong>0</strong>
          </div>
        </div>

        <div className="profile-panel recommended-opportunities-panel">
          <div className="section-heading">
            <div>
              <h2>Recommended Opportunities</h2>
              <p>
                Opportunities that match your availability will appear here.
              </p>
            </div>

            <button className="edit-profile-button">
              See More
            </button>
          </div>

          <div className="recommended-opportunities-list">
            recommended opportunity cards later
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerHomepage;