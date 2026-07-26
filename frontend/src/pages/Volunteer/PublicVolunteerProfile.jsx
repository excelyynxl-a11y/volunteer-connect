import {
  BriefcaseBusiness,
  FileText,
  UserRound,
} from "lucide-react";

import "./PublicVolunteerProfile.css";

const PublicVolunteerProfile = () => {
  return (
    <div className="public-volunteer-profile-page">
      <section className="public-volunteer-profile-hero">
        <div className="public-volunteer-profile-avatar" aria-hidden="true">
          <UserRound size={42} />
        </div>

        <div className="public-volunteer-profile-introduction">
          <p className="public-volunteer-profile-eyebrow">
            Public Volunteer Profile
          </p>
          <h1>Volunteer Profile</h1>
          <p>Volunteer information will appear here.</p>
        </div>
      </section>

      <div className="public-volunteer-profile-layout">
        <main className="public-volunteer-profile-main">
          <section className="public-volunteer-profile-card">
            <div className="public-volunteer-profile-card-heading">
              <div>
                <h2>Skills</h2>
                <p>Volunteer strengths and interests.</p>
              </div>
              <BriefcaseBusiness size={22} aria-hidden="true" />
            </div>

            <p className="public-volunteer-profile-empty">
              No skills are available.
            </p>
          </section>

          <section className="public-volunteer-profile-card">
            <div className="public-volunteer-profile-card-heading">
              <div>
                <h2>Recent Participation</h2>
                <p>Recently completed volunteering activities.</p>
              </div>
            </div>

            <p className="public-volunteer-profile-empty">
              No recent participation is available.
            </p>
          </section>
        </main>

        <aside className="public-volunteer-profile-aside">
          <section className="public-volunteer-profile-card">
            <p className="public-volunteer-profile-section-label">
              Profile Summary
            </p>

            <div className="public-volunteer-profile-summary-item">
              <span>Age Group</span>
              <strong>Not provided</strong>
            </div>
          </section>

          <section className="public-volunteer-profile-card">
            <div className="public-volunteer-profile-card-heading">
              <div>
                <p className="public-volunteer-profile-section-label">
                  Application Document
                </p>
                <h2>Resume</h2>
              </div>
              <FileText size={22} aria-hidden="true" />
            </div>

            <p className="public-volunteer-profile-empty">
              No resume has been provided.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default PublicVolunteerProfile;
