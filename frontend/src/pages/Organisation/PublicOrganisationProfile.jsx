import { useEffect, useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import BackButton from "../../components/BackButton";
import ConfirmApplicationModal from "../../components/ConfirmApplicationModal";
import OpportunityCard from "../../components/OpportunityCard";
import OpportunityDetailModal from "../../components/OpportunityDetailModal";
import { getInitials } from "../../lib/utils";
import { useApplicationStore } from "../../store/useApplicationStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useFollowStore } from "../../store/useFollowStore";
import { useVolunteerStore } from "../../store/useVolunteerStore";
import "./PublicOrganisationProfile.css";

const PublicOrganisationProfile = () => {
  const { organisationId } = useParams();
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.authUser);
  const [failedAvatar, setFailedAvatar] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [applyingOpportunity, setApplyingOpportunity] = useState(null);
  const {
    getPublicOrganisationProfile,
    getAllOpportunities,
    isPublicOrganisationProfileLoading,
    isOpportunitiesLoading,
    opportunities,
    opportunitiesError,
    publicOrganisationProfile,
    publicOrganisationProfileError,
  } = useVolunteerStore();
  const {
    applications,
    createApplication,
    getMyApplications,
    isSubmittingApplication,
  } = useApplicationStore();
  const {
    followError,
    followOrganisation,
    getFollowStatus,
    isFollowing,
    isFollowLoading,
    unfollowOrganisation,
  } = useFollowStore();

  useEffect(() => {
    getPublicOrganisationProfile(organisationId);
    getFollowStatus(organisationId);
  }, [getFollowStatus, getPublicOrganisationProfile, organisationId]);

  useEffect(() => {
    getAllOpportunities();
    getMyApplications();
  }, [getAllOpportunities, getMyApplications]);

  const organisationOpportunities = opportunities.filter((opportunity) => {
    const opportunityOrganisationId =
      opportunity.organisationId?._id ?? opportunity.organisationId;

    return (
      String(opportunityOrganisationId) === organisationId &&
      opportunity.status?.toLowerCase() === "active"
    );
  });

  const applicationStatusByOpportunity = applications.reduce(
    (statusMap, application) => {
      const opportunityId =
        application.opportunityId?._id ?? application.opportunityId;

      if (opportunityId) {
        statusMap[opportunityId] = application.status;
      }

      return statusMap;
    },
    {},
  );

  const volunteerAvailability = Array.isArray(authUser?.availability)
    ? authUser.availability
    : [];

  const handleFollowClick = async () => {
    if (isFollowing) {
      await unfollowOrganisation(organisationId);
      return;
    }

    await followOrganisation(organisationId);
  };

  const handleConfirmApply = async () => {
    if (!applyingOpportunity) return;

    try {
      await createApplication(applyingOpportunity._id);
      await getMyApplications();
      setApplyingOpportunity(null);
    } catch (error) {
      console.error("Failed to submit application:", error);
    }
  };

  const backControl = (
    <BackButton fallbackPath="/volunteer-dashboard/organisations" />
  );

  if (isPublicOrganisationProfileLoading) {
    return (
      <div className="public-org-profile">
        <div className="public-org-profile-state">
          {backControl}
          <p role="status">Loading organisation profile...</p>
        </div>
      </div>
    );
  }

  if (publicOrganisationProfileError || !publicOrganisationProfile) {
    return (
      <div className="public-org-profile">
        <div className="public-org-profile-state error">
          {backControl}
          <p role="alert">
            {publicOrganisationProfileError ||
              "Organisation profile is unavailable."}
          </p>
        </div>
      </div>
    );
  }

  const { avatar, biodata, name } = publicOrganisationProfile;

  const handleMessageClick = () => {
    const searchParams = new URLSearchParams({
      organisationId,
      organisationName: name || "Organisation",
    });
    navigate(`/volunteer-dashboard/messages?${searchParams.toString()}`);
  };

  return (
    <div className="public-org-profile">
      <section className="public-org-hero">
        <div className="public-org-back">{backControl}</div>

        <div className="public-org-avatar">
          {avatar && avatar !== failedAvatar ? (
            <img
              src={avatar}
              alt={`${name || "Organisation"} avatar`}
              onError={() => setFailedAvatar(avatar)}
            />
          ) : (
            <span aria-hidden="true">{getInitials(name)}</span>
          )}
        </div>

        <div className="public-org-introduction">
          <p className="public-org-eyebrow">
            Public Organisation Profile
          </p>

          <h1>{name || "Organisation"}</h1>

          <p>
            {biodata || "No organisation description has been provided."}
          </p>
        </div>

        <div className="public-org-actions">
          <button
            type="button"
            className="public-org-message-button"
            onClick={handleMessageClick}
          >
            <MessageCircle size={18} />
            Send Message
          </button>
          <button
            type="button"
            className={`public-org-follow-button${isFollowing ? " following" : ""}`}
            onClick={handleFollowClick}
            disabled={isFollowLoading}
          >
            <Heart size={18} fill={isFollowing ? "currentColor" : "none"} />
            {isFollowLoading
              ? "Updating..."
              : isFollowing
                ? "Following"
                : "Follow"}
          </button>
        </div>
      </section>

      {followError && (
        <p className="public-org-follow-error" role="alert">
          {followError}
        </p>
      )}

      <section
        className="public-org-opportunities"
        aria-labelledby="public-org-opportunities-title"
      >
        <div className="public-org-opportunities-header">
          <p>VOLUNTEER OPPORTUNITIES</p>
          <h2 id="public-org-opportunities-title">Current opportunities</h2>
          <span>
            Explore active opportunities offered by {name || "this organisation"}.
          </span>
        </div>

        {opportunitiesError ? (
          <p className="public-org-opportunities-state" role="alert">
            {opportunitiesError}
          </p>
        ) : isOpportunitiesLoading ? (
          <p className="public-org-opportunities-state" role="status">
            Loading opportunities...
          </p>
        ) : organisationOpportunities.length > 0 ? (
          <div className="public-org-opportunities-grid">
            {organisationOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity._id}
                opportunity={opportunity}
                variant="volunteer"
                actions={["view"]}
                showStatus={false}
                applicationStatus={applicationStatusByOpportunity[opportunity._id]}
                onAction={(action) => {
                  if (action === "view") {
                    setSelectedOpportunity(opportunity);
                  } else if (action === "apply") {
                    setApplyingOpportunity(opportunity);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <p className="public-org-opportunities-state">
            This organisation has no active opportunities right now.
          </p>
        )}
      </section>

      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
        onAction={(action) => {
          if (action === "apply") {
            setApplyingOpportunity(selectedOpportunity);
          } else if (action === "view-organisation") {
            setSelectedOpportunity(null);
          }
        }}
        volunteerAvailability={volunteerAvailability}
        applicationStatus={
          applicationStatusByOpportunity[selectedOpportunity?._id]
        }
      />

      <ConfirmApplicationModal
        opportunity={applyingOpportunity}
        volunteerAvailability={volunteerAvailability}
        onCancel={() => setApplyingOpportunity(null)}
        onConfirm={handleConfirmApply}
        isSubmitting={isSubmittingApplication}
      />
    </div>
  );
};

export default PublicOrganisationProfile;
