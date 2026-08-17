import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown } from "lucide-react";
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

const SORT_OPTIONS = [
  { value: "asc", label: "Name: A–Z", Icon: ArrowUp },
  { value: "desc", label: "Name: Z–A", Icon: ArrowDown },
];

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
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const sortTriggerRef = useRef(null);
  const sortOptionRefs = useRef([]);

  const selectedSortOption =
    SORT_OPTIONS.find((option) => option.value === sortOrder) || SORT_OPTIONS[0];

  const closeSortMenu = () => {
    setIsSortMenuOpen(false);
    sortTriggerRef.current?.focus();
  };

  useEffect(() => {
    if (!isSortMenuOpen) return;

    const selectedIndex = SORT_OPTIONS.findIndex(
      (option) => option.value === sortOrder,
    );
    sortOptionRefs.current[selectedIndex]?.focus();
  }, [isSortMenuOpen, sortOrder]);

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
            <div
              className="followed-organisations-sort"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setIsSortMenuOpen(false);
                }
              }}
            >
              <button
                type="button"
                className="followed-organisations-sort-trigger"
                id="followed-organisations-sort-trigger"
                aria-haspopup="menu"
                aria-controls="followed-organisations-sort-menu"
                aria-label={`Sort followed organisations by name, currently ${selectedSortOption.label}`}
                aria-expanded={isSortMenuOpen}
                ref={sortTriggerRef}
                onKeyDown={(event) => {
                  if (event.key === "Escape" && isSortMenuOpen) {
                    event.preventDefault();
                    closeSortMenu();
                  }

                  if (
                    !isSortMenuOpen &&
                    (event.key === "ArrowDown" || event.key === "ArrowUp")
                  ) {
                    event.preventDefault();
                    setIsSortMenuOpen(true);
                  }
                }}
                onClick={() => setIsSortMenuOpen((isOpen) => !isOpen)}
              >
                <ArrowUpDown size={18} aria-hidden="true" />
                <span>{selectedSortOption.label}</span>
                <ChevronDown size={16} aria-hidden="true" />
              </button>

              {isSortMenuOpen && (
                <div
                  id="followed-organisations-sort-menu"
                  className="followed-organisations-sort-menu"
                  role="menu"
                  aria-labelledby="followed-organisations-sort-trigger"
                  onKeyDown={(event) => {
                    const selectedIndex = SORT_OPTIONS.findIndex(
                      (option) => option.value === sortOrder,
                    );
                    const focusedIndex = sortOptionRefs.current.findIndex(
                      (option) => option === event.target,
                    );
                    const currentIndex =
                      focusedIndex >= 0 ? focusedIndex : selectedIndex;

                    if (event.key === "Escape") {
                      event.preventDefault();
                      closeSortMenu();
                      return;
                    }

                    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                      event.preventDefault();
                      const direction = event.key === "ArrowDown" ? 1 : -1;
                      const nextIndex =
                        (currentIndex + direction + SORT_OPTIONS.length) %
                        SORT_OPTIONS.length;
                      sortOptionRefs.current[nextIndex]?.focus();
                    }

                    if (event.key === "Home" || event.key === "End") {
                      event.preventDefault();
                      const nextIndex = event.key === "Home" ? 0 : SORT_OPTIONS.length - 1;
                      sortOptionRefs.current[nextIndex]?.focus();
                    }
                  }}
                >
                  {SORT_OPTIONS.map((option, index) => {
                    const Icon = option.Icon;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="menuitemradio"
                        aria-checked={sortOrder === option.value}
                        className={sortOrder === option.value ? "selected" : ""}
                        tabIndex={sortOrder === option.value ? 0 : -1}
                        ref={(element) => {
                          sortOptionRefs.current[index] = element;
                        }}
                        onClick={() => {
                          setSortOrder(option.value);
                          closeSortMenu();
                        }}
                      >
                        <Icon size={20} aria-hidden="true" />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
