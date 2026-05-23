import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrganisationStore } from '../../store/useOrganisationStore';
import { malaysiaStateCities, malaysiaStates } from '../../lib/data';
import { ArrowLeft, Save, X, Calendar, MapPin, Tag, AlignLeft } from 'lucide-react';
import { EVENT_CATEGORIES } from '../../lib/data';

const EditOpportunity = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const { 
        activeOpportunities, 
        closedOpportunities, 
        cancelledOpportunities,
        updateOpportunity, 
        isUpdatingOpportunity,
        getActiveOpportunities,
        getClosedOpportunities,
        getCancelledOpportunities
    } = useOrganisationStore();

    const [formData, setFormData] = useState({
        title: "",
        details: "",
        startAt: "",
        endAt: ""
    });
    
    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!activeOpportunities?.length) getActiveOpportunities();
        if (!closedOpportunities?.length) getClosedOpportunities();
        if (!cancelledOpportunities?.length) getCancelledOpportunities();
    }, []);

    useEffect(() => {
        const allCombined = [
            ...(activeOpportunities || []),
            ...(closedOpportunities || []),
            ...(cancelledOpportunities || [])
        ];

        if (allCombined.length === 0) return;

        const opportunityToEdit = allCombined.find(opp => opp._id === id);

        if (opportunityToEdit) {
            setFormData({
                title: opportunityToEdit.title || "",
                details: opportunityToEdit.details || opportunityToEdit.detail || "",
                startAt: opportunityToEdit.startAt || "",
                endAt: opportunityToEdit.endAt || ""
            });
            setSelectedCategory(opportunityToEdit.category || []);
            
            if (opportunityToEdit.location) {
                const [dbState, dbCity] = opportunityToEdit.location.split(", ");
                setSelectedState(dbState || "");
                setSelectedCity(dbCity || "");
            }
            setIsLoaded(true);
        } else {
            navigate("/organisation-dashboard/profile");
        }
    }, [id, activeOpportunities, closedOpportunities, cancelledOpportunities, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleStateChange = (e) => {
        setSelectedState(e.target.value);
        setSelectedCity("");
        setErrorMessage("");
    };

    const handleCityChange = (e) => {
        setSelectedCity(e.target.value);
        setErrorMessage("");
    };

    const handleCategoryAdd = (e) => {
        const value = e.target.value;
        if (value && !selectedCategory.includes(value)) {
            setSelectedCategory([...selectedCategory, value]);
        }
        e.target.value = "";
    };

    const removeCategory = (catToRemove) => {
        setSelectedCategory(selectedCategory.filter(c => c !== catToRemove));
    };

    const formatForInput = (isoString) => {
        if (!isoString) return "";
        return isoString.substring(0, 16);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (!selectedState) return setErrorMessage("Please select a State.");
        if (!selectedCity) return setErrorMessage("Please select a City.");

        const validCitiesForState = malaysiaStateCities[selectedState];
        if (!validCitiesForState || !validCitiesForState.includes(selectedCity)) {
            return setErrorMessage("System Error: The selected city does not match the selected state.");
        }

        const finalDataToSubmit = {
            ...formData,
            location: `${selectedState}, ${selectedCity}`,
            category: selectedCategory
        };

        const result = await updateOpportunity(id, finalDataToSubmit);

        if (result?.success) {
            navigate("/organisation-dashboard/profile");
            return;
        }

        setErrorMessage(
            result?.error || "Failed to update opportunity. Please check the details and try again."
        );
    };

    if (!isLoaded) {
        return (
            <div className="org-profile-page org-profile-edit-page">
                <main className="org-profile-main org-profile-edit-main" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                    <p style={{ fontSize: '16px', color: '#64748b', fontWeight: 500 }}>Loading posting details...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="org-profile-page org-profile-edit-page">
            <main className="org-profile-main org-profile-edit-main">
                
                {/* Banner Section */}
                <section className="org-profile-banner org-profile-edit-hero">
                    <div className="org-profile-banner-text">
                        <span className="org-profile-eyebrow">OPPORTUNITY MANAGEMENT</span>
                        <h1>Edit Opportunity Posting</h1>
                        <p>
                            Keep your event details, location and schedule accurate so volunteers know exactly what to expect.
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
                            form="opportunity-edit-form"
                            className="org-profile-primary-btn"
                            disabled={isUpdatingOpportunity}
                        >
                            <Save size={18} />
                            {isUpdatingOpportunity ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </section>

                <section className="org-profile-section org-profile-edit-section">
                    
                    {/* Visual Live Preview Summary Card */}
                    <div className="org-profile-card org-profile-header-card org-profile-edit-summary-card">
                        <div className="org-profile-avatar" style={{ borderRadius: '12px', background: '#f1f5f9', color: '#0f172a' }}>
                            <Calendar size={24} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <span className="org-profile-eyebrow"><b>Live Preview</b></span>
                            <h2 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {formData.title || "Untitled Opportunity"}
                            </h2>
                            <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {formData.details || "No description written yet."}
                            </p>
                        </div>
                    </div>

                    {/* Main Form Fields Card */}
                    <div className="org-profile-card org-profile-edit-form-card">
                        <div className="org-profile-card-accent" />
                        <div className="org-profile-edit-card-header">
                            <div>
                                <span className="org-profile-eyebrow"><b>Posting Details</b></span>
                                <h3>Update Information</h3>
                            </div>
                        </div>

                        {errorMessage && (
                            <p className="org-profile-edit-error" style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', margin: '0 0 20px 0', fontWeight: 500 }}>
                                {errorMessage}
                            </p>
                        )}

                        <form
                            id="opportunity-edit-form"
                            onSubmit={handleSubmit}
                            className="org-profile-edit-form"
                        >
                            {/* Input: Title */}
                            <div className="org-profile-edit-input-group">
                                <label htmlFor="event-title">
                                    <AlignLeft size={16} /> Event Title
                                </label>
                                <input
                                    id="event-title"
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Community Tech Center Open Day Support"
                                    maxLength={120}
                                    required
                                />
                            </div>

                            {/* Input: Categories Tag Selection */}
                            <div className="org-profile-edit-input-group">
                                <label htmlFor="event-categories">
                                    <Tag size={16} /> Event Categories
                                </label>
                                <select 
                                    id="event-categories"
                                    className="org-profile-select" 
                                    onChange={handleCategoryAdd}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Add a category</option>
                                    {EVENT_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat} disabled={selectedCategory.includes(cat)}>
                                            {cat} {selectedCategory.includes(cat) ? "(Selected)" : ""}
                                        </option>
                                    ))}
                                </select>
                                
                                {selectedCategory.length > 0 && (
                                    <div className="selected-category-tags" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                                        {selectedCategory.map(cat => (
                                            <span key={cat} className="category-tag-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                                                {cat}
                                                <button type="button" onClick={() => removeCategory(cat)} className="remove-tag-btn" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Input: Details */}
                            <div className="org-profile-edit-input-group">
                                <label htmlFor="event-details">
                                    <AlignLeft size={16} /> Event Details / Requirements
                                </label>
                                <textarea
                                    id="event-details"
                                    name="details"
                                    value={formData.details}
                                    onChange={handleChange}
                                    placeholder="Provide clear descriptions and volunteer expectations..."
                                    maxLength={5000}
                                    rows="6"
                                    required
                                />
                            </div>

                            {/* Input: State & City Dropdowns */}
                            <div className="org-profile-edit-input-group">
                                <label><MapPin size={16} /> Location (State & City)</label>
                                <div className="org-profile-edit-row" style={{ display: 'flex', gap: '16px' }}>
                                    <select
                                        value={selectedState}
                                        onChange={handleStateChange}
                                        required
                                        className="org-profile-select"
                                        style={{ flex: 1 }}
                                    >
                                        <option value="" disabled>Select State</option>
                                        {malaysiaStates.map((state) => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={selectedCity}
                                        onChange={handleCityChange}
                                        required
                                        disabled={!selectedState}
                                        className="org-profile-select"
                                        style={{ flex: 1 }}
                                    >
                                        <option value="" disabled>Select City</option>
                                        {selectedState && malaysiaStateCities[selectedState]?.map((city) => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Input: Dates (Row) */}
                            <div className="org-profile-edit-row" style={{ display: 'flex', gap: '16px' }}>
                                <div className="org-profile-edit-input-group" style={{ flex: 1 }}>
                                    <label>Start Date & Time</label>
                                    <input 
                                        type="datetime-local" 
                                        name="startAt"
                                        value={formatForInput(formData.startAt)} 
                                        onChange={(e) => setFormData({ ...formData, startAt: e.target.value ? e.target.value + ":00+08:00" : "" })}
                                        required
                                    />
                                </div>

                                <div className="org-profile-edit-input-group" style={{ flex: 1 }}>
                                    <label>End Date & Time</label>
                                    <input 
                                        type="datetime-local" 
                                        name="endAt"
                                        value={formatForInput(formData.endAt)} 
                                        onChange={(e) => setFormData({ ...formData, endAt: e.target.value ? e.target.value + ":00+08:00" : "" })}
                                        required
                                    />
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