import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Edit3,
  FileText,
  MapPin,
  Tag,
  Users,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useOrganisationStore } from "../../store/useOrganisationStore";
import {
  formatOpportunityDate,
  formatOpportunityTimeRange,
  getRequirementItems,
  getSpotsRemaining,
} from "../../lib/opportunity";
import "../../components/OpportunityCard.css";

const getStatusClass = (status = "active") =>
  status.toLowerCase().replace(/\s+/g, "-");

const getOpportunityList = (allMyOpportunities) => {
  const raw = allMyOpportunities?.data ?? allMyOpportunities;
  return Array.isArray(raw) ? raw : [];
};

const DetailItem = ({ icon, label, value }) => (
  <div className="org-view-detail-card">
    <div className="org-view-detail-icon">
        {React.createElement(icon, { size: 20 })}
    </div>
    <div className="org-view-detail-body">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  </div>
);

const ViewOpportunity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCurrentTab, getAllMyOpportunities, allMyOpportunities } =
    useOrganisationStore();
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadOpportunities = async () => {
      await getAllMyOpportunities();

      if (isMounted) {
        setHasLoaded(true);
      }
    };

    setCurrentTab("opportunity");
    loadOpportunities();

    return () => {
      isMounted = false;
    };
  }, [getAllMyOpportunities, setCurrentTab]);

  const opportunities = useMemo(
    () => getOpportunityList(allMyOpportunities),
    [allMyOpportunities],
  );

  const opportunity = useMemo(
    () => opportunities.find((item) => item._id === id),
    [id, opportunities],
  );

  const status = opportunity?.status || "active";
  const statusClass = getStatusClass(status);
  const categories = Array.isArray(opportunity?.category)
    ? opportunity.category
    : [];
  const requirements = getRequirementItems(opportunity?.requirements || "");
  const spotsRemaining = getSpotsRemaining(opportunity);
  const timeRange = formatOpportunityTimeRange(
    opportunity?.startAt,
    opportunity?.endAt,
  );

  if (!hasLoaded && !opportunity) {
    return (
      <div className="org-profile-page">
        <main className="org-profile-main org-profile-edit-main">
          <section className="org-profile-card">
            <p className="org-profile-empty-text">Loading posting details...</p>
          </section>
        </main>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="org-profile-page">
        <main className="org-profile-main org-profile-edit-main">
          <section className="org-profile-banner org-profile-edit-hero">
            <div className="org-profile-banner-text">
              <span className="org-profile-eyebrow">OPPORTUNITY MANAGEMENT</span>
              <h1>Posting not found</h1>
              <p>This opportunity may have been removed or is no longer available.</p>
            </div>
            <button
              type="button"
              className="org-profile-secondary-btn"
              onClick={() => navigate("/organisation-dashboard/opportunities")}
            >
              <ArrowLeft size={18} /> Back to Opportunities
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="org-profile-page">
      <main className="org-profile-main org-profile-edit-main">
        <section className="org-profile-banner org-profile-edit-hero">
          <div className="org-profile-banner-text">
            <span className="org-profile-eyebrow">OPPORTUNITY MANAGEMENT</span>
            <h1>{opportunity.title}</h1>
            <p>{opportunity.details}</p>
          </div>

          <div className="org-profile-edit-hero-actions">
            <button
              type="button"
              className="org-profile-secondary-btn"
              onClick={() => navigate("/organisation-dashboard/opportunities")}
            >
              <ArrowLeft size={18} /> Back
            </button>
            <button
              type="button"
              className="org-profile-primary-btn"
              onClick={() =>
                navigate(`/organisation-dashboard/edit-opportunity/${id}`)
              }
            >
              <Edit3 size={18} /> Edit Posting
            </button>
          </div>
        </section>

        <section className="org-profile-section org-view-section">
          <div className="org-profile-postings-card org-view-overview-card">
            <div className="org-profile-card-accent" />
            <div className="org-profile-card-header">
              <div>
                <span className="org-profile-eyebrow">
                  <b>Posting Overview</b>
                </span>
                <h3>Opportunity Details</h3>
              </div>
              <span className={`event-tag status-${statusClass}`}>{status}</span>
            </div>

            <div className="selected-category-tags org-view-category-row">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <span key={category} className="event-category-tag">
                    {category}
                  </span>
                ))
              ) : (
                <span className="org-profile-empty-text">No categories listed.</span>
              )}
            </div>

            <div className="org-view-detail-grid">
              <DetailItem
                icon={MapPin}
                label="Location"
                value={opportunity.location || "Location unavailable"}
              />
              <DetailItem
                icon={CalendarDays}
                label="Start Date"
                value={formatOpportunityDate(opportunity.startAt)}
              />
              <DetailItem
                icon={Clock3}
                label="Time"
                value={timeRange || "Time unavailable"}
              />
              <DetailItem
                icon={CalendarDays}
                label="Application Deadline"
                value={formatOpportunityDate(opportunity.applicationDeadline)}
              />
              <DetailItem
                icon={Users}
                label="Capacity"
                value={`${opportunity.approvedVolunteersCount || 0} approved / ${
                  opportunity.maxVolunteers || 0
                } maximum`}
              />
              <DetailItem
                icon={Tag}
                label="Spots Remaining"
                value={`${spotsRemaining} spots left`}
              />
            </div>
          </div>

          <div className="org-profile-card">
            <div className="org-profile-card-accent" />
            <h4>
              <b>Description</b>
            </h4>
            <p>{opportunity.details}</p>
          </div>

          <div className="org-profile-card">
            <div className="org-profile-card-accent" />
            <h4>
              <b>Requirements</b>
            </h4>
            {requirements.length > 0 ? (
              <div className="org-view-requirement-tags">
                {requirements.map((requirement) => (
                  <span key={requirement} className="org-view-requirement-tag">
                    <FileText size={16} />
                    {requirement}
                  </span>
                ))}
              </div>
            ) : (
              <p className="org-profile-empty-text">No specific requirements listed.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ViewOpportunity;
