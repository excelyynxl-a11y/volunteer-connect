import React, { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  FileText,
  AlignLeft,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import OrganisationSidebar from "../../components/OrganisationSidebar";
import "../../pages/Organisation/Organisation.css";
import { malaysiaStates, malaysiaStateCities } from "../../lib/data";

const CreateOpportunityPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    state: "",
    city: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
  });

  const [errors, setErrors] = useState({});

  const selectedCities = malaysiaStateCities[formData.state] || [];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.title.trim().length < 15)
      newErrors.title = "Title must be at least 15 characters";
    if (formData.summary.trim().length < 50)
      newErrors.summary = "Summary must be at least 50 characters";
    if (!formData.state) newErrors.state = "Please select a state";
    if (!formData.city) newErrors.city = "Please select a city";
    if (!formData.startDate) newErrors.startDate = "Please choose a start date";
    if (!formData.endDate) newErrors.endDate = "Please choose an end date";
    if (!formData.startTime) newErrors.startTime = "Please choose a start time";
    if (!formData.endTime) newErrors.endTime = "Please choose an end time";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    console.log("Opportunity Created:", formData);
    navigate("/organisation-dashboard");
  };

  const titleProgress = Math.min((formData.title.length / 15) * 100, 100);
  const summaryProgress = Math.min((formData.summary.length / 50) * 100, 100);

  return (
    <div className="organisation-layout">
      <OrganisationSidebar />

      <div className="organisation-main-content">
        <div className="organisation-create-page">
          <div className="organisation-create-header">
            <div className="organisation-create-header-left">
              <div className="organisation-section-label">
                <span>ORGANISATION PROFILE</span>
              </div>

              <h1>Create New Opportunity Posting</h1>

              <p className="organisation-create-description">
                Craft a thoughtful volunteer opportunity for your community.
                Clear details help the right people show up at the right time.
              </p>
            </div>

            <div className="organisation-create-header-actions">
              <button
                className="organisation-back-btn"
                onClick={() => navigate(-1)}
                type="button"
              >
                <ArrowLeft size={18} />
                Back
              </button>

              <button
                className="organisation-create-btn"
                onClick={handleSubmit}
                type="button"
              >
                <CheckCircle2 size={18} />
                Publish Opportunity
              </button>
            </div>
          </div>

          <div className="organisation-create-card">
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
                  <label>
                    <FileText size={16} />
                    Event Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    placeholder="A clear, inviting title for your event"
                    value={formData.title}
                    onChange={handleChange}
                  />

                  <div className="organisation-progress-row">
                    <div className="organisation-progress-bar">
                      <span style={{ width: `${titleProgress}%` }} />
                    </div>
                    <div className="organisation-character-count">
                      {formData.title.length}/15
                    </div>
                  </div>

                  {errors.title && (
                    <p className="organisation-error-text">{errors.title}</p>
                  )}
                </div>

                <div className="organisation-form-group organisation-form-group-grow">
                  <label>
                    <AlignLeft size={16} />
                    Event Summary
                  </label>

                  <textarea
                    name="summary"
                    placeholder="Describe what volunteers will do, who they will help, and why it matters…"
                    value={formData.summary}
                    onChange={handleChange}
                  />

                  <div className="organisation-progress-row">
                    <div className="organisation-progress-bar">
                      <span style={{ width: `${summaryProgress}%` }} />
                    </div>
                    <div className="organisation-character-count">
                      {formData.summary.length}/50
                    </div>
                  </div>

                  {errors.summary && (
                    <p className="organisation-error-text">{errors.summary}</p>
                  )}
                </div>
              </div>

              <div className="organisation-form-right">
                <div className="organisation-form-grid">
                  <div className="organisation-form-group">
                    <label>
                      <MapPin size={16} />
                      State
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                    >
                      <option value="">Select State</option>
                      {malaysiaStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="organisation-error-text">{errors.state}</p>
                    )}
                  </div>

                  <div className="organisation-form-group">
                    <label>
                      <MapPin size={16} />
                      City
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!formData.state}
                    >
                      <option value="">Select City</option>
                      {selectedCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    {errors.city && (
                      <p className="organisation-error-text">{errors.city}</p>
                    )}
                  </div>

                  <div className="organisation-form-group">
                    <label>
                      <CalendarDays size={16} />
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                    />
                    {errors.startDate && (
                      <p className="organisation-error-text">
                        {errors.startDate}
                      </p>
                    )}
                  </div>

                  <div className="organisation-form-group">
                    <label>
                      <CalendarDays size={16} />
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                    />
                    {errors.endDate && (
                      <p className="organisation-error-text">
                        {errors.endDate}
                      </p>
                    )}
                  </div>

                  <div className="organisation-form-group">
                    <label>
                      <Clock3 size={16} />
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                    />
                    {errors.startTime && (
                      <p className="organisation-error-text">
                        {errors.startTime}
                      </p>
                    )}
                  </div>

                  <div className="organisation-form-group">
                    <label>
                      <Clock3 size={16} />
                      End Time
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                    />
                    {errors.endTime && (
                      <p className="organisation-error-text">
                        {errors.endTime}
                      </p>
                    )}
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
