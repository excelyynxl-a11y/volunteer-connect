import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInitials } from "../../lib/utils";
import { useFollowStore } from "../../store/useFollowStore";
import "./Volunteer.css";

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
      {getInitials(name)}
    </div>
  );
};

const FollowedOrganisations = () => {
  const navigate = useNavigate();
  const {
    followedOrganisations,
    getMyFollowedOrganisations,
    unfollowOrganisation,
    isFollowedOrganisationsLoading,
    followMutationOrganisationId,
    followError,
  } = useFollowStore();
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    getMyFollowedOrganisations();
  }, [getMyFollowedOrganisations]);

  const displayedOrganisations = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? followedOrganisations.filter((o) =>
          (o.name || "").toLowerCase().includes(q),
        )
      : followedOrganisations;

    return [...filtered].sort((first, second) => {
      const comparison = (first.name || "").localeCompare(
        second.name || "",
        undefined,
        { sensitivity: "base" },
      );

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [followedOrganisations, query, sortOrder]);

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
          <div className="followed-organisations-header-actions">
            <label className="followed-organisations-sort">
              <span>Sort by</span>
              <select
                aria-label="Sort followed organisations by name"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
              >
                <option value="asc">Name: A–Z</option>
                <option value="desc">Name: Z–A</option>
              </select>
            </label>
            <div className="volunteer-opportunities-count">{followedOrganisations.length} following</div>
          </div>
        </div>

        <div>
          {followError && (
            <p role="alert" className="followed-organisations-error">
              {followError}
            </p>
          )}

          {isFollowedOrganisationsLoading && followedOrganisations.length === 0 ? (
            <p>Loading...</p>
          ) : displayedOrganisations.length === 0 && !followError ? (
            <p>No followed organisations.</p>
          ) : displayedOrganisations.length > 0 ? (
            <div className="followed-organisations-list">
              {displayedOrganisations.map((org) => (
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
                      onClick={() =>
                        navigate(
                          `/volunteer-dashboard/organisations/${org._id}`,
                        )
                      }
                    >
                      View Profile
                    </button>
                    <button
                      className="followed-organisations-action followed-organisations-unfollow"
                      disabled={followMutationOrganisationId === org._id}
                      onClick={async () => { await unfollowOrganisation(org._id); }}
                    >
                      {followMutationOrganisationId === org._id
                        ? "Unfollowing..."
                        : "Unfollow"}
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
