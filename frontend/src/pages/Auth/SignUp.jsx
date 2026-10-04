import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Auth.css";
import {
  AlertCircle,
  ArrowBigLeft,
  Building2,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Upload,
  UserCheck,
  X,
} from "lucide-react";
import Badge from "../../components/Badge";
import { validateEmail, validatePassword } from "../../lib/utils";
import WelcomeAbroad from "./WelcomeAbroad";
import { useAuthStore } from "../../store/useAuthStore";

const SignUp = () => {
  const { signUp, isSigningUp } = useAuthStore();

  // basic formData [fullName, email, password, role]
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
  });

  // Track password focus for interactive requirements
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Requirements defined after formData so formData.password is reachable
  const passwordRequirements = [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "At least one uppercase letter", met: /[A-Z]/.test(formData.password) },
    { label: "At least one lowercase letter", met: /[a-z]/.test(formData.password) },
    { label: "At least one number", met: /[0-9]/.test(formData.password) },
  ];

  // Current form state and errors
  const [formState, setFormState] = useState({
    loading: false,
    errors: {},
    showPassword: false,
    success: false,
  });

  const [redirectConfig, setRedirectConfig] = useState(null);

  // additional formData for volunteer
  const [volunteerFormData, setVolunteerFormData] = useState({
    ageGroup: "",
    resume: null,
  });

  // additional formData for organisation
  const [organisationFormData, setOrganisationFormData] = useState({
    biodata: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formState.errors[name]) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [name]: "" },
      }));
    }
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({ ...prev, role }));

    if (formState.errors.role) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, role: "" },
      }));
    }
  };

  const handleVolunteerChange = (e) => {
    const { name, value } = e.target;
    setVolunteerFormData((prev) => ({ ...prev, [name]: value }));

    if (formState.errors[name]) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [name]: "" },
      }));
    }
  };

  const handleFileChange = (e) => {
    setVolunteerFormData((prev) => ({ ...prev, resume: e.target.files[0] }));

    if (formState.errors.resume) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, resume: "" },
      }));
    }
  };

  const handleOrgChange = (e) => {
    setOrganisationFormData((prev) => ({ ...prev, biodata: e.target.value }));

    if (formState.errors.biodata) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, biodata: "" },
      }));
    }
  };

  const validateForm = () => {
    const errors = {
      fullName: !formData.fullName.trim() ? "Enter your full name" : "",
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      role: !formData.role ? "Please select a role" : "",
    };

    // volunteer-specific validation
    if (formData.role === "volunteer") {
      if (!volunteerFormData.ageGroup) {
        errors.ageGroup = "Select your age group";
      }
      if (!volunteerFormData.resume) {
        errors.resume = "Upload your resume";
      }
    }

    // organisation-specific validation
    if (formData.role === "organisation") {
      if (!organisationFormData.biodata.trim()) {
        errors.biodata = "Enter your organisation bio";
      }
    }

    // remove empty errors
    Object.keys(errors).forEach((key) => {
      if (!errors[key]) {
        delete errors[key];
      }
    });

    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (isValid) {
      setFormState((prev) => ({ ...prev, loading: true }));

      // build role-specific payload as FormData to support file upload via multipart/form-data
      const payload = new FormData();
      payload.append("name", formData.fullName);
      payload.append("email", formData.email);
      payload.append("password", formData.password);
      payload.append("role", formData.role);

      if (formData.role === "volunteer") {
        payload.append("ageGroup", volunteerFormData.ageGroup);
        if (volunteerFormData.resume) {
          payload.append("resume", volunteerFormData.resume);
        }
      }
      if (formData.role === "organisation") {
        payload.append("biodata", organisationFormData.biodata);
      }

      const result = await signUp(payload);

      console.log("Payload:", payload);

      if (result.success) {
        if (result.approvalStatus && result.approvalStatus !== "approved") {
          setRedirectConfig({
            path: "/pending-approval",
            state: { status: result.approvalStatus },
          });
          setFormState((prev) => ({ ...prev, loading: false, success: true }));
          return;
        }

        setRedirectConfig(null);
        setFormState((prev) => ({ ...prev, loading: false, success: true }));
      } else {
        setFormState((prev) => ({
          ...prev,
          loading: false,
          errors: {
            ...prev.errors,
            submit: result.error || "Signup failed. Please try again.",
          },
        }));
      }
    }
  };

  // after hitting submit button and succesfully signup,
  // before directing to user's dashboard, render Welcome Abroad for 2.5 secs
  if (formState.success) {
    return (
      <WelcomeAbroad
        role={formData.role}
        redirectTo={redirectConfig?.path}
        redirectState={redirectConfig?.state}
      />
    );
  }

  return (
    <main className="signup-page">
      <section className="signup-panel">
        {/* upper left VolunteerConnect badge */}
        <div className="signup-brand-row">
          <Badge
            icon="V"
            name="VolunteerConnect"
            subtitle="COMMUNITY PLATFORM"
          />
        </div>

        {/* middle left text paragraph */}
        <div className="signup-panel-copy">
          <h1>Join thousands making a difference.</h1>
          <p>
            Create your free account and start connecting with meaningful
            volunteer opportunities today.
          </p>
        </div>
      </section>

      <section className="signup-content">
        <div className="signup-form-shell">
          {/* back home button */}
          <Link to="/" className="signup-back-link">
            <ArrowBigLeft /> Back Home
          </Link>

          {/* create account header */}
          <div className="signup-header">
            <h2>Create Account</h2>
            <p>Join thousands in finding a purpose in doing good.</p>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            {/* role selection */}
            <div className="signup-role-section">
              <label className="signup-field-label">I am a</label>
              <div className="signup-role-buttons">
                {/* volunteer button */}
                <button
                  type="button"
                  onClick={() => handleRoleChange("volunteer")}
                  className={
                    formData.role === "volunteer"
                      ? "signup-role active"
                      : "signup-role"
                  }
                >
                  <UserCheck className="signup-role-icon" />
                  <span className="signup-role-label">Volunteer</span>
                </button>

                {/* organisation button */}
                <button
                  type="button"
                  onClick={() => handleRoleChange("organisation")}
                  className={
                    formData.role === "organisation"
                      ? "signup-role active"
                      : "signup-role"
                  }
                >
                  <Building2 className="signup-role-icon" />
                  <span className="signup-role-label">Organisation</span>
                </button>
              </div>

              {formState.errors.role && (
                <p className="signup-field-error">
                  <AlertCircle className="signup-error-icon" />
                  {formState.errors.role}
                </p>
              )}
            </div>

            {/* full name */}
            <div className="signup-field">
              <label className="signup-field-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={
                  formState.errors.fullName
                    ? "signup-input error"
                    : "signup-input"
                }
                placeholder="Enter your full name"
              />

              {formState.errors.fullName && (
                <p className="signup-field-error">
                  <AlertCircle className="signup-error-icon" />
                  {formState.errors.fullName}
                </p>
              )}
            </div>

            {/* email */}
            <div className="signup-field">
              <label className="signup-field-label">Email Address</label>
              <div className="signup-input-wrapper">
                <Mail className="signup-input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={
                    formState.errors.email
                      ? "signup-input has-icon error"
                      : "signup-input has-icon"
                  }
                  placeholder="Enter your email"
                />
              </div>

              {formState.errors.email && (
                <p className="signup-field-error">
                  <AlertCircle className="signup-error-icon" />
                  {formState.errors.email}
                </p>
              )}
            </div>

            {/* password */}
            <div className="signup-field">
              <label className="signup-field-label">Password</label>
              <div className="signup-input-wrapper">
                <Lock className="signup-input-icon" />
                <input
                  type={formState.showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className={
                    formState.errors.password
                      ? "signup-input has-icon has-toggle error"
                      : "signup-input has-icon has-toggle"
                  }
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormState((prev) => ({
                      ...prev,
                      showPassword: !prev.showPassword,
                    }))
                  }
                  className="signup-password-toggle"
                >
                  {formState.showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              {/* Password Requirements Checklist */}
              {(passwordFocused || formData.password.length > 0) && (
                <ul className="signup-password-checklist">
                  {passwordRequirements.map((req, index) => (
                    <li
                      key={index}
                      className={`checklist-item ${req.met ? "valid" : "invalid"}`}
                    >
                      {req.met ? (
                        <Check className="checklist-icon check" size={14} />
                      ) : (
                        <X className="checklist-icon cross" size={14} />
                      )}
                      <span>{req.label}</span>
                    </li>
                  ))}
                </ul>
              )}

              {formState.errors.password && (
                <p className="signup-field-error">
                  <AlertCircle className="signup-error-icon" />
                  {formState.errors.password}
                </p>
              )}
            </div>

            {/* volunteer-specific fields */}
            {formData.role === "volunteer" && (
              <div className="signup-role-fields">
                {/* age group */}
                <div className="signup-field">
                  <label className="signup-field-label">Age Group</label>
                  <select
                    name="ageGroup"
                    value={volunteerFormData.ageGroup}
                    onChange={handleVolunteerChange}
                    className={
                      formState.errors.ageGroup
                        ? "signup-input signup-select error"
                        : "signup-input signup-select"
                    }
                  >
                    <option value="" disabled>
                      Select your age group
                    </option>
                    <option value="21-30">21 - 30</option>
                    <option value="31-40">31 - 40</option>
                    <option value="41-50">41 - 50</option>
                    <option value="51-60">51 - 60</option>
                    <option value="60+">60+</option>
                  </select>

                  {formState.errors.ageGroup && (
                    <p className="signup-field-error">
                      <AlertCircle className="signup-error-icon" />
                      {formState.errors.ageGroup}
                    </p>
                  )}
                </div>

                {/* resume upload */}
                <div className="signup-field">
                  <label className="signup-field-label">Resume (PDF)</label>
                  <label
                    className={
                      formState.errors.resume
                        ? "signup-file-upload error"
                        : "signup-file-upload"
                    }
                  >
                    <Upload className="signup-file-icon" />
                    <span>
                      {volunteerFormData.resume
                        ? volunteerFormData.resume.name
                        : "Upload your resume"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="signup-file-input"
                    />
                  </label>

                  {formState.errors.resume && (
                    <p className="signup-field-error">
                      <AlertCircle className="signup-error-icon" />
                      {formState.errors.resume}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* organisation-specific fields */}
            {formData.role === "organisation" && (
              <div className="signup-role-fields">
                <div className="signup-field">
                  <label className="signup-field-label">Organisation Bio</label>
                  <textarea
                    name="biodata"
                    value={organisationFormData.biodata}
                    onChange={handleOrgChange}
                    className={
                      formState.errors.biodata
                        ? "signup-input signup-textarea error"
                        : "signup-input signup-textarea"
                    }
                    placeholder="Tell us about your organisation..."
                    rows={4}
                  />
                  {formState.errors.biodata && (
                    <p className="signup-field-error">
                      <AlertCircle className="signup-error-icon" />
                      {formState.errors.biodata}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* submit button */}
            <button
              type="submit"
              className="signup-submit"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="signup-submit-loader" />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            {/* 'already have an account' login link */}
            <p className="signup-login-prompt">
              Already have an account? <Link to="/login">Log in.</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
};

export default SignUp;
