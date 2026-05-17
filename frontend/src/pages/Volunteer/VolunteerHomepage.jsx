import OpportunityCard from "../../components/OpportunityCard";
import { useNavigate } from "react-router-dom";

const mockOpportunities = [
  {
    _id: "1",
    title: "Beach Cleanup",
    details: "Help clean the beach and protect the local environment.",
    organisationId: "org1",
    images: [],
    location: "Port Dickson",
    startAt: "2026-06-01T08:00:00+08:00",
    endAt: "2026-06-01T12:00:00+08:00",
    applicationDeadline: "2026-05-28T23:59:00.000Z",
    maxVolunteers: 20,
    approvedVolunteersCount: 8,
    category: ["Environment"],
    requirements: "Comfortable working outdoors.",
    status: "active",
    spotsRemaining: 12,
    isFull: false,
  },
  {
    _id: "2",
    title: "Food Bank Helper",
    details: "Support food packing and distribution for local families.",
    organisationId: "org2",
    images: [],
    location: "Subang Jaya",
    startAt: "2026-06-05T10:00:00+08:00",
    endAt: "2026-06-05T14:00:00+08:00",
    applicationDeadline: "2026-06-02T23:59:00.000Z",
    maxVolunteers: 15,
    approvedVolunteersCount: 7,
    category: ["Community"],
    requirements: "Able to help carry light food packages.",
    status: "active",
    spotsRemaining: 8,
    isFull: false,
  },
];

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
  const navigate = useNavigate();

  const handleSeeMore = () => {
    navigate("/volunteer-dashboard/opportunities");
  };

  const summaryCards = [
    {
      id: "volunteer-hours",
      label: "Volunteer Hours",
      value: "0.0h",
      path: "/volunteer-dashboard/profile",
    },
    {
      id: "past-participations",
      label: "Past Participation",
      value: "0",
      path: "/volunteer-dashboard/profile",
    },
    {
      id: "pending-applications",
      label: "Pending Applications",
      value: "0",
      path: "/volunteer-dashboard/applications",
    },
    {
      id: "availability-slots",
      label: "Availability Slots",
      value: "0",
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

          <div className="recommended-opportunities-list">
            {mockOpportunities.slice(0, 3).map((opportunity) => (
              <OpportunityCard
                key={opportunity._id}
                title={opportunity.title}
                detail={opportunity.details}
                fixedDate={formatOpportunityDate(opportunity.startAt)}
                timeFrame={`${formatOpportunityTime(opportunity.startAt)} - ${formatOpportunityTime(opportunity.endAt)}`}
                status={opportunity.status}
                showActionButtons
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerHomepage;