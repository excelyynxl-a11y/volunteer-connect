import React from 'react'
import { Link } from 'react-router-dom'
import './Vision.css'

const pillars = [
  {
    icon: '🌍',
    title: 'Global Accessibility',
    description:
      'Volunteer opportunities available to everyone, regardless of background, skill level, or experience.',
  },
  {
    icon: '🤝',
    title: 'Meaningful Connection',
    description:
      'Deep, authentic connections between volunteers and organizations working toward shared values.',
  },
  {
    icon: '📈',
    title: 'Measurable Impact',
    description:
      'Clear visibility into the real-world change created through collective action and dedication.',
  },
  {
    icon: '💪',
    title: 'Empowered Communities',
    description:
      'Strong communities where volunteers feel valued and organizations thrive with engaged support.',
  },
]

const timelineItems = [
  {
    year: '2024',
    title: 'Foundation',
    description:
      'VolunteerConnect launches, connecting first volunteers with local organizations. 100+ hours logged in our first month.',
  },
  {
    year: '2025',
    title: 'Growth',
    description:
      'Scale to 42 partner organizations and 348 active volunteers. 2,847 verified hours logged. Expanding to new regions.',
  },
  {
    year: '2026+',
    title: 'Scale & Impact',
    description:
      'National footprint. Mainstream adoption. Millions of hours logged. Communities transformed through systematic volunteer engagement.',
  },
]

const Vision = () => {
  return (
    <div className="vision-page">
      <section className="vision-hero">
        <div className="vision-hero-content">
          <h1>Our Vision</h1>
          <p>
            To create a world where everyone has the opportunity to volunteer
            and make a positive impact in their community.
          </p>
        </div>
      </section>

      <section className="vision-section">
        <div className="vision-section-content">
          <h2>Why This Vision Matters</h2>
          <p>
            Every individual has the potential to create meaningful change. Yet
            too many passionate people never find their path to impact. At the
            same time, communities struggle with critical needs that volunteers
            could address.
          </p>
          <p>
            Our vision bridges this gap. We imagine a future where the
            connection between desire to help and opportunity to make a
            difference is instant, frictionless, and powerful.
          </p>
          <p>
            When everyone can easily find their place in community service, we
            unlock enormous potential for social good. Neighborhoods become
            stronger. Organizations multiply their impact. Volunteers discover
            purpose and fulfillment.
          </p>
        </div>
      </section>

      <section className="vision-section vision-pillars-section">
        <div className="vision-section-header">
          <h2>Four Pillars of Our Vision</h2>
        </div>

        <div className="vision-pillars-grid">
          {pillars.map((pillar) => (
            <article className="vision-pillar-card" key={pillar.title}>
              <div className="vision-pillar-icon">{pillar.icon}</div>
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="vision-section vision-action">
        <div className="vision-section-header">
          <h2>Our Vision in Action</h2>
          <p>Today's reality. Tomorrow's norm.</p>
        </div>

        <div className="vision-timeline">
          {timelineItems.map((item) => (
            <div className="vision-timeline-item" key={item.year}>
              <div className="vision-timeline-marker">{item.year}</div>
              <div className="vision-timeline-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="vision-cta">
        <h2>Join Our Movement</h2>
        <p>
          Your action today shapes the world of tomorrow. Be part of the change.
        </p>
        <div className="vision-cta-buttons">
          <Link to="/sign-up" className="vision-btn vision-btn-primary">
            Start Volunteering
          </Link>
          <Link to="/mission" className="vision-btn vision-btn-outlined">
            Read Our Mission
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Vision
