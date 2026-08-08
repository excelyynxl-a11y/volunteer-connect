import { useEffect, useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import BackButton from "../../components/BackButton";
import { getInitials } from "../../lib/utils";
import { useFollowStore } from "../../store/useFollowStore";
import { useVolunteerStore } from "../../store/useVolunteerStore";
import "./PublicOrganisationProfile.css";

const PublicOrganisationProfile = () => {
  const { organisationId } = useParams();
  const navigate = useNavigate();
  const [failedAvatar, setFailedAvatar] = useState("");
  const {
    getPublicOrganisationProfile,
    isPublicOrganisationProfileLoading,
    publicOrganisationProfile,
    publicOrganisationProfileError,
  } = useVolunteerStore();
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

  const handleFollowClick = async () => {
    if (isFollowing) {
      await unfollowOrganisation(organisationId);
      return;
    }

    await followOrganisation(organisationId);
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
    </div>
  );
};

export default PublicOrganisationProfile;
