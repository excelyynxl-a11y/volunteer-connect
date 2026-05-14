import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Info, Save } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore.js";
import { axiosInstance } from "../../lib/axios";
import { getInitials } from "../../lib/utils.js";
import "./OrganisationProfile.css";
import "./EditOrganisationProfile.css";

const EditOrganisationProfile = () => {
    const navigate = useNavigate();
    const { authUser, setAuthUser } = useAuthStore();

    const [formData, setFormData] = useState({
        name: authUser?.name || "",
        biodata: authUser?.biodata || "",
    });
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        setFormData({
            name: authUser?.name || "",
            biodata: authUser?.biodata || "",
        });
    }, [authUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setErrorMessage("");

        try {
            const response = await axiosInstance.put("/organisation/profile", formData);

            if (response.status === 200) {
                setAuthUser(response.data);
                navigate("/organisation-dashboard/profile");
            }
        } catch (error) {
            console.error("Update failed:", error.response?.data || error.message);
            setErrorMessage("Failed to update profile. Please check the details and try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="org-container org-edit-container">
            <main className="org-main org-edit-main">
                <section className="welcome-banner org-edit-hero">
                    <div className="banner-text">
                        <span className="eyebrow-red">ORGANISATION PROFILE</span>
                        <h1>Edit organisation profile</h1>
                        <p>
                            Keep your public organisation details clear and current for volunteers.
                        </p>
                    </div>

                    <div className="org-edit-hero-actions">
                        <button
                            type="button"
                            className="btn-secondary-org org-edit-back-btn"
                            onClick={() => navigate("/organisation-dashboard/profile")}
                        >
                            <ArrowLeft size={18} />
                            Back
                        </button>
                        <button
                            type="submit"
                            form="organisation-edit-form"
                            className="btn-primary-org"
                            disabled={isSaving}
                        >
                            <Save size={18} />
                            {isSaving ? "Saving..." : "Save Profile"}
                        </button>
                    </div>
                </section>

                <section className="organisation-profile-section org-edit-section">
                    <div className="profile-card profile-header-card org-edit-summary-card">
                        <div className="profile-avatar">
                            {getInitials(formData.name || authUser?.name || "Organisation")}
                        </div>
                        <div>
                            <span className="profile-eyebrow">
                                <b>Editing Profile</b>
                            </span>
                            <h2>{formData.name || "Organisation name"}</h2>
                            <p>{formData.biodata || "No description provided yet."}</p>
                        </div>
                    </div>

                    <div className="profile-card org-edit-form-card">
                        <div className="card-accent" />
                        <div className="org-edit-card-header">
                            <div>
                                <span className="profile-eyebrow">
                                    <b>Profile Details</b>
                                </span>
                                <h3>Organisation information</h3>
                            </div>
                        </div>

                        {errorMessage && (
                            <p className="org-edit-error">{errorMessage}</p>
                        )}

                        <form
                            id="organisation-edit-form"
                            onSubmit={handleSave}
                            className="org-edit-form"
                        >
                            <div className="org-edit-input-group">
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
                            </div>

                            <div className="org-edit-input-group">
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
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default EditOrganisationProfile;
