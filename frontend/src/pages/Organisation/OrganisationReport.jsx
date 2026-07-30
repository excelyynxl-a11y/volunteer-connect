import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Send } from "lucide-react";
import ReportMadeCard from "../../components/ReportMadeCard";
import { volunteerViolationCategory } from "../../lib/report";
import { useReportStore } from "../../store/useReportStore";

const OrganisationReport = () => {
  const {
    createReport,
    getPreviousReports,
    previousReports,
    isPreviousReportsLoading,
  } = useReportStore();

  useEffect(() => {
    getPreviousReports(undefined, "UserViolation");
  }, [getPreviousReports]);

  const [formData, setFormData] = useState({
    userViolationType: "",
    title: "",
    details: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userViolationType) {
      newErrors.userViolationType = "Please select a violation type";
    }
    if (!formData.title.trim()) {
      newErrors.title = "Report title is required";
    }
    if (!formData.details.trim()) {
      newErrors.details = "Report details are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const submissionData = {
      userViolationType: formData.userViolationType.trim(),
      title: formData.title.trim(),
      details: formData.details.trim(),
    };

    // TODO: backend integration for createReport in useReportStore.js
    try {
      await createReport(submissionData);
    } catch (error) {
      console.error("Unexpected report submission error:", error);
      toast.error("Something went wrong while submitting report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="organisation-report-page">
      {/* report header */}
      <section className="organisation-report-hero">
        <div>
          <p>REPORT</p>
          <h1>Submit a report</h1>
          <span>
            Report any issues or concerns you encounter with volunteers on the
            platform.
          </span>
        </div>
      </section>

      {/* report form section */}
      <section className="organisation-report-panel">
        <div className="organisation-report-header">
          <div>
            <h2>
              Report Form
            </h2>
            <p>
              Fill out the details below to submit your report to admin.
            </p>
          </div>
        </div>

        <form className="organisation-report-form" onSubmit={handleSubmit}>
          {/* violation type selection */}
          <div className="organisation-report-field">
            <label className="organisation-report-field-label">
              Violation Type
            </label>
            <select
              name="userViolationType"
              value={formData.userViolationType}
              onChange={handleInputChange}
              className={
                errors.userViolationType
                  ? "organisation-report-input organisation-report-select error"
                  : "organisation-report-input organisation-report-select"
              }
            >
              <option value="" disabled>
                Select a violation type
              </option>
              {volunteerViolationCategory.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {errors.userViolationType && (
              <p className="organisation-report-field-error">
                <AlertCircle className="organisation-report-error-icon" />
                {errors.userViolationType}
              </p>
            )}
          </div>

          {/* report title */}
          <div className="organisation-report-field">
            <label className="organisation-report-field-label">
              Report Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={
                errors.title
                  ? "organisation-report-input error"
                  : "organisation-report-input"
              }
              placeholder="Briefly describe the issue"
            />

            {errors.title && (
              <p className="organisation-report-field-error">
                <AlertCircle className="organisation-report-error-icon" />
                {errors.title}
              </p>
            )}
          </div>

          {/* report details */}
          <div className="organisation-report-field">
            <label className="organisation-report-field-label">
              Report Details
            </label>
            <textarea
              name="details"
              value={formData.details}
              onChange={handleInputChange}
              className={
                errors.details
                  ? "organisation-report-input organisation-report-textarea error"
                  : "organisation-report-input organisation-report-textarea"
              }
              placeholder="Provide a full description of the event or concern..."
              rows={5}
            />

            {errors.details && (
              <p className="organisation-report-field-error">
                <AlertCircle className="organisation-report-error-icon" />
                {errors.details}
              </p>
            )}
          </div>

          {/* submit button */}
          <button
            type="submit"
            className="organisation-report-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="organisation-report-submit-loader" />
                Sending...
              </>
            ) : (
              <>
                <Send className="organisation-report-submit-icon" />
                Send Report
              </>
            )}
          </button>
        </form>
      </section>

      {/* previous reports section */}
      <section className="organisation-report-previous">
        <div className="organisation-report-header">
          <div>
            <h2>Previous Reports</h2>
            <p>View your submitted reports and their current status.</p>
          </div>
        </div>

        <div className="organisation-report-list">
          {isPreviousReportsLoading ? (
            <div className="organisation-report-empty">
              Loading previous reports...
            </div>
          ) : previousReports.length === 0 ? (
            <div className="organisation-report-empty">
              You have not submitted any reports yet.
            </div>
          ) : (
            previousReports.map((report) => (
              <ReportMadeCard key={report._id} report={report} />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default OrganisationReport;
