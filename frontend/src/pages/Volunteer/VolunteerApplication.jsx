import { ClipboardList, FileCheck, History, Clock } from "lucide-react";

const VolunteerApplication = () => {
  return (
    <div className="volunteer-application-page">
        {/* application header */}
        <section className="volunteer-application-hero">
            <div>
            <p>APPLICATIONS</p>
            <h1>My applications</h1>
            <span>
                View the status, states, and history of applications you have
                submitted for opportunities.
            </span>
            </div>
        </section>

      <section className="volunteer-application-panel">

        {/* application history header */}
        <div className="volunteer-application-header">
          <div>
            <h2>Application History</h2>
            <p>
              Track all your opportunity applications and their current status.
            </p>
          </div>
        </div>

        <div className="volunteer-application-body">
          <div className="volunteer-application-coming-soon">
            <div className="volunteer-application-coming-soon-icon">
              <Clock size={32} />
            </div>
            <h3>Coming Soon</h3>
            <p>
              The applications feature is currently under development. You will
              soon be able to view the status, states, and history of all your
              submitted applications.
            </p>

            <div className="volunteer-application-preview">
              <div className="volunteer-application-preview-item">
                <ClipboardList size={18} />
                <div>
                  <strong>Application Status</strong>
                  <span>
                    Track whether your application is pending, approved, or
                    rejected
                  </span>
                </div>
              </div>
              <div className="volunteer-application-preview-item">
                <FileCheck size={18} />
                <div>
                  <strong>Opportunity Details</strong>
                  <span>
                    View details of the opportunity you applied for
                  </span>
                </div>
              </div>
              <div className="volunteer-application-preview-item">
                <History size={18} />
                <div>
                  <strong>Application History</strong>
                  <span>
                    Review past applications and their outcomes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VolunteerApplication;
