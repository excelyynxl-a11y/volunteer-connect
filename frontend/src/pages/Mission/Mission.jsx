import React from 'react'
import { Link } from 'react-router-dom'
import './Mission.css'

const commitments = [
  {
    icon: '🎯',
    title: 'Intentional Matching',
    description:
      'We match volunteers to opportunities based on skills, interests, and availability - ensuring fulfilling experiences for everyone.',
  },
  {
    icon: '🛡️',
    title: 'Verified & Trusted',
    description:
      'Every organization is verified, every volunteer is screened, and every opportunity is authentic. Trust is non-negotiable.',
  },
  {
    icon: '📊',
    title: 'Transparent Tracking',
    description:
      'Real-time hour logging, impact dashboards, and verified records that volunteers own and can share with pride.',
  },
  {
    icon: '💬',
    title: 'Seamless Communication',
    description:
      'Direct messaging, scheduling, and updates keep volunteers and organizations connected every step of the way.',
  },
  {
    icon: '🏆',
    title: 'Recognition & Growth',
    description:
      'Celebrate achievements with badges, testimonials, and opportunities to grow leadership skills and make bigger impact.',
  },
  {
    icon: '🌱',
    title: 'Continuous Improvement',
    description:
      'We listen to feedback and continuously improve the platform to serve our community better.',
  },
]

const forVolunteers = [
  'Browse hundreds of verified opportunities in one place',
  'Find roles that match your skills, interests, and schedule',
  'Apply instantly and get matched with organizations',
  'Track your volunteer hours and build your social impact portfolio',
  'Receive recognition and grow your leadership skills',
  'Connect with like-minded community members',
]

const forOrganizations = [
  'Reach thousands of qualified, engaged volunteers',
  'Post opportunities and manage applications seamlessly',
  'Screen volunteers and approve matches easily',
  'Track volunteer hours and measure program impact',
  'Communicate directly with your volunteer team',
  'Build long-term relationships with committed partners',
]

const Mission = () => {
  return (
    <div className="mission-page">
      <nav className="mission-nav">
        <Link to="/" className="mission-back-link">
          Home
        </Link>
      </nav>

      <section className="mission-hero">
        <div className="mission-hero-content">
          <h1>Our Mission</h1>
          <p>
            To connect volunteers with meaningful opportunities and support
            community organizations in their efforts to create positive change.
          </p>
        </div>
      </section>

      <section className="mission-section">
        <div className="mission-section-content">
          <h2>How We Live Our Mission</h2>
          <p>
            Our mission isn't just a statement - it's a daily commitment. We
            work tirelessly to bridge volunteers and organizations with
            technology that's intuitive, transparent, and purpose-driven.
          </p>
          <p>
            We believe the best solutions emerge when we listen deeply to both
            sides: volunteers seeking meaningful work and organizations yearning
            for dedicated support.
          </p>
        </div>
      </section>

      <section className="mission-section commitments-section">
        <div className="mission-section-header">
          <h2>Our Six Core Commitments</h2>
        </div>

        <div className="commitments-grid">
          {commitments.map((commitment) => (
            <article className="commitment-card" key={commitment.title}>
              <div className="commitment-icon">{commitment.icon}</div>
              <h3>{commitment.title}</h3>
              <p>{commitment.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mission-section dual-benefits">
        <div className="benefits-row">
          <div className="benefits-card">
            <h3>For Volunteers</h3>
            <ul className="benefits-list">
              {forVolunteers.map((benefit) => (
                <li key={benefit}>
                  <span className="checkmark">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="benefits-card">
            <h3>For Organizations</h3>
            <ul className="benefits-list">
              {forOrganizations.map((benefit) => (
                <li key={benefit}>
                  <span className="checkmark">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mission-cta">
        <h2>Ready to Make a Difference?</h2>
        <p>
          Whether you're looking to volunteer or seeking dedicated support for
          your organization, we're here to help.
        </p>
        <div className="mission-cta-buttons">
          <Link to="/sign-up" className="mission-btn mission-btn-primary">
            Get Started
          </Link>
          <Link to="/vision" className="mission-btn mission-btn-outlined">
            Learn Our Vision
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Mission
