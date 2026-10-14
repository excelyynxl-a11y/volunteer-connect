import { Sparkles, Lightbulb, MapPin, Calendar, Clock, Users, CalendarClock } from "lucide-react";

import {
  formatDate,
  formatTime,
} from "../../lib/utils";

const mapRecommendation = (opportunity) => {
  const spotsLeft = Math.max(
    0,
    opportunity.maxVolunteers -
    opportunity.approvedVolunteersCount
  );

  return {
    ...opportunity,
    id: opportunity._id,
    category: opportunity.category?.join(", ") || "Other",
    description: opportunity.details,
    organisation:
      opportunity.organisationId?.name ||
      "Organisation unavailable",
    date: formatDate(opportunity.startAt),
    time: `${formatTime(opportunity.startAt)} - ${formatTime(opportunity.endAt)}`,
    spotsLeft,
    applyBefore: formatDate(
      opportunity.applicationDeadline
    ),
  };
};


const RecommendedOpportunities = ({
  recommendations = [],
  insight = "",
  onView = () => { },
  onApply = () => { },
}) => {
  const displayRecommendations =
    recommendations.map(mapRecommendation);
  return (
    <section className="ai-reco-panel">
      <div className="ai-reco-header">
        <div className="ai-reco-title">
          <Sparkles size={34} className="ai-reco-sparkle" />
          <div>
            <h2>Recommended for you</h2>
            <p>Based on your profile and resume</p>
          </div>
        </div>
        <span className="ai-reco-count">
          {displayRecommendations.length} recommendations
        </span>
      </div>

      {insight && (
        <div className="ai-reco-insight">
          <Lightbulb size={18} />
          <span>{insight}</span>
        </div>
      )}

      <div className="ai-reco-grid">
        {displayRecommendations.map((item) => (
          <article key={item.id} className="ai-reco-card">
            <span className="ai-reco-category">{item.category}</span>
            <h3>{item.title}</h3>
            <p className="ai-reco-desc">{item.description}</p>
            <strong className="ai-reco-org">{item.organisation}</strong>

            <div className="ai-reco-meta">
              <span><MapPin size={14} />{item.location}</span>
              <span><Calendar size={14} />{item.date}</span>
              <span><Clock size={14} />{item.time}</span>
              <span><Users size={14} />{item.spotsLeft} spots left</span>
              <span><CalendarClock size={14} />Apply before {item.applyBefore}</span>
            </div>

            <div className="ai-reco-actions">
              <button type="button" className="ai-reco-view" onClick={() => onView(item)}>
                View
              </button>
              <button type="button" className="ai-reco-apply" onClick={() => onApply(item)}>
                Apply
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default RecommendedOpportunities;