import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
import OpportunityDetailModal from "../../components/OpportunityDetailModal";
import { useAuthStore } from "../../store/useAuthStore";
import { useVolunteerStore } from "../../store/useVolunteerStore";
import {
  formatOpportunityDate,
  formatOpportunityTimeRange,
  getOpportunityImage,
  isOpportunityInsideAvailability,
  shortDay,
  sortAvailabilitySlots,
} from "../../lib/utils";
import "./Volunteer.css";

const VolunteerHomepage = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const availabilitySummaryLimit = 3;
  const {
    opportunities,
    isOpportunitiesLoading,
    opportunitiesError,
    participationHistory,
    totalVolunteerHours,
    volunteerApplications,
    isVolunteerApplicationsLoading,
    volunteerApplicationsError,
    getVolunteerPastExperience,
    getVolunteerApplications,
    getAllOpportunities,
  } = useVolunteerStore();

  useEffect(() => {
    getAllOpportunities();
    if (authUser?._id) {
      getVolunteerPastExperience(authUser._id);
      getVolunteerApplications(authUser._id);
    }
  }, [
    authUser?._id,
    getAllOpportunities,
    getVolunteerApplications,
    getVolunteerPastExperience,
  ]);

  const displayAvailability = Array.isArray(authUser?.availability)
    ? sortAvailabilitySlots(authUser.availability)
    : [];

  const activeOpportunities = opportunities.filter(
    (opportunity) => opportunity.status?.toLowerCase() === "active",
  );

  const matchingOpportunities = displayAvailability.length > 0
    ? activeOpportunities.filter((opportunity) =>
        isOpportunityInsideAvailability(opportunity, displayAvailability),
      )
    : [];

  const recommendedOpportunities = matchingOpportunities.slice(0, 2);

  const applicationStatuses = volunteerApplications;
  const pendingApplicationsCount = applicationStatuses.filter(
    (application) => application.status === "pending",
  ).length;
  const upcomingApprovedApplications = applicationStatuses.filter(
    (application) =>
      application.status === "approved" &&
      (!application.startAt || new Date(application.startAt) >= new Date()),
  ).sort((firstApplication, secondApplication) =>
    new Date(firstApplication.startAt || 0) - new Date(secondApplication.startAt || 0),
  );
  const nextShift = upcomingApprovedApplications[0];
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
      value: String(pendingApplicationsCount),
      description: "Awaiting review",
      icon: ClipboardList,
      path: "/volunteer-dashboard/opportunities",
    },
    {
      id: "availability-slots",
      label: "Availability Slots",
      availability: displayAvailability,
      icon: CalendarDays,
      path: "/volunteer-dashboard/edit-profile",
    },
  ];

  return (
    <div className="volunteer-homepage">
      <div className="volunteer-homepage-content">
        <div className="volunteer-homepage-header">
          <h1>Welcome back, {authUser?.name || "Volunteer"}</h1>
          <p>
            Track your volunteering progress and find opportunities that match
            your availability.
          </p>
        </div>

        <div className="volunteer-summary-grid">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            if (card.id === "availability-slots") {
              const visibleAvailability = card.availability.slice(
                0,
                availabilitySummaryLimit,
              );
              const hiddenAvailabilityCount = Math.max(
                card.availability.length - availabilitySummaryLimit,
                0,
              );

              return (
                <article
                  className="volunteer-summary-card availability-summary-card"
                  key={card.id}
                >
                  <div className="summary-icon">
                    <Icon size={23} />
                  </div>
                  <div className="summary-content">
                    <span>{card.label}</span>

                    <div className="summary-availability-list">
                      {visibleAvailability.map((slot) => (
                        <p key={`${slot.dayOfWeek}-${slot.startTime}-${slot.endTime}`}>
                          <b>{shortDay(slot.dayOfWeek)}</b>
                          {slot.startTime} - {slot.endTime}
                        </p>
                      ))}
                    </div>

                    <div className="availability-summary-actions">
                      {hiddenAvailabilityCount > 0 && (
                        <button
                          type="button"
                          className="summary-more-button"
                          onClick={() => navigate("/volunteer-dashboard/profile")}
                        >
                          +{hiddenAvailabilityCount} more
                        </button>
                      )}
                      <button
                        type="button"
                        className="summary-edit-button"
                        onClick={() => navigate("/volunteer-dashboard/edit-profile")}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </article>
              );
            }

            return (
              <button
                type="button"
                className="volunteer-summary-card"
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
            ) : displayAvailability.length === 0 ? (
              <p className="homepage-state-message">
                Add your availability to receive matching opportunities.
              </p>
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
                      {opportunityImage && (
                        <img
                          className="homepage-opportunity-image"
                          src={opportunityImage}
                          alt={opportunity.title}
                        />
                      )}

                      <div className="homepage-opportunity-copy">
                        <span className="homepage-category-pill">
                          {opportunity.category?.[0] || "Opportunity"}
                        </span>
                        <h3>{opportunity.title}</h3>
                        <div className="homepage-opportunity-meta">
                          <span>
                            <CalendarDays size={15} />
                            {opportunity.startAt
                              ? formatOpportunityDate(opportunity.startAt)
                              : "Date to be confirmed"}
                          </span>
                          <span>
                            <Clock size={15} />
                            {formatOpportunityTimeRange(
                              opportunity.startAt,
                              opportunity.endAt,
                              "Time to be confirmed",
                            )}
                          </span>
                          {opportunity.location && (
                            <span>
                              <MapPin size={15} />
                              {opportunity.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="homepage-opportunity-view"
                        onClick={() => setSelectedOpportunity(opportunity)}
                      >
                        View
                        <ArrowRight size={16} />
                      </button>
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
                <p>
                  {formatOpportunityTimeRange(
                    nextShift?.startAt,
                    nextShift?.endAt,
                    "Time to be confirmed",
                  )}
                </p>
                {nextShift?.location && (
                  <p className="homepage-location">
                    <MapPin size={14} />
                    {nextShift.location}
                  </p>
                )}
              </div>
              <button type="button" onClick={handleSeeMore}>View Details</button>
            </section>

            <section className="homepage-side-card homepage-status-card">
              <div className="homepage-side-icon">
                <CalendarCheck size={23} />
              </div>
              <div className="homepage-side-content">
                <h3>Application Status</h3>
                {volunteerApplicationsError ? (
                  <p>{volunteerApplicationsError}</p>
                ) : isVolunteerApplicationsLoading ? (
                  <p>Loading applications...</p>
                ) : applicationStatuses.length > 0 ? (
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
                ) : (
                  <p>No applications yet.</p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>

      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
      />
    </div>
  );
};

export default VolunteerHomepage;
