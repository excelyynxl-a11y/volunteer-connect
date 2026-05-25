import { AlertCircle, FileText, Send, Clock } from "lucide-react";

const VolunteerReport = () => {
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

      <section className="volunteer-report-panel">
        {/* report form header */}
        <div className="volunteer-report-header">
            <div>
                <h2>Report Form</h2>
                <p>Fill out the details below to submit your report to admin.</p>
            </div>
        </div>

        <div className="volunteer-report-body">
          <div className="volunteer-report-coming-soon">
            <div className="volunteer-report-coming-soon-icon">
              <Clock size={32} />
            </div>
            <h3>Coming Soon</h3>
            <p>
              The report feature is currently under development. You will soon
              be able to submit reports regarding any events or concerns you
              face while on the platform.
            </p>

            <div className="volunteer-report-preview">
              <div className="volunteer-report-preview-item">
                <FileText size={18} />
                <div>
                    <strong>Subject</strong>
                    <span>Brief description of the issue</span>
                </div>
              </div>
              <div className="volunteer-report-preview-item">
                <AlertCircle size={18} />
                <div>
                    <strong>Category</strong>
                    <span>Type of report (e.g. Bug, Feedback, Concern)</span>
                </div>
              </div>
              <div className="volunteer-report-preview-item">
                <Send size={18} />
                <div>
                    <strong>Details</strong>
                    <span>Full description of the event or concern</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VolunteerReport;
