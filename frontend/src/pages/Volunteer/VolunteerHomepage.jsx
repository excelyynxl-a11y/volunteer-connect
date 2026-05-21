import OpportunityCard from "../../components/OpportunityCard";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  ClipboardList,
  CalendarDays,
  CalendarClock,
  MapPin,
} from "lucide-react";
import { useVolunteerStore } from "../../store/useVolunteerStore";
import "./Volunteer.css";


const formatOpportunityDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatOpportunityTime = (dateString) =>
  new Date(dateString).toLocaleTimeString("en-MY", {
    hour: "2-digit",
    minute: "2-digit",
  });




const VolunteerHomepage = () => {
  const {
    opportunities,
    isOpportunitiesLoading,
    opportunitiesError,
    getAllOpportunities,
  } = useVolunteerStore();


  useEffect(() => {
    getAllOpportunities();
  }, [getAllOpportunities]);

  const activeOpportunities = opportunities.filter((opportunity) => {
    const matchesStatus = opportunity.status?.toLowerCase() === "active";
    return matchesStatus;
  });
  
  const navigate = useNavigate();

  const handleSeeMore = () => {
    navigate("/volunteer-dashboard/opportunities");
  };

  const summaryCards = [
    {
      id: "volunteer-hours",
      label: "Volunteer Hours",
      value: "0.0h",
      description: "Total hours contributed",
      icon: Clock,
      path: "/volunteer-dashboard/profile",
    },
    {
      id: "past-participations",
      label: "Past Participation",
      value: "0",
      description: "Great job! Keep it up.",
      icon: CheckCircle2,
      path: "/volunteer-dashboard/profile",
    },
    {
      id: "pending-applications",
      label: "Pending Applications",
      value: "0",
      description: "Awaiting review",
      icon: ClipboardList,
      path: "/volunteer-dashboard/applications",
    },
    {
      id: "availability-slots",
      label: "Availability Slots",
      value: "Mon   8:00 am - 19:00 pm",
      secondValue: "Wed   2:00 pm - 4:00 pm",
      icon: CalendarDays,
      path: "/volunteer-dashboard/profile",
    },
  ];

  return (
    <div className="volunteer-homepage">
      <div className="volunteer-homepage-content">
        <div className="volunteer-homepage-header">
          <h1>Volunteer Homepage</h1>
          <p>
            Welcome back. Track your volunteering progress and find opportunities
            that match your availability.
          </p>
        </div>

        <div className="volunteer-summary-grid">
          {summaryCards.map((card) => (
            <button
              type="button"
              className="profile-detail-card volunteer-summary-card"
              key={card.id}
              onClick={() => navigate(card.path)}
            >
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </button>
          ))}
        </div>

        <div className="profile-panel recommended-opportunities-panel">
          <div className="section-heading">
            <div>
              <h2>Recommended Opportunities</h2>
              <p>
                Opportunities that match your availability will appear here.
              </p>
            </div>

            <button
              type="button"
              className="edit-profile-button"
              onClick={handleSeeMore}
            >
              See More
            </button>
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

        </div>
      </div>
    </div>
  );
};

export default VolunteerHomepage;