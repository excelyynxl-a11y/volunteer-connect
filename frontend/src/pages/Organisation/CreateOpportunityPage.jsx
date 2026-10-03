import React, { useState, useEffect } from "react";
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
  Target,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  malaysiaStates,
  malaysiaStateCities,
  EVENT_CATEGORIES
} from "../../lib/data";
import CustomSelect from "../../components/CustomSelect";
import { useOrganisationStore } from "../../store/useOrganisationStore";
import toast from "react-hot-toast";
import { formatLocalDate, validateOpportunityDates } from "../../lib/opportunityDates";

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hours = Math.floor(index / 2).toString().padStart(2, "0");
  const minutes = index % 2 === 0 ? "00" : "30";
  const value = `${hours}:${minutes}`;

  return {
    label: value,
    value,
  };
});

const CreateOpportunityPage = () => {
  const navigate = useNavigate();
  const { createOpportunity, isCreatingOpportunity, setCurrentTab } = useOrganisationStore();

  useEffect(() => {
    setCurrentTab('opportunity')
  }, [setCurrentTab]);


  const [formData, setFormData] = useState({
    title: "",
    details: "",
    requirements: "",
    maxVolunteers: 1,
    applicationDeadline: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });

  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [errors, setErrors] = useState({});

  const selectedCities = malaysiaStateCities[selectedState] || [];
  const availableCategories = EVENT_CATEGORIES.filter(
    (category) => !selectedCategory.includes(category),
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // clear field error while typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCategoryAdd = (value) => {
    if (value && !selectedCategory.includes(value)) {
      setSelectedCategory([...selectedCategory, value]);
    }

    if (errors.category) {
      setErrors((prev) => ({
        ...prev,
        category: "",
      }));
    }

  };

  const removeCategory = (catToRemove) => {
    setSelectedCategory(
      selectedCategory.filter((c) => c !== catToRemove)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isCreatingOpportunity) return;

    const newErrors = {};

    const { errors: dateErrors, start: startDateTime, end: endDateTime, deadline: deadlineDate } =
      validateOpportunityDates({
        startAt: formData.startDate && formData.startTime ? `${formData.startDate}T${formData.startTime}` : "",
        endAt: formData.endDate && formData.endTime ? `${formData.endDate}T${formData.endTime}` : "",
        applicationDeadline: formData.applicationDeadline ? `${formData.applicationDeadline}T00:00` : "",
      }, { creating: true });

    // title validation
    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    } else if (formData.title.trim().length < 15) {
      newErrors.title =
        "Title must be at least 15 characters";
    }

    // description validation
    if (!formData.details.trim()) {
      newErrors.details = "Description is required";
    } else if (formData.details.trim().length < 50) {
      newErrors.details =
        "Description must be at least 50 characters";
    }

    if (formData.requirements.trim().length > 2000) {
      newErrors.requirements = "Requirements must be 2,000 characters or fewer";
    }

    // location validation
    if (!selectedState || !selectedCity) {
      newErrors.location =
        "Please select both state and city";
    }

    // category validation
    if (selectedCategory.length === 0) {
      newErrors.category =
        "Select at least one category";
    }

    // start datetime validation
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    // end datetime validation
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    // volunteer capacity validation
    if (
      !formData.maxVolunteers ||
      Number(formData.maxVolunteers) <= 0
    ) {
      newErrors.maxVolunteers =
        "Volunteer capacity must be greater than 0";
    }

    // application deadline validation
    if (!formData.applicationDeadline) {
      newErrors.applicationDeadline =
        "Application deadline is required";
    }

    if (dateErrors.startAt) newErrors.startDate = dateErrors.startAt;
    if (dateErrors.endAt) newErrors.endDate = dateErrors.endAt;
    if (dateErrors.applicationDeadline) newErrors.applicationDeadline = dateErrors.applicationDeadline;

    setErrors(newErrors);

    // block submit if errors exist
    if (Object.keys(newErrors).length > 0) {
      toast.error(
        "Please fill in all required fields correctly."
      );
      return;
    }

    const submissionData = {
      title: formData.title.trim(),
      details: formData.details.trim(),
      requirements: formData.requirements.trim(),
      maxVolunteers: Number(formData.maxVolunteers),
      startAt: startDateTime.toISOString(),
      endAt: endDateTime.toISOString(),
      applicationDeadline: deadlineDate.toISOString(),
      location: `${selectedState}, ${selectedCity}`,
      category: selectedCategory,
    };

    try {
      const result = await createOpportunity(
        submissionData
      );

      if (result.success) {
        toast.success(
          "Opportunity published successfully!"
        );

        setFormData({
          title: "",
          details: "",
          requirements: "",
          maxVolunteers: 1,
          applicationDeadline: "",
          startDate: "",
          startTime: "",
          endDate: "",
          endTime: "",
        });

        setSelectedState("");
        setSelectedCity("");
        setSelectedCategory([]);
        setErrors({});

        navigate("/organisation-dashboard");
      }
    } catch (err) {
      console.error(
        "Unexpected submission error:",
        err
      );

      toast.error(
        "Something went wrong while publishing opportunity."
      );
    }
  };

  return (
    <div className="organisation-layout">

      <div className="organisation-main-content">
        <div className="organisation-create-page">
          <header className="organisation-create-header">
            <div className="organisation-create-header-left">
              <span className="organisation-section-label">
                ORGANISATION PROFILE
              </span>

              <h1>
                Create New Opportunity Posting
              </h1>

              <p className="organisation-create-description">
                Craft a thoughtful volunteer opportunity
                for your community. Clear details help
                the right people show up at the right
                time.
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
                type="submit"
                form="create-opportunity-form"
                disabled={isCreatingOpportunity}
              >
                {isCreatingOpportunity ? (
                  <Loader2 size={18} className="organisation-submit-loader" />
                ) : (
                  <CheckCircle2 size={18} />
                )}
                {isCreatingOpportunity ? "Publishing..." : "Publish Opportunity"}
              </button>
            </div>
          </header>

          <div className="organisation-create-card">
            <div className="organisation-card-heading">
              <div className="organisation-card-heading-icon">
                <FileText size={20} />
              </div>

              <div>
                <h2>Opportunity Details</h2>

                <p className="organisation-card-subtitle">
                  Fill in the essentials below, all
                  fields are required.
                </p>
              </div>
            </div>

            <form
              id="create-opportunity-form"
              className="organisation-create-form"
              onSubmit={handleSubmit}
            >
              <div className="organisation-form-left">

                {/* TITLE */}
                <div className="organisation-form-group">
                  <label>
                    <FileText size={16} />
                    Event Title
                  </label>

                  <input
                    type="text"
                    name="title"
                     value={formData.title}
                     maxLength={120}
                    onChange={handleChange}
                    placeholder="A clear, inviting title for your event"
                    className={
                      errors.title ? "error" : ""
                    }
                  />

                  <div className="organisation-progress-row">
                    <div className="organisation-progress-bar">
                      <span
                        style={{
                         width: `${Math.min((formData.title.length / 120) * 100, 100)}%`,
                        }}
                      />
                    </div>

                    <div className="organisation-character-count">
                      {formData.title.length}/120
                    </div>
                  </div>

                  {errors.title && (
                    <p className="organisation-error-text">
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* DETAILS */}
                <div className="organisation-form-group organisation-form-group-grow">
                  <label>
                    <AlignLeft size={16} />
                    Detailed Description
                  </label>

                  <textarea
                    name="details"
                     value={formData.details}
                     maxLength={5000}
                    onChange={handleChange}
                    placeholder="Describe what volunteers will do, who they will help, and why it matters"
                    className={
                      errors.details ? "error" : ""
                    }
                  />

                  <div className="organisation-progress-row">
                    <div className="organisation-progress-bar">
                      <span
                        style={{
                           width: `${Math.min((formData.details.length / 5000) * 100, 100)}%`,
                        }}
                      />
                    </div>

                    <div className="organisation-character-count">
                      {formData.details.length}/5000
                    </div>
                  </div>

                  {errors.details && (
                    <p className="organisation-error-text">
                      {errors.details}
                    </p>
                  )}
                </div>

                <div className="organisation-form-group">
                  <label>
                    <FileText size={16} />
                    Requirements (optional)
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    maxLength={2000}
                    rows={4}
                    placeholder="List useful skills, equipment, or preparation volunteers should have"
                    className={errors.requirements ? "error" : ""}
                  />
                  <div className="organisation-character-count">
                    {formData.requirements.length}/2000
                  </div>
                  {errors.requirements && (
                    <p className="organisation-error-text">{errors.requirements}</p>
                  )}
                </div>

              </div>

              <div className="organisation-form-right">
                <div className="organisation-form-grid">

                  {/* CATEGORY */}
                  <div
                    className="organisation-form-group"
                    style={{ gridColumn: "span 2" }}
                  >
                    <label>
                      <Target size={16} />
                      Categories
                    </label>

                    <CustomSelect
                      value=""
                      placeholder={
                        availableCategories.length > 0
                          ? "Add Category"
                          : "All categories selected"
                      }
                      options={availableCategories}
                      onChange={handleCategoryAdd}
                      className={errors.category ? "error" : ""}
                      disabled={availableCategories.length === 0}
                    />

                    <div className="selected-category-tags">
                      {selectedCategory.map((cat) => (
                        <span
                          key={cat}
                          className="category-tag-badge"
                        >
                          {cat}

                          <button
                            type="button"
                            onClick={() =>
                              removeCategory(cat)
                            }
                            className="remove-tag-btn"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>

                    {errors.category && (
                      <p className="organisation-error-text">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  {/* STATE */}
                  <div className="organisation-form-group">
                    <label>
                      <MapPin size={16} />
                      State
                    </label>

                    <CustomSelect
                      value={selectedState}
                      placeholder="Select State"
                      options={malaysiaStates}
                      onChange={(value) => {
                        setSelectedState(value);
                        setSelectedCity("");

                        if (errors.location) {
                          setErrors((prev) => ({
                            ...prev,
                            location: "",
                          }));
                        }
                      }}
                      className={errors.location ? "error" : ""}
                    />

                    {errors.location && (
                      <p className="organisation-error-text">
                        {errors.location}
                      </p>
                    )}
                  </div>

                  {/* CITY */}
                  <div className="organisation-form-group">
                    <label>
                      <MapPin size={16} />
                      City
                    </label>

                    <CustomSelect
                      value={selectedCity}
                      placeholder={selectedState ? "Select City" : "Select a state first"}
                      options={selectedCities}
                      onChange={(value) => {
                        setSelectedCity(value);

                        if (errors.location) {
                          setErrors((prev) => ({
                            ...prev,
                            location: "",
                          }));
                        }
                      }}
                      className={errors.location ? "error" : ""}
                      disabled={!selectedState}
                    />
                  </div>

                  {/* START DATE */}
                  <div className="organisation-form-group">
                    <label>
                      <CalendarDays size={16} />
                      Start Date
                    </label>

                    <input
                      type="date"
                      name="startDate"
                      min={formatLocalDate()}
                      value={formData.startDate}
                      onChange={handleChange}
                      className={
                        errors.startDate
                          ? "organisation-date-input error"
                          : "organisation-date-input"
                      }
                    />

                    {errors.startDate && (
                      <p className="organisation-error-text">
                        {errors.startDate}
                      </p>
                    )}
                  </div>

                  {/* START TIME */}
                  <div className="organisation-form-group">
                    <label>
                      <Clock3 size={16} />
                      Start Time
                    </label>

                    <CustomSelect
                      value={formData.startTime}
                      placeholder="Select start time"
                      options={TIME_OPTIONS}
                      onChange={(value) =>
                        handleChange({
                          target: { name: "startTime", value },
                        })
                      }
                      className={errors.startTime ? "error" : ""}
                    />

                    {errors.startTime && (
                      <p className="organisation-error-text">
                        {errors.startTime}
                      </p>
                    )}
                  </div>

                  {/* END DATE */}
                  <div className="organisation-form-group">
                    <label>
                      <CalendarDays size={16} />
                      End Date
                    </label>

                    <input
                      type="date"
                      name="endDate"
                      min={formData.startDate || formatLocalDate()}
                      value={formData.endDate}
                      onChange={handleChange}
                      className={
                        errors.endDate
                          ? "organisation-date-input error"
                          : "organisation-date-input"
                      }
                    />

                    {errors.endDate && (
                      <p className="organisation-error-text">
                        {errors.endDate}
                      </p>
                    )}
                  </div>

                  {/* END TIME */}
                  <div className="organisation-form-group">
                    <label>
                      <Clock3 size={16} />
                      End Time
                    </label>

                    <CustomSelect
                      value={formData.endTime}
                      placeholder="Select end time"
                      options={TIME_OPTIONS}
                      onChange={(value) =>
                        handleChange({
                          target: { name: "endTime", value },
                        })
                      }
                      className={errors.endTime ? "error" : ""}
                    />

                    {errors.endTime && (
                      <p className="organisation-error-text">
                        {errors.endTime}
                      </p>
                    )}
                  </div>

                  {/* CAPACITY */}
                  <div className="organisation-form-group">
                    <label>
                      <Users size={16} />
                      Volunteer Capacity
                    </label>

                    <input
                      type="number"
                      name="maxVolunteers"
                      value={formData.maxVolunteers}
                      onChange={handleChange}
                      min="1"
                      className={
                        errors.maxVolunteers
                          ? "error"
                          : ""
                      }
                    />

                    {errors.maxVolunteers && (
                      <p className="organisation-error-text">
                        {errors.maxVolunteers}
                      </p>
                    )}
                  </div>

                  {/* DEADLINE */}
                  <div className="organisation-form-group">
                    <label>
                      <Clock3 size={16} />
                      Application Deadline
                    </label>

                    <input
                      type="date"
                      name="applicationDeadline"
                      min={formatLocalDate()}
                      max={formData.startDate || undefined}
                      value={
                        formData.applicationDeadline
                      }
                      onChange={handleChange}
                      className={
                        errors.applicationDeadline
                          ? "organisation-date-input error"
                          : "organisation-date-input"
                      }
                    />

                    <p className="organisation-form-hint">Applications close at 00:00 on this date, before the opportunity starts.</p>
                    {errors.applicationDeadline && (
                      <p className="organisation-error-text">
                        {
                          errors.applicationDeadline
                        }
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
