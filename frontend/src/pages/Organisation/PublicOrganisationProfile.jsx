import { useEffect } from "react";
import { Heart } from "lucide-react";
import { useParams } from "react-router-dom";

import { getInitials } from "../../lib/utils";
import { useFollowStore } from "../../store/useFollowStore";
import { useVolunteerStore } from "../../store/useVolunteerStore";
import "./PublicOrganisationProfile.css";

const PublicOrganisationProfile = () => {
  const { organisationId } = useParams();
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

  if (isPublicOrganisationProfileLoading) {
    return (
      <div className="public-org-profile-state" role="status">
        Loading organisation profile...
      </div>
    );
  }

  if (publicOrganisationProfileError || !publicOrganisationProfile) {
    return (
      <div className="public-org-profile-state error" role="alert">
        {publicOrganisationProfileError ||
          "Organisation profile is unavailable."}
      </div>
    );
  }

  const { avatar, biodata, name } = publicOrganisationProfile;

  return (
    <div className="public-org-profile">
      <section className="public-org-hero">
        <div className="public-org-avatar">
          {avatar ? (
            <img src={avatar} alt={`${name || "Organisation"} avatar`} />
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
