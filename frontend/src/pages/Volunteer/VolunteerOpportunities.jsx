import { useEffect, useState } from "react";
import { ArrowUp, ChevronDown, Search } from "lucide-react";
import CustomSelect from "../../components/CustomSelect";
import OpportunityCard from "../../components/OpportunityCard";
import OpportunityDetailModal from "../../components/OpportunityDetailModal";
import {
  getMinutesFromTime,
  isOpportunityInsideAvailability,
  opportunityMatchesSearch,
  opportunityCategories,
} from "../../lib/opportunityUtils";
import {
  volunteerAvailabilityDays,
  volunteerAvailabilityTimes,
} from "../../lib/data";
import { useAuthStore } from "../../store/useAuthStore";
import { useVolunteerStore } from "../../store/useVolunteerStore";

const initialCustomAvailability = {
  dayOfWeek: "",
  startTime: "",
  endTime: "",
};

const VolunteerOpportunities = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const {
    opportunities,
    isOpportunitiesLoading,
    opportunitiesError,
    getAllOpportunities,
  } = useVolunteerStore();
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [matchesAvailabilityOnly, setMatchesAvailabilityOnly] = useState(false);
  const [customAvailability, setCustomAvailability] = useState(
    initialCustomAvailability,
  );
  const [isCustomAvailabilityOpen, setIsCustomAvailabilityOpen] =
    useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const volunteerAvailability = Array.isArray(authUser?.availability)
    ? authUser.availability
    : [];
  const hasVolunteerAvailability = volunteerAvailability.length > 0;
  const hasCustomAvailabilityInput = Object.values(customAvailability).some(Boolean);
  const customAvailabilityStart = getMinutesFromTime(customAvailability.startTime);
  const customAvailabilityEnd = getMinutesFromTime(customAvailability.endTime);
  const hasValidCustomAvailability =
    Boolean(customAvailability.dayOfWeek) &&
    customAvailabilityStart !== null &&
    customAvailabilityEnd !== null &&
    customAvailabilityStart < customAvailabilityEnd;
  const customAvailabilitySummary = hasValidCustomAvailability
    ? `${customAvailability.dayOfWeek}, ${customAvailability.startTime} - ${customAvailability.endTime}`
    : "";
  const categorySummary =
    selectedCategories.length > 0
      ? `${selectedCategories.length} selected`
      : "All categories";

  useEffect(() => {
    getAllOpportunities();
  }, [getAllOpportunities]);

  const shouldFilterByAvailability =
    hasVolunteerAvailability && matchesAvailabilityOnly;
  const shouldFilterByCustomAvailability = hasValidCustomAvailability;


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
    const scrollContainer = document.querySelector(".volunteer-content");

    scrollContainer?.scrollTo({ top: 0, behavior: "auto" });
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const activeOpportunities = opportunities.filter((opportunity) => {
    const matchesStatus = opportunity.status?.toLowerCase() === "active";
    const matchesSearch = opportunityMatchesSearch(opportunity, searchQuery);
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some((category) =>
        opportunity.category?.includes(category),
      );
    const matchesAvailability =
      (!shouldFilterByAvailability && !shouldFilterByCustomAvailability) ||
      (shouldFilterByAvailability &&
        isOpportunityInsideAvailability(opportunity, volunteerAvailability)) ||
      (shouldFilterByCustomAvailability &&
        isOpportunityInsideAvailability(opportunity, [customAvailability]));

    return (
      matchesStatus &&
      matchesSearch &&
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

  const updateCustomAvailability = (field, value) => {
    setCustomAvailability((currentAvailability) => ({
      ...currentAvailability,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setIsCategoryOpen(true);
    setMatchesAvailabilityOnly(false);
    setCustomAvailability(initialCustomAvailability);
    setIsCustomAvailabilityOpen(false);
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
          </div>
        </div>
      </section>

      <section className="volunteer-opportunities-panel">
        <div className="volunteer-opportunities-header">
          <div>
            <h2>Opportunity Postings</h2>
            <p>Browse available activities published by organisations.</p>
          </div>
          <span className="volunteer-opportunities-count">
            {activeOpportunities.length} results
          </span>
        </div>

        <div className="volunteer-opportunities-body">
          <aside
            className="volunteer-opportunities-filter"
            aria-label="Filter opportunities"
          >
            <div className="volunteer-filter-header">
              <h3>Filter</h3>
              {(selectedCategories.length > 0 ||
                shouldFilterByAvailability ||
                hasCustomAvailabilityInput) && (
                <button
                  type="button"
                  onClick={clearFilters}
                >
                  Clear
                </button>
              )}
            </div>

            <fieldset
              className="volunteer-category-filter"
              aria-label="Category filters"
            >
              <button
                type="button"
                className="filter-section-toggle"
                aria-expanded={isCategoryOpen}
                onClick={() => {
                  const nextIsOpen = !isCategoryOpen;
                  setIsCategoryOpen(nextIsOpen);

                  if (nextIsOpen) {
                    setIsCustomAvailabilityOpen(false);
                  }
                }}
              >
                <span>
                  <strong>Category</strong>
                  <small>{categorySummary}</small>
                </span>
                <ChevronDown size={18} />
              </button>

              {isCategoryOpen && (
                <div className="volunteer-category-options">
                  {opportunityCategories.map((category) => (
                    <label
                      key={category}
                      className={
                        selectedCategories.includes(category) ? "selected" : ""
                      }
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            <fieldset className="volunteer-availability-filter">
              <legend>Availability</legend>
              <label>
                <input
                  type="checkbox"
                  checked={shouldFilterByAvailability}
                  disabled={!hasVolunteerAvailability}
                  onChange={(event) =>
                    setMatchesAvailabilityOnly(event.target.checked)
                  }
                />
                <span>Fits my Availability</span>
              </label>
              <p>
                {hasVolunteerAvailability
                  ? volunteerAvailability
                      .map(
                        (slot) =>
                          `${slot.dayOfWeek}, ${slot.startTime} - ${slot.endTime}`,
                      )
                      .join("; ")
                  : "Add availability in your profile to use this filter."}
              </p>

              <div className="custom-availability-filter">
                <button
                  type="button"
                  className="filter-section-toggle custom-availability-toggle"
                  aria-expanded={isCustomAvailabilityOpen}
                  onClick={() => {
                    const nextIsOpen = !isCustomAvailabilityOpen;
                    setIsCustomAvailabilityOpen(nextIsOpen);

                    if (nextIsOpen) {
                      setIsCategoryOpen(false);
                    }
                  }}
                >
                  <span>
                    <strong>Choose a custom time</strong>
                    {customAvailabilitySummary && (
                      <small>{customAvailabilitySummary}</small>
                    )}
                  </span>
                  <ChevronDown size={18} />
                </button>

                {isCustomAvailabilityOpen && (
                  <div className="custom-availability-panel">
                    <label>
                      <span>Day</span>
                      <CustomSelect
                        value={customAvailability.dayOfWeek}
                        placeholder="Day of Week"
                        options={volunteerAvailabilityDays}
                        onChange={(event) =>
                          updateCustomAvailability("dayOfWeek", event)
                        }
                      />
                    </label>

                    <div className="custom-availability-time-row">
                      <label>
                        <span>Start</span>
                        <CustomSelect
                          value={customAvailability.startTime}
                          placeholder="Start Time"
                          options={volunteerAvailabilityTimes}
                          onChange={(value) =>
                            updateCustomAvailability("startTime", value)
                          }
                        />
                      </label>

                      <label>
                        <span>End</span>
                        <CustomSelect
                          value={customAvailability.endTime}
                          placeholder="End Time"
                          options={volunteerAvailabilityTimes}
                          onChange={(value) =>
                            updateCustomAvailability("endTime", value)
                          }
                        />
                      </label>
                    </div>

                    {hasCustomAvailabilityInput && !hasValidCustomAvailability && (
                      <p className="custom-availability-hint">
                        Select a day and a valid start/end time to filter.
                      </p>
                    )}

                    {hasCustomAvailabilityInput && (
                      <button
                        type="button"
                        className="custom-availability-clear"
                        onClick={() =>
                          setCustomAvailability(initialCustomAvailability)
                        }
                      >
                        Clear time
                      </button>
                    )}
                  </div>
                )}
              </div>
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
                    showStatus={false}
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
                shouldFilterByAvailability ||
                hasCustomAvailabilityInput
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
