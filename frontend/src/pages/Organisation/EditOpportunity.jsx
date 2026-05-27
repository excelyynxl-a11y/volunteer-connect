import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrganisationStore } from '../../store/useOrganisationStore';
import { malaysiaStateCities, malaysiaStates, EVENT_CATEGORIES } from '../../lib/data';
import { ArrowLeft, Save, X, Calendar, MapPin, Tag, AlignLeft } from 'lucide-react';

const EditOpportunity = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // State to prevent rendering before data arrives
    const [isLoaded, setIsLoaded] = useState(false);
    
    const { 
        allMyOpportunities, getAllMyOpportunities, updateOpportunity, setCurrentTab
    } = useOrganisationStore();

    const [formData, setFormData] = useState({
        title: "",
        details: "",
        startAt: "",
        endAt: "",
        maxVolunteers: 0,
        applicationDeadline: "",
        status: "active"
    });
    
    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        getAllMyOpportunities();
        setCurrentTab('opportunity');
    }, []);

    useEffect(() => {
        const raw = allMyOpportunities?.data ?? allMyOpportunities;
        const list = Array.isArray(raw) ? raw : [];

        if (list.length === 0) return;

        const opportunityToEdit = list.find(opp => opp._id === id);

        if (opportunityToEdit) {
            setFormData({
                title: opportunityToEdit.title || "",
                details: opportunityToEdit.details || opportunityToEdit.detail || "",
                startAt: formatDBDateForInput(opportunityToEdit.startAt),
                endAt: formatDBDateForInput(opportunityToEdit.endAt),
                maxVolunteers: opportunityToEdit.maxVolunteers || 0,
                applicationDeadline: opportunityToEdit.applicationDeadline
                    ? formatDBDateForInput(opportunityToEdit.applicationDeadline) 
                    : "",
                status: opportunityToEdit.status || "active"
            });
            
            setSelectedCategory(opportunityToEdit.category || []);
            
            if (opportunityToEdit.location) {
                const [dbState, dbCity] = opportunityToEdit.location.split(", ");
                setSelectedState(dbState || "");
                setSelectedCity(dbCity || "");
            }
            setIsLoaded(true);
        } else {
            navigate("/organisation-dashboard/opportunities");
        }
    }, [id, allMyOpportunities, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value});
        if (fieldErrors[e.target.name]) {
            setFieldErrors(prev => ({ ...prev, [e.target.name]: null}));
        }
    }

    const handleStateChange = (e) => {
        setSelectedState(e.target.value);
        setSelectedCity("");
        setFieldErrors(prev => ({ ...prev, location: null}));
    };

    const handleCityChange = (e) => {
        setSelectedCity(e.target.value);
        setFieldErrors(prev => ({ ...prev, location: null}));
    };

    const handleCategoryAdd = (e) => {
        const value = e.target.value;
        if (value && !selectedCategory.includes(value)) {
            setSelectedCategory(prev => [...prev, value]);
        }
    };

    const removeCategory = (catToRemove) => {
        setSelectedCategory(selectedCategory.filter(c => c !== catToRemove));
    };

    const formatForInput = (isoString) => isoString ? isoString.substring(0, 16) : "";

    const formatDBDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        return localDate.toISOString().slice(0, 16);
    };

    const renderError = (field) => {
        return fieldErrors[field] ? <p className="organisation-error-text">{fieldErrors[field]}</p> : null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setFieldErrors({});
        const validStatuses = ["active", "closed", "cancelled", "completed"];

        const newErrors = {};
        if (!formData.title?.trim()) newErrors.title = "Event title is required.";
        if (!formData.details?.trim()) newErrors.details = "Event details are required.";
        if (!selectedState || !selectedCity) newErrors.location = "Please select both State and City.";
        if (selectedCategory.length === 0) newErrors.category = "Please select at least one category.";
        if (!formData.startAt) newErrors.startAt = "Start date is required.";
        if (!formData.endAt) newErrors.endAt = "End date is required.";

        if (formData.startAt && formData.endAt) {
            const startDate = new Date(formData.startAt);
            const endDate = new Date(formData.endAt);
            if (endDate <= startDate) {
                newErrors.endAt = "End date/time must be after the start date/time.";
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            setErrorMessage("Please correct the errors in the form before saving."); 
            return;
        }

        const finalDataToSubmit = {
            title: formData.title,
            details: formData.details,
            category: selectedCategory,
            location: `${selectedState}, ${selectedCity}`,
            startAt: new Date(formData.startAt).toISOString(),
            endAt: new Date(formData.endAt).toISOString(),
            maxVolunteers: Number(formData.maxVolunteers),
            applicationDeadline: formData.applicationDeadline
                ? new Date(formData.applicationDeadline).toISOString() 
                : new Date(formData.startAt).toISOString(),
            status: formData.status
        };

        const result = await updateOpportunity(id, finalDataToSubmit);
        if (result?.success) {
            navigate("/organisation-dashboard/profile");
        } else {
            const displayError = result?.error === "validStatuses is not defined" 
                ? "Server configuration error. Please contact the administrator." 
                : (result?.error || "Failed to update opportunity.");
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
                                <textarea name="details" value={formData.details} onChange={handleChange} rows="6" className={fieldErrors.details ? "input-error" : ""} />
                                {renderError("details")}
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
