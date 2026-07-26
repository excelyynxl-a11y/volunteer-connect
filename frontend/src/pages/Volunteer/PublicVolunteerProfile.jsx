import { useEffect } from "react";
import {
  BriefcaseBusiness,
  FileText,
} from "lucide-react";
import { useParams } from "react-router-dom";

import { getInitials } from "../../lib/utils";
import { useOrganisationStore } from "../../store/useOrganisationStore";
import "./PublicVolunteerProfile.css";

const PublicVolunteerProfile = () => {
  const { volunteerId } = useParams();
  const {
    getPublicVolunteerProfile,
    isPublicVolunteerProfileLoading,
    publicVolunteerProfile,
    publicVolunteerProfileError,
  } = useOrganisationStore();

  useEffect(() => {
    getPublicVolunteerProfile(volunteerId);
  }, [getPublicVolunteerProfile, volunteerId]);

  if (isPublicVolunteerProfileLoading) {
    return (
      <div className="public-volunteer-profile-page">
        <p className="public-volunteer-profile-feedback" role="status">
          Loading volunteer profile...
        </p>
      </div>
    );
  }

  if (publicVolunteerProfileError || !publicVolunteerProfile) {
    return (
      <div className="public-volunteer-profile-page">
        <p className="public-volunteer-profile-feedback error" role="alert">
          {publicVolunteerProfileError || "Volunteer profile is unavailable."}
        </p>
      </div>
    );
  }

  const {
    ageGroup,
    avatar,
    biodata,
    name,
    resume,
    skills = [],
  } = publicVolunteerProfile;

  return (
    <div className="public-volunteer-profile-page">
      <section className="public-volunteer-profile-hero">
        <div className="public-volunteer-profile-avatar">
          {avatar ? (
            <img src={avatar} alt={`${name || "Volunteer"} avatar`} />
          ) : (
            <span aria-hidden="true">{getInitials(name)}</span>
          )}
        </div>

        <div className="public-volunteer-profile-introduction">
          <p className="public-volunteer-profile-eyebrow">
            Public Volunteer Profile
          </p>
          <h1>{name || "Volunteer Profile"}</h1>
          <p>{biodata || "No profile summary has been provided."}</p>
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

            {Array.isArray(skills) && skills.length > 0 ? (
              <div className="public-volunteer-profile-skills">
                {skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            ) : (
              <p className="public-volunteer-profile-empty">
                No skills are available.
              </p>
            )}
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
              <strong>{ageGroup || "Not provided"}</strong>
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

            {resume ? (
              <div className="public-volunteer-profile-resume">
                <span>Volunteer resume</span>
                <div className="public-volunteer-profile-resume-actions">
                  <a href={resume} target="_blank" rel="noreferrer">
                    View
                  </a>
                  <a href={resume} download>
                    Download
                  </a>
                </div>
              </div>
            ) : (
              <p className="public-volunteer-profile-empty">
                No resume has been provided.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
};

export default PublicVolunteerProfile;
