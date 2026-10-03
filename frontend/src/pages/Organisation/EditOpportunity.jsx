import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrganisationStore } from '../../store/useOrganisationStore';
import { malaysiaStateCities, malaysiaStates, EVENT_CATEGORIES } from '../../lib/data';
import { ArrowLeft, Save, X, Calendar, MapPin, Tag, AlignLeft } from 'lucide-react';
import { validateOpportunityDates } from '../../lib/opportunityDates';

const formatDBDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (!Number.isFinite(date.getTime())) return "";
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate.toISOString().slice(0, 16);
};

const getInitialFormData = (opportunity) => ({
    title: opportunity?.title || "",
    details: opportunity?.details || "",
    requirements: opportunity?.requirements || "",
    startAt: formatDBDateForInput(opportunity?.startAt),
    endAt: formatDBDateForInput(opportunity?.endAt),
    maxVolunteers: opportunity?.maxVolunteers || 0,
    applicationDeadline: opportunity?.applicationDeadline
        ? formatDBDateForInput(opportunity.applicationDeadline)
        : "",
    status: opportunity?.status || "active"
});

const getInitialLocation = (opportunity) => {
    if (!opportunity?.location) {
        return { state: "", city: "" };
    }

    const [state, city] = opportunity.location.split(", ");
    return {
        state: state || "",
        city: city || "",
    };
};

const EditOpportunity = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { 
        allMyOpportunities,
        getAllMyOpportunities,
        updateOpportunity,
        isUpdatingOpportunity,
        setCurrentTab,
    } = useOrganisationStore();

    const opportunities = useMemo(() => {
        const raw = allMyOpportunities?.data ?? allMyOpportunities;
        return Array.isArray(raw) ? raw : [];
    }, [allMyOpportunities]);

    const opportunityToEdit = useMemo(
        () => opportunities.find((opp) => opp._id === id),
        [id, opportunities],
    );

    const initialFormData = useMemo(
        () => getInitialFormData(opportunityToEdit),
        [opportunityToEdit],
    );

    const initialLocation = useMemo(
        () => getInitialLocation(opportunityToEdit),
        [opportunityToEdit],
    );

    const initialCategory = useMemo(
        () => opportunityToEdit?.category || [],
        [opportunityToEdit],
    );

    const [formDataOverrides, setFormDataOverrides] = useState({});
    const [selectedStateOverride, setSelectedStateOverride] = useState(null);
    const [selectedCityOverride, setSelectedCityOverride] = useState(null);
    const [selectedCategoryOverride, setSelectedCategoryOverride] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    const formData = {
        ...initialFormData,
        ...formDataOverrides,
    };

    const selectedState = selectedStateOverride ?? initialLocation.state;
    const selectedCity = selectedCityOverride ?? initialLocation.city;
    const selectedCategory = selectedCategoryOverride ?? initialCategory;

    useEffect(() => {
        getAllMyOpportunities();
        setCurrentTab('opportunity');
    }, [getAllMyOpportunities, setCurrentTab]);

    useEffect(() => {
        if (opportunities.length > 0 && !opportunityToEdit) {
            navigate("/organisation-dashboard/opportunities");
        }
    }, [navigate, opportunities.length, opportunityToEdit]);

    const handleChange = (e) => {
        setFormDataOverrides((currentFormData) => ({
            ...currentFormData,
            [e.target.name]: e.target.value,
        }));
        if (fieldErrors[e.target.name]) {
            setFieldErrors(prev => ({ ...prev, [e.target.name]: null}));
        }
    }

    const handleStateChange = (e) => {
        setSelectedStateOverride(e.target.value);
        setSelectedCityOverride("");
        setFieldErrors(prev => ({ ...prev, location: null}));
    };

    const handleCityChange = (e) => {
        setSelectedCityOverride(e.target.value);
        setFieldErrors(prev => ({ ...prev, location: null}));
    };

    const handleCategoryAdd = (e) => {
        const value = e.target.value;
        if (value && !selectedCategory.includes(value)) {
            setSelectedCategoryOverride([...selectedCategory, value]);
        }
    };

    const removeCategory = (catToRemove) => {
        setSelectedCategoryOverride(selectedCategory.filter(c => c !== catToRemove));
    };

    const renderError = (field) => {
        return fieldErrors[field] ? <p className="organisation-error-text">{fieldErrors[field]}</p> : null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setFieldErrors({});

        const newErrors = {};
        if (!formData.title?.trim()) newErrors.title = "Event title is required.";
        if (formData.title?.trim().length > 120) newErrors.title = "Event title must be 120 characters or fewer.";
        if (!formData.details?.trim()) newErrors.details = "Event details are required.";
        if (formData.details?.trim().length > 5000) newErrors.details = "Event details must be 5,000 characters or fewer.";
        if (formData.requirements?.trim().length > 2000) newErrors.requirements = "Requirements must be 2,000 characters or fewer.";
        if (!selectedState || !selectedCity) newErrors.location = "Please select both State and City.";
        if (selectedCategory.length === 0) newErrors.category = "Please select at least one category.";
        if (!formData.startAt) newErrors.startAt = "Start date is required.";
        if (!formData.endAt) newErrors.endAt = "End date is required.";
        if (!formData.applicationDeadline) newErrors.applicationDeadline = "Application deadline is required.";
        if (!Number.isInteger(Number(formData.maxVolunteers)) || Number(formData.maxVolunteers) < 1) {
            newErrors.maxVolunteers = "Volunteer capacity must be a positive integer.";
        }

        const { errors: dateErrors, start, end, deadline } = validateOpportunityDates(formData);
        Object.assign(newErrors, dateErrors);

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            setErrorMessage("Please correct the errors in the form before saving."); 
            return;
        }

        const finalDataToSubmit = {
            title: formData.title,
            details: formData.details,
            requirements: formData.requirements.trim(),
            category: selectedCategory,
            location: `${selectedState}, ${selectedCity}`,
            startAt: start.toISOString(),
            endAt: end.toISOString(),
            maxVolunteers: Number(formData.maxVolunteers),
            applicationDeadline: deadline.toISOString(),
            status: formData.status
        };

        const result = await updateOpportunity(id, finalDataToSubmit);
        if (result?.success) {
            navigate("/organisation-dashboard/opportunities");
        } else {
            const displayError = result?.error || "Failed to update opportunity.";
            setErrorMessage(displayError);
        }
    };

    return (
        <div className="org-profile-page org-profile-edit-page">
            <main className="org-profile-main org-profile-edit-main">
                
                {/* Banner Section */}
                <section className="org-profile-banner org-profile-edit-hero">
                    <div className="org-profile-banner-text">
                        <span className="org-profile-eyebrow">OPPORTUNITY MANAGEMENT</span>
                        <h1>Edit Opportunity Posting</h1>
                        <p>Keep your event details accurate for volunteers.</p>
                    </div>

                    <div className="org-profile-edit-hero-actions">
                        <button type="button" className="org-profile-secondary-btn" onClick={() => navigate("/organisation-dashboard/profile")}>
                            <ArrowLeft size={18} /> Back
                        </button>
                        <button type="submit" form="opportunity-edit-form" className="org-profile-primary-btn" disabled={isUpdatingOpportunity}>
                            <Save size={18} /> {isUpdatingOpportunity ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </section>

                <section className="org-profile-section org-profile-edit-section">
                    
                    {/* Visual Live Preview Summary Card */}
                    <div className="org-profile-card org-profile-header-card org-profile-edit-summary-card">
                        <div className="org-profile-avatar preview-avatar">
                            <Calendar size={24} />
                        </div>
                        <div className="preview-content-wrapper">
                            <span className="org-profile-eyebrow"><b>Live Preview</b></span>
                            
                            <h2 className="preview-title">
                                {formData?.title || "Untitled Opportunity"}
                            </h2>
                            
                            <p className="preview-details">
                                {formData?.details || "No description written yet."}
                            </p>
                            
                            {selectedCategory.length > 0 && (
                                <div className="preview-tags-container">
                                    {selectedCategory.map(cat => (
                                        /* Reusing your existing class here! */
                                        <span key={cat} className="event-category-tag">
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="org-profile-postings-card">
                        <div className="org-profile-card-accent" />
                        <div className="org-profile-card-header">
                            <div>
                                <span className="org-profile-eyebrow"><b>Posting Details</b></span>
                                <h3>Update Information</h3>
                            </div>
                        </div>

                        {errorMessage && <p className="org-profile-edit-error">{errorMessage}</p>}

                        <form id="opportunity-edit-form" onSubmit={handleSubmit} className="org-profile-edit-form" noValidate>
                            <div className="org-profile-edit-input-group">
                                <label><AlignLeft size={16} /> Event Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} maxLength={120} className={fieldErrors.title ? "input-error" : ""} />
                                {renderError("title")}
                            </div>

                            <div className="org-profile-edit-input-group">
                                <label><Tag size={16} /> Event Categories</label>
                                <select className="org-profile-select" onChange={handleCategoryAdd} defaultValue="">
                                    <option value="" disabled>Add a category</option>
                                    {EVENT_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat} disabled={selectedCategory.includes(cat)}>{cat}</option>
                                    ))}
                                </select>
                                <div className="selected-category-tags">
                                    {selectedCategory.map(cat => (
                                        <span key={cat} className="category-tag-badge">
                                            {cat} 
                                            <button type="button" onClick={() => removeCategory(cat)} className="remove-tag-btn">
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                {renderError("category")}
                            </div>

                            <div className="org-profile-edit-input-group">
                                <label><AlignLeft size={16} /> Event Details</label>
                                <textarea name="details" value={formData.details} onChange={handleChange} rows="6" maxLength={5000} className={fieldErrors.details ? "input-error" : ""} />
                                {renderError("details")}
                            </div>

                            <div className="org-profile-edit-input-group">
                                <label><AlignLeft size={16} /> Requirements (optional)</label>
                                <textarea name="requirements" value={formData.requirements} onChange={handleChange} rows="4" maxLength={2000} placeholder="List useful skills, equipment, or preparation volunteers should have" className={fieldErrors.requirements ? "input-error" : ""} />
                                {renderError("requirements")}
                            </div>

                            <div className="org-profile-edit-input-group">
                                <label><MapPin size={16} /> Location</label>
                                <div className="org-profile-edit-row">
                                    <select value={selectedState} onChange={handleStateChange} className="org-profile-select">
                                        <option value="" disabled>Select State</option>
                                        {malaysiaStates.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <select value={selectedCity} onChange={handleCityChange} disabled={!selectedState} className="org-profile-select">
                                        <option value="" disabled>Select City</option>
                                        {selectedState && malaysiaStateCities[selectedState]?.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                {renderError("location")}
                            </div>

                            <div className="org-profile-edit-input-group">
                                <label>
                                    <Tag size={16} /> Event Status
                                </label>
                                <select 
                                    name="status"
                                    className="org-profile-select" 
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="active">Active (Visible to volunteers)</option>
                                    <option value="closed">Closed (Stop accepting volunteers)</option>
                                    <option value="cancelled">Cancelled (Event will not happen)</option>
                                    <option value="completed">Completed (Event is finished)</option>
                                </select>
                            </div>

                            <div className="org-profile-edit-input-group">
                                <label>Volunteer Capacity</label>
                                <input type="number" name="maxVolunteers" min="1" step="1" value={formData.maxVolunteers} onChange={handleChange} className={fieldErrors.maxVolunteers ? "input-error" : ""} />
                                {renderError("maxVolunteers")}
                            </div>

                            <div className="org-profile-edit-input-group">
                                <label>Application Deadline</label>
                                <input type="datetime-local" name="applicationDeadline" max={formData.startAt || undefined} value={formData.applicationDeadline} onChange={handleChange} className={fieldErrors.applicationDeadline ? "input-error" : ""} />
                                <p className="organisation-form-hint">The application deadline must be earlier than the start date and time.</p>
                                {renderError("applicationDeadline")}
                            </div>

                            <div className="org-profile-edit-row">
                                <div className="org-profile-edit-input-group" style={{ flex: 1 }}>
                                    <label>Start Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        name="startAt"
                                        value={formData.startAt}
                                        onChange={handleChange}
                                        className={fieldErrors.startAt ? "input-error" : ""}
                                    />
                                    {renderError("startAt")}
                                </div>
                                <div className="org-profile-edit-input-group" style={{ flex: 1 }}>
                                    <label>End Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        name="endAt"
                                        min={formData.startAt || undefined}
                                        value={formData.endAt}
                                        onChange={handleChange}
                                        className={fieldErrors.endAt ? "input-error" : ""}
                                    />
                                    {renderError("endAt")}
                                </div>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default EditOpportunity;
