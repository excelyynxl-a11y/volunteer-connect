import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrganisationStore } from '../../store/useOrganisationStore';
import { malaysiaStateCities, malaysiaStates } from '../../lib/data';
import { ArrowLeft, Save, X } from 'lucide-react';
import { EVENT_CATEGORIES } from '../../lib/data';

const EditOpportunity = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { activeOpportunities, updateOpportunity, isUpdatingOpportunity } = 
        useOrganisationStore();

    const [formData, setFormData] = useState(null);
    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        const opportunityToEdit = activeOpportunities.find(opp => opp._id === id);

        if (opportunityToEdit) {
            setFormData(opportunityToEdit);
            setSelectedCategory(opportunityToEdit.category || []);
            if (opportunityToEdit.location) {
                const[dbState, dbCity] = opportunityToEdit.location.split(", ");
                setSelectedState(dbState || "");
                setSelectedCity(dbCity || "");
            }
        } else {
            navigate("/organisation-dashboard/profile");
        }
    }, [id, activeOpportunities, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value});
        if (fieldErrors[e.target.name]) {
            setFieldErrors(prev => ({ ...prev, [e.target.name]: null}));
        }
    }

    const handleStateChange = (e) => {
        setSelectedState(e.target.value);
        setSelectedCity("");
        setErrorMessage("");
        setFieldErrors(prev => ({ ...prev, location: null}));
    };

    const handleCityChange = (e) => {
        setSelectedCity(e.target.value);
        setErrorMessage("");
        setFieldErrors(prev => ({ ...prev, location: null}));
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

    const formatForInput = (isoString) =>
        isoString ? isoString.substring(0, 16) : '';

    const renderError = (field) => {
        return fieldErrors[field] ? <p className="organisation-error-text">{fieldErrors[field]}</p> : null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setFieldErrors({})

        const newErrors = {};

        if (!formData.title?.trim()) {
            newErrors.title = "Event title is required.";
        }

        if (!formData.details?.trim()) {
            newErrors.details = "Event details are required.";
        }

        if (!selectedState || !selectedCity) {
            newErrors.location = "Please select both State and City."
        }

        const validCitiesForState = malaysiaStateCities[selectedState];
        if (!validCitiesForState || !validCitiesForState.includes(selectedCity)) {
            return setErrorMessage("System Error: The selected city does not match the selected state.");
        }

        const start = new Date(formData.startAt);
        const end = new Date(formData.endAt);
        const today = new Date();

        if (end <= start) {
            newErrors.endAt = "End date cannot be before or equal to start date.";
        }
        
        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            setErrorMessage("Please correct the errors in the form before saving.");
            return;
        }

        const finalDataToSubmit = {
            ...formData,
            location: `${selectedState}, ${selectedCity}`,
            category: selectedCategory
        };

        const result = await updateOpportunity(id, finalDataToSubmit);

        if (result.success) {
            navigate("/organisation-dashboard/profile");
            return;
        }

        setErrorMessage(
            result.error || 
            "Failed to update opportunity. Please check the details and try again."
        );
    }

    if (!formData) {
        return <div className="org-profile-edit-main">Loading...</div>
    }

    return (
        <div className="org-profile-page">
            <div className="org-profile-main">

                <section className="org-profile-banner">
                    <div className="org-profile-banner-text">
                        <span className="org-profile-eyebrow">OPPORTUNITY MANAGEMENT</span>
                        <h1>Edit Opportunity Posting</h1>
                        <p>
                            Keep your event details, location and schedule accurately so
                            volunteers know exactly what to expect.
                        </p>
                    </div>

                    <div className="org-profile-edit-hero-actions">
                        <button
                            type="button"
                            className="org-profile-secondary-btn"
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

                <div className="org-profile-postings-card">
                    <div className="org-profile-card-accent" />

                    <div className="org-profile-card-header">
                        <div>
                            <span className="org-profile-eyebrow">
                                <b>Posting Details</b>
                            </span>
                            <h3>Update Information</h3>
                        </div>
                    </div>

                    {errorMessage && (
                        <p className="org-profile-edit-error">{errorMessage}</p>
                    )}

                    <form
                        id="opportunity-edit-form"
                        onSubmit={handleSubmit}
                        className="org-profile-edit-form"
                    >
                        <div className="org-profile-edit-input-group">
                            <label>Event Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                maxLength={120}
                                required
                            />
                            {renderError("title")}
                        </div>

                        <div className="org-profile-edit-input-group">
                            <label>Event Categories</label>
                            <select 
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
                            
                            {/* Display chosen tags */}
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
                        </div>

                        <div className="org-profile-edit-input-group">
                            <label>Event Details</label>
                            <textarea
                                name="details"
                                value={formData.details}
                                onChange={handleChange}
                                maxLength={5000}
                                rows="5"
                                required
                            />
                            {renderError("details")}
                        </div>

                        <div className="org-profile-edit-input-group">
                            <label>Location (State & City)</label>
                            <div className="org-profile-edit-row">
                                <select
                                    value={selectedState}
                                    onChange={handleStateChange}
                                    required
                                    className="org-profile-select"
                                >
                                    <option value="" disabled>Select State</option>
                                    {malaysiaStates.map((state) => (
                                        <option
                                            key={state}
                                            value={state}
                                        >{state}</option>
                                    ))}
                                </select>

                                <select
                                    value={selectedCity}
                                    onChange={handleCityChange}
                                    required
                                    disabled={!selectedState}
                                    className="org-profile-select"
                                >
                                    <option value="" disabled>Select City</option>
                                    {selectedState && malaysiaStateCities[selectedState].map((city) => (
                                        <option
                                            key={city}
                                            value={city}
                                        >{city}</option>
                                    ))}
                                </select>
                            </div>
                            {renderError("location")}
                        </div>

                        <div className="org-profile-edit-row">
                            <div className="org-profile-edit-input-group">
                                <label>Start Date & Time</label>
                                <input 
                                    type="datetime-local" 
                                    name="startAt"
                                    value={formatForInput(formData.startAt)} 
                                    onChange={(e) => setFormData({ ...formData, startAt: e.target.value + ":00+08:00" })}
                                    required
                                />
                            </div>

                            <div className="org-profile-edit-input-group" style={{ flex: 1 }}>
                                <label>End Date & Time</label>
                                <input 
                                    type="datetime-local" 
                                    name="endAt"
                                    value={formatForInput(formData.endAt)} 
                                    onChange={(e) => setFormData({ ...formData, endAt: e.target.value + ":00+08:00" })}
                                    required
                                />
                                {renderError("endAt")}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


export default EditOpportunity;
