import React from 'react'

const AboutUsCard = ({
    title,
    initial,
    subtitle
}) => {
  return (
    <div>AboutUsCard</div>
    <div className="activity-card" key={title}>
        <div className="activity-chip">
            {initial}
        </div>
        <div>
            <p className="activity-title">{item.title}</p>
            <p className="activity-subtitle">{item.subtitle}</p>
        </div>
        <span className={`status ${item.statusClass}`}>
            {item.status}
        </span>
    </div>
  )
}

export default AboutUsCard