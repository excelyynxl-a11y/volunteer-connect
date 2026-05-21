import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  ArrowRight,
  Clock,
  CheckCircle2,
  ClipboardList,
  CalendarDays,
  CalendarClock,
  MapPin,
  CalendarCheck,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
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
    hour12: true,
  });

const formatDateRange = (startAt, endAt) => {
  if (!startAt || !endAt) return "Time to be confirmed";
  return `${formatOpportunityTime(startAt)} - ${formatOpportunityTime(endAt)}`;
};

const shortDay = (day) => (day ? day.slice(0, 3) : "Day");

const getOpportunityImage = (opportunity) => {
  if (!Array.isArray(opportunity?.images)) return "";
  return opportunity.images.find(Boolean) || "";
};

const mockOpportunities = [
  {
    _id: "mock-beach-cleanup",
    title: "Beach Cleanup",
    details: "Help clean the beach and protect the local environment.",
    location: "St Kilda Beach",
    startAt: "2026-06-01T08:00:00",
    endAt: "2026-06-01T12:00:00",
    status: "active",
    images: [],
  },
  {
    _id: "mock-food-bank-helper",
    title: "Food Bank Helper",
    details: "Support food packing and distribution for local families.",
    location: "Community Food Bank",
    startAt: "2026-06-03T10:00:00",
    endAt: "2026-06-03T14:00:00",
    status: "active",
    images: [],
  },
];

const mockApplications = [
  {
    _id: "mock-application-community-garden",
    opportunityTitle: "Community Garden Setup",
    location: "Semenyih Community Garden",
    startAt: "2026-06-08T09:00:00",
    endAt: "2026-06-08T13:00:00",
    status: "accepted",
  },
  {
    _id: "mock-application-food-bank",
    opportunityTitle: "Food Bank Helper",
    location: "Community Food Bank",
    startAt: "2026-06-03T10:00:00",
    endAt: "2026-06-03T14:00:00",
    status: "pending",
  },
];

const getWeekdayName = (dateValue) =>
  new Date(dateValue).toLocaleDateString("en-US", { weekday: "long" });

const getMinutesFromDate = (dateValue) => {
  const date = new Date(dateValue);
  return date.getHours() * 60 + date.getMinutes();
};

const getMinutesFromTime = (timeValue) => {
  if (!timeValue) return null;

  const [hours, minutes] = timeValue.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
};

const isOpportunityInsideAvailability = (opportunity, availabilitySlots) => {
  if (!opportunity?.startAt || !opportunity?.endAt || availabilitySlots.length === 0) {
    return false;
  }

  const opportunityStartDay = getWeekdayName(opportunity.startAt);
  const opportunityEndDay = getWeekdayName(opportunity.endAt);

  if (opportunityStartDay !== opportunityEndDay) {
    return false;
  }

  const opportunityStart = getMinutesFromDate(opportunity.startAt);
  const opportunityEnd = getMinutesFromDate(opportunity.endAt);

  return availabilitySlots.some((slot) => {
    const slotStart = getMinutesFromTime(slot.startTime);
    const slotEnd = getMinutesFromTime(slot.endTime);

    if (slotStart === null || slotEnd === null) {
      return false;
    }

    return (
      slot.dayOfWeek === opportunityStartDay &&
      opportunityStart >= slotStart &&
      opportunityEnd <= slotEnd
    );
  });
};

const VolunteerHomepage = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const {
    opportunities,
    isOpportunitiesLoading,
    opportunitiesError,
    participationHistory,
    totalVolunteerHours,
    getVolunteerPastOpportunity,
    getAllOpportunities,
  } = useVolunteerStore();

  useEffect(() => {
    getAllOpportunities();
    if (authUser?._id) {
      getVolunteerPastOpportunity(authUser._id);
    }
  }, [authUser?._id, getAllOpportunities, getVolunteerPastOpportunity]);

  const displayAvailability = Array.isArray(authUser?.availability)
    ? authUser.availability.slice(0, 3)
    : [];

  const availabilityPreview = displayAvailability.length > 0
    ? displayAvailability.slice(0, 2)
    : [
        { dayOfWeek: "Monday", startTime: "08:00", endTime: "19:00" },
        { dayOfWeek: "Wednesday", startTime: "10:00", endTime: "18:00" },
      ];

  const availabilityForMatching = Array.isArray(authUser?.availability) && authUser.availability.length > 0
    ? authUser.availability
    : availabilityPreview;

  const activeOpportunities = opportunities.filter(
    (opportunity) => opportunity.status?.toLowerCase() === "active",
  );

  const matchingOpportunities = activeOpportunities.filter((opportunity) =>
    isOpportunityInsideAvailability(opportunity, availabilityForMatching),
  );

  const matchingMockOpportunities = mockOpportunities.filter((opportunity) =>
    isOpportunityInsideAvailability(opportunity, availabilityForMatching),
  );

  const recommendedOpportunities = (
    matchingOpportunities.length > 0
      ? matchingOpportunities
      : matchingMockOpportunities
  ).slice(0, 2);

  const applicationStatuses = mockApplications;
  const acceptedApplications = applicationStatuses.filter(
    (application) => application.status === "accepted",
  );
  const nextShift = acceptedApplications[0];
  const navigate = useNavigate();

  const handleSeeMore = () => {
    navigate("/volunteer-dashboard/opportunities");
  };

  const summaryCards = [
    {
      id: "volunteer-hours",
      label: "Volunteer Hours",
      value: totalVolunteerHours || "0.0h",
      description: "Total hours contributed",
      icon: Clock,
      path: "/volunteer-dashboard/profile",
    },
    {
      id: "past-participations",
      label: "Events Completed",
      value: String(participationHistory.length || 0),
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
      path: "/volunteer-dashboard/opportunities",
    },
    {
      id: "availability-slots",
      label: "Availability Slots",
      availability: availabilityPreview,
      icon: CalendarDays,
      path: "/volunteer-dashboard/edit-profile",
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
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                type="button"
                className={`volunteer-summary-card${card.id === "availability-slots" ? " availability-summary-card" : ""}`}
                key={card.id}
                onClick={() => navigate(card.path)}
              >
                <div className="summary-icon">
                  <Icon size={23} />
                </div>
                <div className="summary-content">
                  <span>{card.label}</span>

                  {card.availability ? (
                    <div className="summary-availability-list">
                      {card.availability.map((slot) => (
                        <p key={`${slot.dayOfWeek}-${slot.startTime}-${slot.endTime}`}>
                          <b>{shortDay(slot.dayOfWeek)}</b>
                          {slot.startTime} - {slot.endTime}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <strong>{card.value}</strong>
                  )}

                  {card.description && <p>{card.description}</p>}

                  {card.id === "availability-slots" && (
                    <span className="summary-edit-button">Edit</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="volunteer-homepage-main-grid">
          <section className="profile-panel recommended-opportunities-panel">
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
              <p className="homepage-state-message">{opportunitiesError}</p>
            ) : isOpportunitiesLoading ? (
              <p className="homepage-state-message">Loading opportunities...</p>
            ) : recommendedOpportunities.length === 0 ? (
              <p className="homepage-state-message">
                No opportunities fully match your availability yet.
              </p>
            ) : (
              <div className="homepage-opportunity-list">
                {recommendedOpportunities.map((opportunity) => {
                  const opportunityImage = getOpportunityImage(opportunity);

                  return (
                    <article
                      className={`homepage-opportunity-card${opportunityImage ? " has-image" : ""}`}
                      key={opportunity._id}
                    >
                      <div className="homepage-opportunity-copy">
                        <span className="homepage-status-pill">
                          {opportunity.status || "active"}
                        </span>
                        <h3>{opportunity.title}</h3>
                        <p>{opportunity.details || "Details will be shared soon."}</p>
                        <div className="homepage-opportunity-meta">
                          <CalendarDays size={15} />
                          <span>
                            {opportunity.startAt
                              ? formatOpportunityDate(opportunity.startAt)
                              : "Date to be confirmed"}
                          </span>
                          <span>{formatDateRange(opportunity.startAt, opportunity.endAt)}</span>
                        </div>
                        <button type="button" onClick={handleSeeMore}>
                          View
                          <ArrowRight size={16} />
                        </button>
                      </div>

                      {opportunityImage && (
                        <img
                          className="homepage-opportunity-image"
                          src={opportunityImage}
                          alt={opportunity.title}
                        />
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="homepage-side-column">
            <section className="homepage-side-card">
              <div className="homepage-side-icon">
                <CalendarClock size={23} />
              </div>
              <div className="homepage-side-content">
                <h3>Next Volunteer Shift</h3>
                <strong>{nextShift?.opportunityTitle || "No shift scheduled"}</strong>
                <p>
                  {nextShift?.startAt
                    ? formatOpportunityDate(nextShift.startAt)
                    : "Date to be confirmed"}
                </p>
                <p>{formatDateRange(nextShift?.startAt, nextShift?.endAt)}</p>
                {nextShift?.location && (
                  <p className="homepage-location">
                    <MapPin size={14} />
                    {nextShift.location}
                  </p>
                )}
              </div>
              <button type="button" onClick={handleSeeMore}>View Details</button>
            </section>

            <section className="homepage-side-card">
              <div className="homepage-side-icon">
                <Clock size={23} />
              </div>
              <div className="homepage-side-content">
                <h3>Availability This Week</h3>
                <div className="homepage-availability-list">
                  {availabilityPreview.map((slot) => (
                    <p key={`${slot.dayOfWeek}-${slot.startTime}-${slot.endTime}`}>
                      <span>{shortDay(slot.dayOfWeek)}</span>
                      {slot.startTime} - {slot.endTime}
                    </p>
                  ))}
                </div>
              </div>
              <button type="button" onClick={() => navigate("/volunteer-dashboard/edit-profile")}>
                Edit
              </button>
            </section>

            <section className="homepage-side-card homepage-status-card">
              <div className="homepage-side-icon">
                <CalendarCheck size={23} />
              </div>
              <div className="homepage-side-content">
                <h3>Application Status</h3>
                <div className="homepage-application-list">
                  {applicationStatuses.map((application) => (
                    <p key={application._id}>
                      {application.opportunityTitle}
                      <span className={`application-pill ${application.status}`}>
                        {application.status}
                      </span>
                    </p>
                  ))}
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default VolunteerHomepage;
