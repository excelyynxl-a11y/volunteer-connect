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
import OrganisationSidebar from "../../components/OrganisationSidebar";
import {
  malaysiaStates,
  malaysiaStateCities,
  EVENT_CATEGORIES
} from "../../lib/data";
import { useOrganisationStore } from "../../store/useOrganisationStore";
import { useAuthStore } from "../../store/useAuthStore.js";
import toast from "react-hot-toast";

const CreateOpportunityPage = () => {
  const navigate = useNavigate();
  const { createOpportunity, setCurrentTab } = useOrganisationStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    setCurrentTab('opportunity')
  }, []);


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

  const titleProgress = Math.min(
    (formData.title.length / 15) * 100,
    100
  );

  const detailsProgress = Math.min(
    (formData.details.length / 50) * 100,
    100
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

  const handleCategoryAdd = (e) => {
    const value = e.target.value;

    if (value && !selectedCategory.includes(value)) {
      setSelectedCategory([...selectedCategory, value]);
    }

    if (errors.category) {
      setErrors((prev) => ({
        ...prev,
        category: "",
      }));
    }

    e.target.value = "";
  };

  const removeCategory = (catToRemove) => {
    setSelectedCategory(
      selectedCategory.filter((c) => c !== catToRemove)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = formData.startAt
      ? new Date(formData.startAt)
      : null;

    const endDate = formData.endAt
      ? new Date(formData.endAt)
      : null;

    const deadlineDate = formData.applicationDeadline
      ? new Date(formData.applicationDeadline)
      : null;

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
    if (!formData.startAt) {
      newErrors.startAt =
        "Start date & time is required";
    }

    // end datetime validation
    if (!formData.endAt) {
      newErrors.endAt =
        "End date & time is required";
    } else if (
      startDate &&
      endDate &&
      endDate < startDate
    ) {
      newErrors.endAt =
        "End datetime cannot be before start datetime";
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
    } else if (deadlineDate < today) {
      newErrors.applicationDeadline =
        "Application deadline cannot be before today's date";
    }

    setErrors(newErrors);

    // block submit if errors exist
    if (Object.keys(newErrors).length > 0) {
      toast.error(
        "Please fill in all required fields correctly."
      );
      return;
    }


    // backend payload processing
    const rawStartDate = formData.startAt
      ? formData.startAt.split("T")[0]
      : "";

    const startTime = formData.startAt
      ? formData.startAt.split("T")[1]
      : "";

    const endTime = formData.endAt
      ? formData.endAt.split("T")[1]
      : "";

    const computedTimeFrame =
      startTime && endTime
        ? `${startTime} - ${endTime}`
        : "Flexible Session";

    const submissionData = {
      title: formData.title.trim(),
      details: formData.details.trim(),
      maxVolunteers: Number(formData.maxVolunteers),
      fixedDate: rawStartDate,
      timeFrame: computedTimeFrame,
      startAt: new Date(formData.startAt).toISOString(),
      endAt: new Date(formData.endAt).toISOString(),
      applicationDeadline: new Date(formData.applicationDeadline).toISOString(),
      location: `${selectedState}, ${selectedCity}`,
      category: selectedCategory,
      organisationId:
        authUser._id || authUser.id,
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
          maxVolunteers: 1,
          applicationDeadline: "",
          startAt: "",
          endAt: "",
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
              >
                <CheckCircle2 size={18} />
                Publish Opportunity
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
                          width: `${titleProgress}%`,
                        }}
                      />
                    </div>

                    <div className="organisation-character-count">
                      {formData.title.length}/15
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
                          width: `${detailsProgress}%`,
                        }}
                      />
                    </div>

                    <div className="organisation-character-count">
                      {formData.details.length}/50
                    </div>
                  </div>

                  {errors.details && (
                    <p className="organisation-error-text">
                      {errors.details}
                    </p>
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

                    <select
                      onChange={handleCategoryAdd}
                      className={
                        errors.category
                          ? "org-profile-select error"
                          : "org-profile-select"
                      }
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Add Category
                      </option>

                      {EVENT_CATEGORIES.map((cat) => (
                        <option
                          key={cat}
                          value={cat}
                        >
                          {cat}
                        </option>
                      ))}
                    </select>

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

                    <select
                      value={selectedState}
                      onChange={(e) => {
                        setSelectedState(
                          e.target.value
                        );

                        setSelectedCity("");

                        if (errors.location) {
                          setErrors((prev) => ({
                            ...prev,
                            location: "",
                          }));
                        }
                      }}
                      className={
                        errors.location
                          ? "error"
                          : ""
                      }
                    >
                      <option value="">
                        Select State
                      </option>

                      {malaysiaStates.map((s) => (
                        <option
                          key={s}
                          value={s}
                        >
                          {s}
                        </option>
                      ))}
                    </select>

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

                    <select
                      value={selectedCity}
                      onChange={(e) => {
                        setSelectedCity(
                          e.target.value
                        );

                        if (errors.location) {
                          setErrors((prev) => ({
                            ...prev,
                            location: "",
                          }));
                        }
                      }}
                      disabled={!selectedState}
                      className={
                        errors.location
                          ? "error"
                          : ""
                      }
                    >
                      <option value="">
                        Select City
                      </option>

                      {selectedCities.map((c) => (
                        <option
                          key={c}
                          value={c}
                        >
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* START */}
                  <div className="organisation-form-group">
                    <label>
                      <CalendarDays size={16} />
                      Start Date & Time
                    </label>

                    <input
                      type="datetime-local"
                      name="startAt"
                      value={formData.startAt}
                      onChange={handleChange}
                      className={
                        errors.startAt
                          ? "error"
                          : ""
                      }
                    />

                    {errors.startAt && (
                      <p className="organisation-error-text">
                        {errors.startAt}
                      </p>
                    )}
                  </div>

                  {/* END */}
                  <div className="organisation-form-group">
                    <label>
                      <CalendarDays size={16} />
                      End Date & Time
                    </label>

                    <input
                      type="datetime-local"
                      name="endAt"
                      value={formData.endAt}
                      onChange={handleChange}
                      className={
                        errors.endAt
                          ? "error"
                          : ""
                      }
                    />

                    {errors.endAt && (
                      <p className="organisation-error-text">
                        {errors.endAt}
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
                      value={
                        formData.applicationDeadline
                      }
                      onChange={handleChange}
                      className={
                        errors.applicationDeadline
                          ? "error"
                          : ""
                      }
                    />

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
