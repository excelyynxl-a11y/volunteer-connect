import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Send } from "lucide-react";
import toast from "react-hot-toast";
import ReportMadeCard from "../../components/ReportMadeCard";
import { opportunityViolationCategory } from "../../lib/report";
import { useReportStore } from "../../store/useReportStore";
import { useApplicationStore } from "../../store/useApplicationStore";

const VolunteerReport = () => {
  const {
    createReport,
    getPreviousReports,
    previousReports,
    isPreviousReportsLoading,
  } = useReportStore();

  const { applications, getMyApplications } = useApplicationStore();

  useEffect(() => {
    getPreviousReports();
    getMyApplications();
  }, [getPreviousReports, getMyApplications]);

  // TODO: integrate with useApplicationStore.js to get all opportunity that volunteer has applied to 
  const reportedOpportunities = applications
    .filter((app) => app.opportunityId?._id)
    .reduce((acc, app) => {
      const opp = app.opportunityId;
      if (!acc.find((o) => o._id === opp._id)) {
        acc.push(opp);
      }
      return acc;
    }, []);

  const [formData, setFormData] = useState({
    reportedOpportunityId: "",
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

    if (!formData.reportedOpportunityId) {
      newErrors.reportedOpportunityId =
        "Please select the opportunity you are reporting";
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const submissionData = {
      reportType: "OpportunityViolation",
      reportedOpportunityId: formData.reportedOpportunityId,
      opportunityViolationType: formData.opportunityViolationType,
      title: formData.title.trim(),
      details: formData.details.trim(),
    };

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
    <div className="volunteer-report-page">
      {/* report header */}
      <section className="volunteer-report-hero">
        <div>
          <p>REPORT</p>
          <h1>Submit a report</h1>
          <span>
            Report an opportunity that you've attended to admin.
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
          {/* reported opportunity selection */}
          <div className="volunteer-report-field">
            <label className="volunteer-report-field-label">
              Reported Opportunity
            </label>
            <select
              name="reportedOpportunityId"
              value={formData.reportedOpportunityId}
              onChange={handleInputChange}
              className={
                errors.reportedOpportunityId
                  ? "volunteer-report-input volunteer-report-select error"
                  : "volunteer-report-input volunteer-report-select"
              }
            >
              <option value="" disabled>
                Select the opportunity to report
              </option>
              {reportedOpportunities.map((opp) => (
                <option key={opp._id} value={opp._id}>
                  {opp.title}
                </option>
              ))}
            </select>

            {errors.reportedOpportunityId && (
              <p className="volunteer-report-field-error">
                <AlertCircle className="volunteer-report-error-icon" />
                {errors.reportedOpportunityId}
              </p>
            )}
          </div>

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
