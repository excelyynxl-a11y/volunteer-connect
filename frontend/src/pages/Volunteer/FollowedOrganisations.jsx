import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFollowStore } from "../../store/useFollowStore";
import "./Volunteer.css";

const initials = (name) =>
  name
    ? name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "?";

const OrganisationAvatar = ({ name, avatar }) => {
  const [failedAvatar, setFailedAvatar] = useState("");

  if (avatar && avatar !== failedAvatar) {
    return (
      <img
        src={avatar}
        alt={`${name} avatar`}
        onError={() => setFailedAvatar(avatar)}
        className="followed-organisations-avatar followed-organisations-avatar-image"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="followed-organisations-avatar followed-organisations-avatar-fallback"
    >
      {initials(name)}
    </div>
  );
};

const FollowedOrganisations = () => {
  const navigate = useNavigate();
  const {
    followedOrganisations,
    getMyFollowedOrganisations,
    unfollowOrganisation,
    isFollowLoading,
    followError,
  } = useFollowStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    getMyFollowedOrganisations();
  }, [getMyFollowedOrganisations]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return followedOrganisations;
    return followedOrganisations.filter((o) => o.name.toLowerCase().includes(q));
  }, [followedOrganisations, query]);

  return (
    <div className="volunteer-opportunities-page">
      <div className="volunteer-opportunities-hero">
        <p>ORGANISATIONS</p>
        <h1>Followed Organisations</h1>
        <span>Keep up with organisations you care about and discover their latest opportunities.</span>

        <div className="volunteer-opportunities-search followed-organisations-search">
          <label>
            <input
              placeholder="Search followed organisations"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="volunteer-opportunities-panel">
        <div className="volunteer-opportunities-header">
          <div>
            <h2>Followed organisations</h2>
            <p>Manage your followed organisations and view their profiles.</p>
          </div>
          <div className="volunteer-opportunities-count">{followedOrganisations.length} following</div>
        </div>

        <div>
          {followError && (
            <p role="alert" className="followed-organisations-error">
              {followError}
            </p>
          )}

          {isFollowLoading ? (
            <p>Loading...</p>
          ) : filtered.length === 0 && !followError ? (
            <p>No followed organisations.</p>
          ) : filtered.length > 0 ? (
            <div className="followed-organisations-list">
              {filtered.map((org) => (
                <div key={org._id} className="followed-organisations-card">
                  <div className="followed-organisations-summary">
                    <OrganisationAvatar name={org.name} avatar={org.avatar} />
                    <div className="followed-organisations-details">
                      <div className="followed-organisations-name-row">
                        <strong className="followed-organisations-name">{org.name}</strong>
                      </div>
                      <div className="followed-organisations-biodata">
                        {org.biodata}
                      </div>
                    </div>
                  </div>

                  <div className="followed-organisations-actions">
                    <button
                      className="followed-organisations-action followed-organisations-view"
                      onClick={() => navigate(`/organisation/${org._id}`)}
                    >
                      View Profile
                    </button>
                    <button
                      className="followed-organisations-action followed-organisations-unfollow"
                      onClick={async () => { await unfollowOrganisation(org._id); }}
                    >
                      Unfollow
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default FollowedOrganisations;
