import React from 'react'
import { Link } from 'react-router-dom'
import './AboutUs.css'

const values = [
  {
    icon: '🤝',
    title: 'Community First',
    description:
      'We believe in the power of collective action. Together, volunteers and organizations create meaningful, lasting change.',
  },
  {
    icon: '✨',
    title: 'Transparency',
    description:
      'Every opportunity is verified, every volunteer is trusted, and every hour logged is real. Integrity drives our platform.',
  },
  {
    icon: '🌱',
    title: 'Growth & Impact',
    description:
      'We empower volunteers to grow while organizations scale their impact. Success means measurable community change.',
  },
  {
    icon: '💪',
    title: 'Accessibility',
    description:
      'Volunteering should be accessible to all. Our platform removes barriers so anyone can find their perfect opportunity.',
  },
]

const team = [
  {
    name: 'Sarah Chen',
    role: 'Founder & CEO',
    description:
      'Former non-profit director with 10 years of community engagement experience.',
  },
  {
    name: 'Ahmad Rahman',
    role: 'Head of Partnerships',
    description:
      'Works closely with organizations to ensure their needs are met and volunteers are matched perfectly.',
  },
  {
    name: 'Priya Nair',
    role: 'Community Manager',
    description:
      'Passionate about connecting people and building a thriving volunteer community.',
  },
]

const stats = [
  { value: '2,847', label: 'Hours Volunteered' },
  { value: '348', label: 'Active Volunteers' },
  { value: '42', label: 'Partner Organizations' },
  { value: '76+', label: 'Live Opportunities' },
]

const AboutUs = () => {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About VolunteerConnect</h1>
          <p>
            We're on a mission to transform volunteer engagement and create a
            world where community service is easy, rewarding, and accessible to
            everyone.
          </p>
        </div>
      </section>

      <section className="about-section">
        <div className="about-section-content">
          <h2>Our Story</h2>
          <p>
            VolunteerConnect was born from a simple observation: passionate
            volunteers struggled to find meaningful opportunities, while
            non-profits struggled to manage their volunteer programs
            effectively.
          </p>
          <p>
            Frustrated by inefficient spreadsheets, missed communications, and
            untracked volunteer hours, our founder Sarah Chen decided to build a
            better way. What started as a local initiative has grown into a
            platform serving thousands of volunteers and dozens of organizations
            across the region.
          </p>
          <p>
            Today, VolunteerConnect bridges the gap between people who want to
            make a difference and organizations ready to welcome them. We've
            helped volunteers log over 2,847 hours, supported 42 organizations,
            and built a community of 348 active volunteers all working toward
            the same goal: social impact.
          </p>
        </div>
      </section>

      <section className="about-section about-values-section">
        <div className="about-section-header">
          <h2>Our Values</h2>
          <p>These principles guide every decision we make.</p>
        </div>

        <div className="about-values-grid">
          {values.map((value) => (
            <article className="about-value-card" key={value.title}>
              <div className="about-value-icon">{value.icon}</div>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section about-team-section">
        <div className="about-section-header">
          <h2>Meet Our Team</h2>
          <p>Dedicated advocates for community change.</p>
        </div>

        <div className="about-team-grid">
          {team.map((member) => (
            <article className="about-team-card" key={member.name}>
              <div className="about-team-avatar">
                {member.name
                  .split(' ')
                  .map((name) => name[0])
                  .join('')}
              </div>
              <h3>{member.name}</h3>
              <p className="about-team-role">{member.role}</p>
              <p className="about-team-bio">{member.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section about-impact-section">
        <div className="about-section-header">
          <h2>By The Numbers</h2>
          <p>The impact of our community, in real numbers.</p>
        </div>

        <div className="about-impact-grid">
          {stats.map((stat) => (
            <div className="about-impact-card" key={stat.label}>
              <div className="about-impact-number">{stat.value}</div>
              <div className="about-impact-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="about-cta">
        <h2>Ready to Make Your Impact?</h2>
        <p>
          Join thousands of volunteers already making a difference in their
          communities.
        </p>
        <div className="about-cta-buttons">
          <Link to="/sign-up" className="about-btn about-btn-primary">
            Get Started Now
          </Link>
          <Link to="/volunteer-dashboard" className="about-btn about-btn-outlined">
            Explore Opportunities
          </Link>
        </div>
      </section>
    </div>
  )
}

export default AboutUs
