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

const getOrganisationName = (opportunity) =>
  opportunity?.organisationId?.name || opportunity?.organisationName || "Organisation";

const getSpotsRemaining = (opportunity) =>
  Math.max((opportunity?.maxVolunteers || 0) - (opportunity?.approvedVolunteersCount || 0), 0);

const getRequirementItems = (requirements = "") =>
  requirements
    .split(/\n|•|-/)
    .map((requirement) => requirement.trim())
    .filter(Boolean);

const opportunityCategories = [
  "Environment",
  "Education",
  "Health",
  "Community",
  "Animal Welfare",
  "Elderly Care",
  "Disability Support",
  "Event Support",
  "Fundraising",
  "Other",
];

const VolunteerOpportunities = () => {
  const {
    opportunities,
    isOpportunitiesLoading,
    opportunitiesError,
    getAllOpportunities,
  } = useVolunteerStore();
  const [filters] = useState({
    location: "",
    availability: "",
  });
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    getAllOpportunities();
  }, [getAllOpportunities]);

  const activeOpportunities = opportunities.filter((opportunity) => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();
    const matchesStatus = opportunity.status?.toLowerCase() === "active";
    const matchesSearch =
      !normalizedSearchQuery ||
      opportunity.title?.toLowerCase().startsWith(normalizedSearchQuery);
    const matchesLocation =
      !filters.location || opportunity.location === filters.location;
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some((category) => opportunity.category?.includes(category));

    // TODO: Compare opportunity.startAt/endAt with the volunteer availability value.
    const matchesAvailability = !filters.availability || true;

    return matchesStatus && matchesSearch && matchesLocation && matchesCategory && matchesAvailability;
  });

  const toggleCategory = (category) => {
    setSelectedCategories((currentCategories) =>
      currentCategories.includes(category)
        ? currentCategories.filter((currentCategory) => currentCategory !== category)
        : [...currentCategories, category],
    );
  };

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
              <input
                type="search"
                placeholder="Search opportunities or organisations"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
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

        <div className="volunteer-opportunities-body">
          <aside className="volunteer-opportunities-filter" aria-label="Filter opportunities">
            <div className="volunteer-filter-header">
              <h3>Filter</h3>
              {selectedCategories.length > 0 && (
                <button type="button" onClick={() => setSelectedCategories([])}>
                  Clear
                </button>
              )}
            </div>

            <fieldset>
              <legend>Category</legend>
              {opportunityCategories.map((category) => (
                <label key={category}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                  <span>{category}</span>
                </label>
              ))}
            </fieldset>
          </aside>

          <div className="volunteer-opportunities-results">
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
              <p>
                {searchQuery.trim() || selectedCategories.length > 0
                  ? "No opportunities match your search or filters."
                  : "No active opportunities found."}
              </p>
            )}
          </div>
        </div>
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
                {getSpotsRemaining(selectedOpportunity)} spots left
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
