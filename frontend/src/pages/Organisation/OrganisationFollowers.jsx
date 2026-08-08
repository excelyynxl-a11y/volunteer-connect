import { useCallback, useEffect, useState } from "react";

import { getInitials } from "../../lib/utils";
import { useAuthStore } from "../../store/useAuthStore";
import { useFollowStore } from "../../store/useFollowStore";
import "./OrganisationFollowers.css";

const VolunteerAvatar = ({ name, avatar }) => {
  const [failedAvatar, setFailedAvatar] = useState("");

  if (avatar && avatar !== failedAvatar) {
    return (
      <img
        src={avatar}
        alt={`${name} avatar`}
        className="organisation-followers-avatar organisation-followers-avatar-image"
        onError={() => setFailedAvatar(avatar)}
      />
    );
  }

  return (
    <span
      className="organisation-followers-avatar organisation-followers-avatar-fallback"
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
};

const OrganisationFollowers = () => {
  const { authUser } = useAuthStore();
  const {
    followers,
    followersError,
    getOrganisationFollowers,
    isFollowLoading,
  } = useFollowStore();
  const organisationId = authUser?._id;

  const loadFollowers = useCallback(() => {
    if (organisationId) {
      void getOrganisationFollowers(organisationId);
    }
  }, [getOrganisationFollowers, organisationId]);

  useEffect(() => {
    loadFollowers();
  }, [loadFollowers]);

  return (
    <div className="organisation-followers-page">
      <header className="organisation-followers-header">
        <div>
          <span className="organisation-followers-eyebrow">COMMUNITY</span>
          <h1>Followers</h1>
          <p>Volunteers who follow your organisation.</p>
        </div>
        <span className="organisation-followers-count">
          {followers.length} {followers.length === 1 ? "follower" : "followers"}
        </span>
      </header>

      <section className="organisation-followers-panel" aria-labelledby="followers-list-title">
        <div className="organisation-followers-panel-heading">
          <div>
            <h2 id="followers-list-title">Your followers</h2>
            <p>People who have chosen to keep up with your organisation.</p>
          </div>
        </div>

        {isFollowLoading ? (
          <p className="organisation-followers-state" role="status">
            Loading followers...
          </p>
        ) : followersError ? (
          <div className="organisation-followers-state organisation-followers-state-error" role="alert">
            <p>{followersError}</p>
            <button type="button" onClick={loadFollowers}>
              Try again
            </button>
          </div>
        ) : followers.length === 0 ? (
          <p className="organisation-followers-state">
            No volunteers are following your organisation yet.
          </p>
        ) : (
          <ul className="organisation-followers-list">
            {followers.map((follower) => (
              <li className="organisation-followers-row" key={follower._id}>
                <VolunteerAvatar name={follower.name} avatar={follower.avatar} />
                <span className="organisation-followers-name">
                  {follower.name || "Volunteer"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default OrganisationFollowers;
