import React from 'react'
import './HowItWorkCard.css';

const HowItWorkCard = ({ step, title, text }) => {
  return (
    <article className="workflow-card">
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
