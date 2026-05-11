import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import {
  AlertCircle,
  ArrowBigLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import Badge from "../../components/Badge";
import WelcomeAbroad from "./WelcomeAbroad";
import { validateEmail } from "../../lib/utils";
import { useAuthStore } from "../../store/useAuthStore";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [formState, setFormState] = useState({
    loading: false,
    errors: {},
    showPassword: false,
    success: false,
  });

  const [userRole, setUserRole] = useState("volunteer");

  const { login, isLoggingIn } = useAuthStore();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formState.errors[name]) {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [name]: "" },
      }));
    }
  };

  const validateForm = () => {
    const errors = {
      email: validateEmail(formData.email),
      password: !formData.password ? "Password is required" : "",
    };

    Object.keys(errors).forEach((key) => {
      if (!errors[key]) {
        delete errors[key];
      }
    });

    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const isValid = validateForm();

    if (isValid) {
      setFormState((prev) => ({ ...prev, loading: true }));

      const result = await login(formData);

      if (result.success) {
        setUserRole(result.role || "volunteer");
        setFormState((prev) => ({ ...prev, loading: false, success: true }));
      } else {
        setFormState((prev) => ({
          ...prev,
          loading: false,
          errors: {
            ...prev.errors,
            submit: result.error || "Login failed. Please try again.",
          },
        }));
      }
    }
  };

  if (formState.success) {
    return <WelcomeAbroad role={userRole} />;
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand-row">
          <Badge
            icon="V"
            name="VolunteerConnect"
            subtitle="COMMUNITY PLATFORM"
          />
        </div>

        <div className="login-panel-copy">
          <h1>Good to have you back.</h1>
          <p>
            Sign in to access your dashboard and continue making a difference!
          </p>
        </div>
      </section>

      <section className="login-content">
        <div className="login-form-shell">
          <Link to="/" className="login-back-link">
            <ArrowBigLeft /> Back Home
          </Link>

          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Log in to keep your volunteer journey moving.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-field-label">Email Address</label>
              <div className="login-input-wrapper">
                <Mail className="login-input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={
                    formState.errors.email
                      ? "login-input has-icon error"
                      : "login-input has-icon"
                  }
                  placeholder="Enter your email"
                />
              </div>
              {formState.errors.email && (
                <p className="login-field-error">
                  <AlertCircle className="login-error-icon" />
                  {formState.errors.email}
                </p>
              )}
            </div>

            <div className="login-field">
              <label className="login-field-label">Password</label>
              <div className="login-input-wrapper">
                <Lock className="login-input-icon" />
                <input
                  type={formState.showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={
                    formState.errors.password
                      ? "login-input has-icon has-toggle error"
                      : "login-input has-icon has-toggle"
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
                  className="login-password-toggle"
                >
                  {formState.showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {formState.errors.password && (
                <p className="login-field-error">
                  <AlertCircle className="login-error-icon" />
                  {formState.errors.password}
                </p>
              )}
            </div>

            {formState.errors.submit && (
              <p className="login-field-error">
                <AlertCircle className="login-error-icon" />
                {formState.errors.submit}
              </p>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="login-submit-loader" />
                  Loading...
                </>
              ) : (
                "Log In"
              )}
            </button>

            <p className="login-signup-prompt">
              Don't have an account? <Link to="/sign-up">Sign up.</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Login;
