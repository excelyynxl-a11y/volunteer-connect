import { useEffect, useState } from "react";
import { ArrowUp, Search } from "lucide-react";
import OpportunityCard from "../../components/OpportunityCard";
import OpportunityDetailModal from "../../components/OpportunityDetailModal";
import {
  defaultAvailabilityPreview,
  isOpportunityInsideAvailability,
  opportunityCategories,
} from "../../lib/opportunityUtils";
import { useAuthStore } from "../../store/useAuthStore";
import { useVolunteerStore } from "../../store/useVolunteerStore";

const VolunteerOpportunities = () => {
  const authUser = useAuthStore((state) => state.authUser);
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
  const [matchesAvailabilityOnly, setMatchesAvailabilityOnly] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const volunteerAvailability =
    Array.isArray(authUser?.availability) && authUser.availability.length > 0
      ? authUser.availability
      : defaultAvailabilityPreview;

  useEffect(() => {
    getAllOpportunities();
  }, [getAllOpportunities]);

  useEffect(() => {
    const scrollContainer = document.querySelector(".volunteer-content");
    const handleScroll = () => {
      setShowBackToTop(
        window.scrollY > 420 || (scrollContainer?.scrollTop ?? 0) > 420,
      );
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    scrollContainer?.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      scrollContainer?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document
      .querySelector(".volunteer-content")
      ?.scrollTo({ top: 0, behavior: "smooth" });
  };

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
      selectedCategories.some((category) =>
        opportunity.category?.includes(category),
      );
    const matchesAvailability =
      !matchesAvailabilityOnly ||
      isOpportunityInsideAvailability(opportunity, volunteerAvailability);

    return (
      matchesStatus &&
      matchesSearch &&
      matchesLocation &&
      matchesCategory &&
      matchesAvailability
    );
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
          <span>
            Find active volunteering opportunities that match your availability
            and interests.
          </span>

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
          <aside
            className="volunteer-opportunities-filter"
            aria-label="Filter opportunities"
          >
            <div className="volunteer-filter-header">
              <h3>Filter</h3>
              {(selectedCategories.length > 0 || matchesAvailabilityOnly) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategories([]);
                    setMatchesAvailabilityOnly(false);
                  }}
                >
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

            <fieldset className="volunteer-availability-filter">
              <legend>Availability</legend>
              <label>
                <input
                  type="checkbox"
                  checked={matchesAvailabilityOnly}
                  onChange={(event) =>
                    setMatchesAvailabilityOnly(event.target.checked)
                  }
                />
                <span>Matches my Availability</span>
              </label>
              <p>
                {volunteerAvailability
                  .map(
                    (slot) =>
                      `${slot.dayOfWeek}, ${slot.startTime} - ${slot.endTime}`,
                  )
                  .join("; ")}
              </p>
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
                {searchQuery.trim() ||
                selectedCategories.length > 0 ||
                matchesAvailabilityOnly
                  ? "No opportunities match your search or filters."
                  : "No active opportunities found."}
              </p>
            )}
          </div>
        </div>
      </section>

      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
      />

      {showBackToTop && (
        <button
          type="button"
          className="back-to-top-button"
          aria-label="Back to top"
          onClick={handleBackToTop}
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
};

export default VolunteerOpportunities;
