import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Info, Save } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore.js";
import { useOrganisationStore } from "../../store/useOrganisationStore.js";
import { getInitials } from "../../lib/utils.js";

const EditOrganisationProfile = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { updateOrganisationProfile, isUpdatingOrganisationProfile } =
    useOrganisationStore();

  const [formData, setFormData] = useState({
    name: authUser?.name || "",
    biodata: authUser?.biodata || "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const renderError = (field) => {
    return fieldErrors[field] ? (
      <p className="organisation-error-text">{fieldErrors[field]}</p>
    ) : null
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setFieldErrors({});

    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Organisation name is required.";
    }
    if (!formData.biodata.trim()) {
      newErrors.biodata = "About Us / Biodata is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setErrorMessage("Please correct the errors in the form before saving.");
      return;
    }

    const result = await updateOrganisationProfile({
      name: formData.name,
      biodata: formData.biodata,
    });

    if (result.success) {
      navigate("/organisation-dashboard/profile");
      return;
    }

    setErrorMessage(
      result.error ||
        "Failed to update profile. Please check the details and try again.",
    );
  };

  return (
    <div className="org-profile-page org-profile-edit-page">
      <main className="org-profile-main org-profile-edit-main">
        <section className="org-profile-banner org-profile-edit-hero">
          <div className="org-profile-banner-text">
            <span className="org-profile-eyebrow">ORGANISATION PROFILE</span>
            <h1>Edit organisation profile</h1>
            <p>
              Keep your public organisation details clear and current for
              volunteers.
            </p>
          </div>

          <div className="org-profile-edit-hero-actions">
            <button
              type="button"
              className="org-profile-secondary-btn org-profile-edit-back-btn"
              onClick={() => navigate("/organisation-dashboard/profile")}
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <button
              type="submit"
              form="organisation-edit-form"
              className="org-profile-primary-btn"
              disabled={isUpdatingOrganisationProfile}
            >
              <Save size={18} />
              {isUpdatingOrganisationProfile ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </section>

        <section className="org-profile-section org-profile-edit-section">
          <div className="org-profile-card org-profile-header-card org-profile-edit-summary-card">
            <div className="org-profile-avatar">
              {getInitials(formData.name || authUser?.name || "Organisation")}
            </div>
            <div>
              <span className="org-profile-eyebrow">
                <b>Editing Profile</b>
              </span>
              <h2>{formData.name || "Organisation name"}</h2>
              <p>{formData.biodata || "No description provided yet."}</p>
            </div>
          </div>

          <div className="org-profile-postings-card">
            <div className="org-profile-card-accent" />
            <div className="org-profile-edit-card-header">
              <div>
                <span className="org-profile-eyebrow">
                  <b>Profile Details</b>
                </span>
                <h3>Organisation information</h3>
              </div>
            </div>

            {errorMessage && (
              <p className="org-profile-edit-error">{errorMessage}</p>
            )}

            <form
              id="organisation-edit-form"
              onSubmit={handleSave}
              className="org-profile-edit-form"
              noValidate
            >
              <div className="org-profile-edit-input-group">
                <label htmlFor="organisation-name">
                  <Building2 size={16} />
                  Organisation Name
                </label>
                <input
                  id="organisation-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter organisation name"
                  required
                />
                {renderError("name")}
              </div>

              <div className="org-profile-edit-input-group">
                <label htmlFor="organisation-biodata">
                  <Info size={16} />
                  About Us / Biodata
                </label>
                <textarea
                  id="organisation-biodata"
                  name="biodata"
                  value={formData.biodata}
                  onChange={handleChange}
                  placeholder="Describe your mission..."
                  rows="7"
                />
                {renderError("biodata")}
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EditOrganisationProfile;
