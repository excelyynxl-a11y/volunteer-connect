import { useEffect } from "react";
import { Search } from "lucide-react";
import OpportunityCard from "../../components/OpportunityCard";
import { useVolunteerStore } from "../../store/useVolunteerStore";

const VolunteerOpportunities = () => {
  const {
    opportunities,
    isOpportunitiesLoading,
    opportunitiesError,
    getAllOpportunities,
  } = useVolunteerStore();

  useEffect(() => {
    getAllOpportunities();
  }, [getAllOpportunities]);

  const activeOpportunities = opportunities.filter(
    (opportunity) => opportunity.status?.toLowerCase() === "active",
  );

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
              />
            ))}
          </div>
        ) : (
          <p>No active opportunities found.</p>
        )}
      </section>
    </div>
  );
};

export default VolunteerOpportunities;
