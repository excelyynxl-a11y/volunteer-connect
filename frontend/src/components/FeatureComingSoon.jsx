import { useId } from "react";
import { Clock3 } from "lucide-react";
import "./FeatureComingSoon.css";

const FeatureComingSoon = ({ eyebrow, title, description }) => {
  const headingId = useId();

  return (
    <section className="feature-coming-soon" aria-labelledby={headingId}>
      <header className="feature-coming-soon-header">
        <span>{eyebrow}</span>
        <h1 id={headingId}>{title}</h1>
        <p>{description}</p>
      </header>

      <div className="feature-coming-soon-panel">
        <div className="feature-coming-soon-icon" aria-hidden="true">
          <Clock3 size={30} />
        </div>
        <h2>Coming Soon</h2>
        <p>
          This feature is currently under development and is not available yet.
        </p>
      </div>
    </section>
  );
};

export default FeatureComingSoon;
