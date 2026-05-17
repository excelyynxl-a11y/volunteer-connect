import React, { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  FileText,
  AlignLeft,
  CheckCircle2,
  Users,
  X,
  Target
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import OrganisationSidebar from "../../components/OrganisationSidebar";
import { malaysiaStates, malaysiaStateCities, EVENT_CATEGORIES } from "../../lib/data";

const CreateOpportunityPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    details: "",
    maxVolunteers: 1,
    applicationDeadline: "",
    startAt: "",
    endAt: "",
  });

  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [errors, setErrors] = useState({});

  const selectedCities = malaysiaStateCities[selectedState] || [];

  const titleProgress = Math.min((formData.title.length / 15) * 100, 100);
  const detailsProgress = Math.min((formData.details.length / 50) * 100, 100);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const validateForm = () => {
    const newErrors = {};
    if (formData.title.trim().length < 15) newErrors.title = "Min 15 characters required";
    if (formData.details.trim().length < 50) newErrors.details = "Min 50 characters required";
    if (!selectedState || !selectedCity) newErrors.location = "Location is required";
    if (selectedCategory.length === 0) newErrors.category = "Select at least one category";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const submissionData = {
      ...formData,
      location: `${selectedState}, ${selectedCity}`,
      category: selectedCategory,
    };

    console.log("Saving to Database:", submissionData);
    navigate("/organisation-dashboard");
  };

  return (
    <div className="organisation-layout">
      <OrganisationSidebar />

      <div className="organisation-main-content">
        <div className="organisation-create-page">
          <header className="organisation-create-header">
            <div className="organisation-create-header-left">
              <span className="organisation-section-label">ORGANISATION PROFILE</span>
              <h1>Create New Opportunity Posting</h1>
              <p className="organisation-create-description">
                Craft a thoughtful volunteer opportunity for your community.
                Clear details help the right people show up at the right time.
              </p>
            </div>
            <div className="organisation-create-header-actions">
              <button className="organisation-back-btn" onClick={() => navigate(-1)} type="button">
                <ArrowLeft size={18}/> Back
              </button>
              <button className="organisation-create-btn" onClick={handleSubmit} type="button">
                <CheckCircle2 size={18}/> Publish Opportunity
              </button>
            </div>
          </header>

          <div className="organisation-create-card">
            {/* RESTORED: The Card Heading section */}
            <div className="organisation-card-heading">
              <div className="organisation-card-heading-icon">
                <FileText size={20} />
              </div>
              <div>
                <h2>Opportunity Details</h2>
                <p className="organisation-card-subtitle">
                  Fill in the essentials below, all fields are required.
                </p>
              </div>
            </div>

            <form className="organisation-create-form" onSubmit={handleSubmit}>
              <div className="organisation-form-left">
                <div className="organisation-form-group">
                  <label><FileText size={16}/> Event Title</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    placeholder="A clear, inviting title for your event" 
                  />
                  <div className="organisation-progress-row">
                    <div className="organisation-progress-bar">
                      <span style={{ width: `${titleProgress}%` }} />
                    </div>
                    <div className="organisation-character-count">{formData.title.length}/15</div>
                  </div>
                  {errors.title && <p className="organisation-error-text">{errors.title}</p>}
                </div>

                <div className="organisation-form-group organisation-form-group-grow">
                  <label><AlignLeft size={16}/> Detailed Description</label>
                  <textarea 
                    name="details" 
                    value={formData.details} 
                    onChange={handleChange} 
                    placeholder="Describe what volunteers will do, who they will help, and why it matters" 
                  />
                  <div className="organisation-progress-row">
                    <div className="organisation-progress-bar">
                      <span style={{ width: `${detailsProgress}%` }} />
                    </div>
                    <div className="organisation-character-count">{formData.details.length}/50</div>
                  </div>
                  {errors.details && <p className="organisation-error-text">{errors.details}</p>}
                </div>
              </div>

              <div className="organisation-form-right">
                <div className="organisation-form-grid">
                  <div className="organisation-form-group" style={{ gridColumn: "span 2" }}>
                    <label><Target size={16}/> Categories</label>
                    <select onChange={handleCategoryAdd} className="org-profile-select" defaultValue="">
                      <option value="" disabled>Add Category</option>
                      {EVENT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <div className="selected-category-tags">
                      {selectedCategory.map(cat => (
                        <span key={cat} className="category-tag-badge">
                          {cat} 
                          <button type="button" onClick={() => removeCategory(cat)} className="remove-tag-btn">
                            <X size={12}/>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="organisation-form-group">
                    <label><MapPin size={16}/> State</label>
                    <select value={selectedState} onChange={(e) => {setSelectedState(e.target.value); setSelectedCity("");}}>
                      <option value="">Select State</option>
                      {malaysiaStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="organisation-form-group">
                    <label><MapPin size={16}/> City</label>
                    <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedState}>
                      <option value="">Select City</option>
                      {selectedCities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="organisation-form-group">
                    <label><CalendarDays size={16}/> Start Date & Time</label>
                    <input type="datetime-local" name="startAt" value={formData.startAt} onChange={handleChange} />
                  </div>

                  <div className="organisation-form-group">
                    <label><CalendarDays size={16}/> End Date & Time</label>
                    <input type="datetime-local" name="endAt" value={formData.endAt} onChange={handleChange} />
                  </div>

                  <div className="organisation-form-group">
                    <label><Users size={16}/> Volunteer Capacity</label>
                    <input type="number" name="maxVolunteers" value={formData.maxVolunteers} onChange={handleChange} min="1" />
                  </div>

                  <div className="organisation-form-group">
                    <label><Clock3 size={16}/> Application Deadline</label>
                    <input type="date" name="applicationDeadline" value={formData.applicationDeadline} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOpportunityPage;
