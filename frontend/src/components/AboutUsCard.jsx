import React from 'react'
import './AboutUsCard.css';

const AboutUsCard = ({ icon: Icon, title, text }) => {
  return (
    <article className="about-card">
      <div className="about-icon">
        <Icon size={24} strokeWidth={2.2} />
      </div>
      <h3>
        {title}
      </h3>
      <p>
        {text}
      </p>
    </article>
  )
}

export default AboutUsCard
