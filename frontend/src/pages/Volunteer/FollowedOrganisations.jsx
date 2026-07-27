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

const avatarStyle = {
  width: 56,
  height: 56,
  borderRadius: 999,
  flexShrink: 0,
};

const OrganisationAvatar = ({ name, avatar }) => {
  const [failedAvatar, setFailedAvatar] = useState("");

  if (avatar && avatar !== failedAvatar) {
    return (
      <img
        src={avatar}
        alt={`${name} avatar`}
        onError={() => setFailedAvatar(avatar)}
        style={{
          ...avatarStyle,
          objectFit: "cover",
        }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      style={{
        ...avatarStyle,
        background: "#d9aa55",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 800,
      }}
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

        <div className="volunteer-opportunities-search" style={{ marginTop: 20 }}>
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
            <p
              role="alert"
              style={{
                marginBottom: 16,
                padding: "12px 14px",
                border: "1px solid #f1c6c3",
                borderRadius: 10,
                background: "#fff5f5",
                color: "#b31212",
              }}
            >
              {followError}
            </p>
          )}

          {isFollowLoading ? (
            <p>Loading...</p>
          ) : filtered.length === 0 && !followError ? (
            <p>No followed organisations.</p>
          ) : filtered.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map((org) => (
                <div key={org._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: 12, border: '1px solid #efe7de', borderRadius: 12, background: '#fff' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: '1 1 360px', minWidth: 0 }}>
                    <OrganisationAvatar name={org.name} avatar={org.avatar} />
                    <div style={{ flex: 1, minWidth: 0, maxWidth: 720 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <strong style={{ overflowWrap: 'anywhere' }}>{org.name}</strong>
                      </div>
                      <div
                        style={{
                          color: '#64748b',
                          fontSize: 14,
                          marginTop: 6,
                          overflow: 'hidden',
                          overflowWrap: 'anywhere',
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 2,
                        }}
                      >
                        {org.biodata}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0, marginLeft: 'auto' }}>
                    <button onClick={() => navigate(`/organisation/${org._id}`)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e6e2dc', background: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      View Profile
                    </button>
                    <button onClick={async () => { await unfollowOrganisation(org._id); }} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #f1c6c3', background: '#fff', color: '#b31212', cursor: 'pointer', whiteSpace: 'nowrap' }}>
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
