import { useEffect, useState } from "react";
import { CalendarDays, Clock, MapPin, Search, Users, X } from "lucide-react";
import OpportunityCard from "../../components/OpportunityCard";
import { useVolunteerStore } from "../../store/useVolunteerStore";

const formatDate = (dateValue) => {
  if (!dateValue) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateValue));
};

const formatTime = (dateValue) => {
  if (!dateValue) return "";

  return new Intl.DateTimeFormat("en-MY", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(new Date(dateValue))
    .toLowerCase();
};

const formatTimeRange = (startAt, endAt) => {
  if (!startAt || !endAt) return "";

  return `${formatTime(startAt)} - ${formatTime(endAt)}`;
};

const calculateDuration = (startAt, endAt) => {
  if (!startAt || !endAt) return "";

  const durationMs = new Date(endAt).getTime() - new Date(startAt).getTime();
  const durationHours = Math.max(durationMs / (1000 * 60 * 60), 0);

  return `${Number.isInteger(durationHours) ? durationHours : durationHours.toFixed(1)} Hours`;
};

const getOrganisationName = (opportunity) =>
  opportunity?.organisationId?.name || opportunity?.organisationName || "Organisation";

const getRequirementItems = (requirements = "") =>
  requirements
    .split(/\n|•|-/)
    .map((requirement) => requirement.trim())
    .filter(Boolean);

const VolunteerOpportunities = () => {
  const {
    opportunities,
    isOpportunitiesLoading,
    opportunitiesError,
    getAllOpportunities,
  } = useVolunteerStore();
  const [filters] = useState({
    location: "",
    category: "",
    availability: "",
  });
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  useEffect(() => {
    getAllOpportunities();
  }, [getAllOpportunities]);

  const activeOpportunities = opportunities.filter((opportunity) => {
    const matchesStatus = opportunity.status?.toLowerCase() === "active";
    const matchesLocation =
      !filters.location || opportunity.location === filters.location;
    const matchesCategory =
      !filters.category || opportunity.category?.includes(filters.category);

    // TODO: Compare opportunity.startAt/endAt with the volunteer availability value.
    const matchesAvailability = !filters.availability || true;

    return matchesStatus && matchesLocation && matchesCategory && matchesAvailability;
  });

  return (
    <div className="volunteer-opportunities-page">
      <section className="volunteer-opportunities-hero">
        <div>
          <p>VOLUNTEER OPPORTUNITIES</p>
          <h1>Find your next opportunity</h1>
          <span>Find active volunteering opportunities that match your availability and interests.</span>

          <div className="volunteer-opportunities-search">
            <label>
              <Search size={20} />
              <input type="search" placeholder="Search opportunities or organisations" />
            </label>
            <button type="button">Search</button>
          </div>

          {/* TODO: Add filter controls and update filters for location, category, and availability. */}
        </div>
      </section>

      <section className="volunteer-opportunities-panel">
        <div className="volunteer-opportunities-header">
          <div>
            <h2>Active Opportunity Postings</h2>
            <p>Browse available activities published by organisations.</p>
          </div>
          <span className="volunteer-opportunities-count">
            {activeOpportunities.length} Active
          </span>
        </div>

        {opportunitiesError ? (
          <p>{opportunitiesError}</p>
        ) : isOpportunitiesLoading ? (
          <p>Loading opportunities...</p>
        ) : activeOpportunities.length > 0 ? (
          <div className="volunteer-opportunities-grid">
            {activeOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity._id}
                opportunity={opportunity}
                variant="volunteer"
                actions={["view"]}
                onAction={(action, selectedCardOpportunity) => {
                  if (action === "view") {
                    setSelectedOpportunity(selectedCardOpportunity);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <p>No active opportunities found.</p>
        )}
      </section>

      {selectedOpportunity && (
        <div
          className="opportunity-detail-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="opportunity-detail-title"
        >
          <div className="opportunity-detail-modal">
            <button
              className="opportunity-detail-close"
              type="button"
              aria-label="Close opportunity details"
              onClick={() => setSelectedOpportunity(null)}
            >
              <X size={22} />
            </button>

            <div className="opportunity-detail-header">
              <div>
                <span className="opportunity-detail-eyebrow">
                  {selectedOpportunity.category?.[0] || "Opportunity"}
                </span>
                <h2 id="opportunity-detail-title">{selectedOpportunity.title}</h2>
                <p>{getOrganisationName(selectedOpportunity)}</p>
              </div>

              <button className="apply-volunteer-button" type="button">
                Apply As Volunteer
              </button>
            </div>

            <div className="opportunity-detail-meta">
              <span>
                <MapPin size={17} />
                {selectedOpportunity.location}
              </span>
              <span>
                <CalendarDays size={17} />
                {formatDate(selectedOpportunity.startAt)}
              </span>
              <span>
                <Clock size={17} />
                {formatTimeRange(selectedOpportunity.startAt, selectedOpportunity.endAt)}
              </span>
              <span>
                <Users size={17} />
                {calculateDuration(selectedOpportunity.startAt, selectedOpportunity.endAt)}
              </span>
            </div>

            <section className="opportunity-detail-section">
              <h3>Opportunity Details</h3>
              <div className="opportunity-detail-box">
                <p>{selectedOpportunity.details}</p>
              </div>
            </section>

            <section className="opportunity-detail-section">
              <h3>Volunteer Requirements</h3>
              <div className="opportunity-requirements-box">
                {getRequirementItems(selectedOpportunity.requirements).length > 0 ? (
                  <ul>
                    {getRequirementItems(selectedOpportunity.requirements).map((requirement) => (
                      <li key={requirement}>{requirement}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No specific requirements listed.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerOpportunities;
