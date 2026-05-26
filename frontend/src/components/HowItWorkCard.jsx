import React from 'react'
import './HowItWorkCard.css';

const HowItWorkCard = ({ step, title, text, image }) => {
  return (
    <article className="workflow-card">
      {image && (
        <div className="workflow-card-image">
          <img src={image} alt={title} loading="lazy" />
        </div>
      )}
      <div className="step-circle">
        {step}
      </div>
      <h4>
        {title}
      </h4>
      <p>
        {text}
      </p>
    </article>
  )
}

export default HowItWorkCard
