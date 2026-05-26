import React from 'react'
import './LandingPage.css'

const Hero = () => {
  return (
    <section className="hero-section" id="hero">
      <div className="section-header hero-fade-in">
        <span className="eyebrow">
          WELCOME TO VOLUNTEERCONNECT
        </span>
        <h2>
          Make a Difference in Your Community
        </h2>
        <p>
          Connect with meaningful volunteer opportunities and non-profit
          organizations. Track your impact, schedule your time, and build a
          better world - one hour at a time.
        </p>
        <div className="hero-image">
          <img src="/vc2.png" alt="Volunteer community impact" loading="eager" />
        </div>
      </div>
    </section>
  )
}

export default Hero
