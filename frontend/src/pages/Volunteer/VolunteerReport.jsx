import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Send } from "lucide-react";
import ReportMadeCard from "../../components/ReportMadeCard";
import { opportunityViolationCategory } from "../../lib/report";
import { useReportStore } from "../../store/useReportStore";


const VolunteerReport = () => {
 
  const {
    createReport,
    getPreviousReports,
    previousReports,
    isPreviousReportsLoading,
  } = useReportStore();

  useEffect(() => {
    getPreviousReports();
  }, [getPreviousReports]);

  const [formData, setFormData] = useState({
    opportunityViolationType: "",
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

    if (!formData.opportunityViolationType) {
      newErrors.opportunityViolationType = "Please select a violation type";
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

  const handleSubmit = async(e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const submissionData = {
      opportunityViolationType: formData.opportunityViolationType.trim(),
      title: formData.title.trim(),
      details: formData.details.trim(),
    };

    // TODO: backend integration for createReport in useReportStore.js
    try {
      await createReport(submissionData); 

    } catch(error) {
      console.error(
        "Unexpected report submission error:",
        err
      );

      toast.error(
        "Something went wrong while submitting report."
      );
    }
  };

  return (
    <div className="volunteer-report-page">
      {/* report header */}
      <section className="volunteer-report-hero">
        <div>
          <p>REPORT</p>
          <h1>Submit a report</h1>
          <span>
            Report any issues or concerns you encounter while using the
            platform.
          </span>
        </div>
      </section>

      {/* report form section */}
      <section className="volunteer-report-panel">
        <div className="volunteer-report-header">
          <div>
            <h2>Report Form</h2>
            <p>Fill out the details below to submit your report to admin.</p>
          </div>
        </div>

        <form className="volunteer-report-form" onSubmit={handleSubmit}>
          {/* violation type selection */}
          <div className="volunteer-report-field">
            <label className="volunteer-report-field-label">
              Violation Type
            </label>
            <select
              name="opportunityViolationType"
              value={formData.opportunityViolationType}
              onChange={handleInputChange}
              className={
                errors.opportunityViolationType
                  ? "volunteer-report-input volunteer-report-select error"
                  : "volunteer-report-input volunteer-report-select"
              }
            >
              <option value="" disabled>
                Select a violation type
              </option>
              {opportunityViolationCategory.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {errors.opportunityViolationType && (
              <p className="volunteer-report-field-error">
                <AlertCircle className="volunteer-report-error-icon" />
                {errors.opportunityViolationType}
              </p>
            )}
          </div>

          {/* report title */}
          <div className="volunteer-report-field">
            <label className="volunteer-report-field-label">Report Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={
                errors.title
                  ? "volunteer-report-input error"
                  : "volunteer-report-input"
              }
              placeholder="Briefly describe the issue"
            />

            {errors.title && (
              <p className="volunteer-report-field-error">
                <AlertCircle className="volunteer-report-error-icon" />
                {errors.title}
              </p>
            )}
          </div>

          {/* report details */}
          <div className="volunteer-report-field">
            <label className="volunteer-report-field-label">
              Report Details
            </label>
            <textarea
              name="details"
              value={formData.details}
              onChange={handleInputChange}
              className={
                errors.details
                  ? "volunteer-report-input volunteer-report-textarea error"
                  : "volunteer-report-input volunteer-report-textarea"
              }
              placeholder="Provide a full description of the event or concern..."
              rows={5}
            />

            {errors.details && (
              <p className="volunteer-report-field-error">
                <AlertCircle className="volunteer-report-error-icon" />
                {errors.details}
              </p>
            )}
          </div>

          {/* submit button */}
          <button
            type="submit"
            className="volunteer-report-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="volunteer-report-submit-loader" />
                Sending...
              </>
            ) : (
              <>
                <Send className="volunteer-report-submit-icon" />
                Send Report
              </>
            )}
          </button>
        </form>
      </section>

      {/* previous reports section */}
      <section className="volunteer-report-previous">
        <div className="volunteer-report-header">
          <div>
            <h2>
              Previous Reports
            </h2>
            <p>
              View your submitted reports and their current status.
            </p>
          </div>
        </div>

        <div className="volunteer-report-list">
          {isPreviousReportsLoading ? (
            <div className="volunteer-report-empty">
              Loading previous reports...
            </div>
          ) : previousReports.length === 0 ? (
            <div className="volunteer-report-empty">
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

export default VolunteerReport;
