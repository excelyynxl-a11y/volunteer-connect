import { Sparkles, Lightbulb, MapPin, Calendar, Clock, Users, CalendarClock } from "lucide-react";

// Mock data for now. Replace with real data later.
const mockRecommendations = [
  {
    id: "rec-1",
    category: "Education",
    title: "Weekend Reading Buddies",
    description: "Help children build reading confidence through stories and conversation.",
    organisation: "Bright Futures Learning",
    location: "Selangor, Subang Jaya",
    date: "Sunday, 18 Oct 2026",
    time: "9:00 am - 11:00 am",
    spotsLeft: 8,
    applyBefore: "15 Oct 2026",
  },
  {
    id: "rec-2",
    category: "Community",
    title: "Community Food Packing",
    description: "Pack essential food supplies for local families.",
    organisation: "Neighbourhood Care",
    location: "Kuala Lumpur",
    date: "Sunday, 18 Oct 2026",
    time: "2:00 pm - 4:00 pm",
    spotsLeft: 12,
    applyBefore: "15 Oct 2026",
  },
  {
    id: "rec-3",
    category: "Education",
    title: "Digital Skills for Seniors",
    description: "Support seniors with basic smartphone and computer skills.",
    organisation: "Community Learning Hub",
    location: "Selangor, Petaling Jaya",
    date: "Sunday, 25 Oct 2026",
    time: "9:00 am - 12:00 pm",
    spotsLeft: 6,
    applyBefore: "22 Oct 2026",
  },
  {
    id: "rec-4",
    category: "Community",
    title: "Neighbourhood Welcome Day",
    description: "Welcome visitors and help coordinate a community gathering.",
    organisation: "Local Connections",
    location: "Selangor, Shah Alam",
    date: "Sunday, 25 Oct 2026",
    time: "2:00 pm - 5:00 pm",
    spotsLeft: 10,
    applyBefore: "22 Oct 2026",
  },
];

const mockInsight =
  "Your tutoring experience and communication skills suggest Education and Community opportunities.";

const RecommendedOpportunities = ({
  recommendations = mockRecommendations,
  insight = mockInsight,
  onView = () => {},
  onApply = () => {},
}) => {
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
          {recommendations.length} recommendations
        </span>
      </div>

      {insight && (
        <div className="ai-reco-insight">
          <Lightbulb size={18} />
          <span>{insight}</span>
        </div>
      )}

      <div className="ai-reco-grid">
        {recommendations.map((item) => (
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