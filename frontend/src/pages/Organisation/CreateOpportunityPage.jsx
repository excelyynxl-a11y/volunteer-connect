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
import { malaysiaStates, malaysiaStateCities, EVENT_CATEGORIES } from "../../lib/data";
import { useOrganisationStore } from "../../store/useOrganisationStore";
import { useAuthStore } from "../../store/useAuthStore.js";
import toast from "react-hot-toast";

const CreateOpportunityPage = () => {
  const navigate = useNavigate();
  const { createOpportunity } = useOrganisationStore();
  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    if (!authUser && typeof checkAuth === "function") {
      checkAuth();
    }
  }, [authUser, checkAuth]);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Submit button clicked! Current Form state:", formData);

    // 1. Frontend validation rules
    const newErrors = {};
    if (!formData.title?.trim() || formData.title.trim().length < 15) newErrors.title = "Min 15 characters required";
    if (!formData.details?.trim() || formData.details.trim().length < 50) newErrors.details = "Min 50 characters required";
    if (!selectedState || !selectedCity) newErrors.location = "Location is required";
    if (selectedCategory.length === 0) newErrors.category = "Select at least one category";
    if (!formData.startAt) newErrors.startAt = "Start date is required";
    if (!formData.endAt) newErrors.endAt = "End date is required";
    if (!formData.applicationDeadline) newErrors.applicationDeadline = "Deadline is required";
    
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      console.log("Validation BLOCKED execution. Errors found:", newErrors);
      toast.error("Please fill in all required fields correctly.");
      return; 
    }

    if (!authUser?._id && !authUser?.id) {
      console.error("Auth verification failed: User profile object identifier missing completely.", authUser);
      toast.error("Authentication error: Session profile not verified.");
      return;
    }

    // Process variables accurately for backend model parser targets
    const rawStartDate = formData.startAt ? formData.startAt.split("T")[0] : "";
    const startTime = formData.startAt ? formData.startAt.split("T")[1] : "";
    const endTime = formData.endAt ? formData.endAt.split("T")[1] : "";
    const computedTimeFrame = startTime && endTime ? `${startTime} - ${endTime}` : "Flexible Session";

    // 2. Exact unified layout object architecture payload mapping
    const submissionData = {
      title: formData.title.trim(),
      details: formData.details.trim(),
      maxVolunteers: Number(formData.maxVolunteers),
      fixedDate: rawStartDate,       
      timeFrame: computedTimeFrame,  
      startAt: formData.startAt,
      endAt: formData.endAt,
      applicationDeadline: formData.applicationDeadline,
      location: `${selectedState}, ${selectedCity}`,
      category: selectedCategory,
      // Pass both formats to guard against unaligned auth token property extractions on the backend
      organisationId: authUser._id || authUser.id 
    };

    console.log("Dispatching complete unified payload to backend:", submissionData);
    
    try {
      const result = await createOpportunity(submissionData);
      console.log("Zustand response received:", result);
      
      if (result.success) {
        toast.success("Opportunity published successfully!");
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
        navigate("/organisation-dashboard");
      }
    } catch (err) {
      console.error("An unexpected crash occurred during submission pipeline:", err);
    }
  };

  if (isCheckingAuth && !authUser) {
    return (
      <div className="organisation-layout">
        <OrganisationSidebar />
        <div className="organisation-main-content flex flex-col items-center justify-center h-screen gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-gray-600 font-medium">Verifying authorization profile session...</p>
        </div>
      </div>
    );
  }

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
                Clear details help the right people show show up at the right time.
              </p>
            </div>
            <div className="organisation-create-header-actions">
              <button className="organisation-back-btn" onClick={() => navigate(-1)} type="button">
                <ArrowLeft size={18}/> Back
              </button>
              <button 
                className="organisation-create-btn" 
                type="submit" 
                form="create-opportunity-form"
              >
                <CheckCircle2 size={18}/> Publish Opportunity
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
                  Fill in the essentials below, all fields are required.
                </p>
              </div>
            </div>

            <form id="create-opportunity-form" className="organisation-create-form" onSubmit={handleSubmit}>
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
                    {errors.category && <p className="organisation-error-text">{errors.category}</p>}
                  </div>

                  <div className="organisation-form-group">
                    <label><MapPin size={16}/> State</label>
                    <select value={selectedState} onChange={(e) => {setSelectedState(e.target.value); setSelectedCity("");}}>
                      <option value="">Select State</option>
                      {malaysiaStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.location && <p className="organisation-error-text">{errors.location}</p>}
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
                    {errors.startAt && <p className="organisation-error-text">{errors.startAt}</p>}
                  </div>

                  <div className="organisation-form-group">
                    <label><CalendarDays size={16}/> End Date & Time</label>
                    <input type="datetime-local" name="endAt" value={formData.endAt} onChange={handleChange} />
                    {errors.endAt && <p className="organisation-error-text">{errors.endAt}</p>}
                  </div>

                  <div className="organisation-form-group">
                    <label><Users size={16}/> Volunteer Capacity</label>
                    <input type="number" name="maxVolunteers" value={formData.maxVolunteers} onChange={handleChange} min="1" />
                  </div>

                  <div className="organisation-form-group">
                    <label><Clock3 size={16}/> Application Deadline</label>
                    <input type="date" name="applicationDeadline" value={formData.applicationDeadline} onChange={handleChange} />
                    {errors.applicationDeadline && <p className="organisation-error-text">{errors.applicationDeadline}</p>}
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