import React from 'react'
import { Link } from 'react-router-dom'
import { Eye, Heart, Target } from 'lucide-react'
import './LandingPage.css'

const activityItems = [
  {
    initial: 'Y',
    title: 'Yiming Xu applied to Community Food Drive',
    subtitle: 'Helping Hands MY - 12 min ago',
    status: 'Pending',
    statusClass: 'pending',
  },
  {
    initial: 'S',
    title: 'Sarah Chen joined Beach Cleanup Volunteer',
    subtitle: 'Green Earth Society - 1 hour ago',
    status: 'Approved',
    statusClass: 'approved',
  },
  {
    initial: 'A',
    title: 'Ahmad Rahman completed Literacy Tutor session',
    subtitle: 'Kids First Foundation - 3 hrs logged',
    status: '+3 hrs',
    statusClass: 'completed',
  },
  {
    initial: 'P',
    title: 'Priya Nair applied to Animal Shelter Assistant',
    subtitle: 'Paws & Claws KL - 5 hours ago',
    status: 'Pending',
    statusClass: 'pending',
  },
]

const purposeCards = [
  {
    icon: Eye,
    title: 'Our Vision',
    text: 'A world where every individual can effortlessly find and contribute to causes they care about - building stronger, more resilient communities through the power of collective action and shared purpose.',
  },
  {
    icon: Target,
    title: 'Our Mission',
    text: 'To bridge the gap between passionate volunteers and impactful non-profit organizations by providing a seamless, transparent platform that simplifies coordination, tracks participation, and celebrates community contribution.',
  },
  {
    icon: Heart,
    title: 'About Us',
    text: 'Founded by community advocates, VolunteerConnect empowers both volunteers and organizations with tools for opportunity discovery, application management, scheduling, and verified hour-logging - all in one trusted platform.',
  },
]

const workflowSteps = [
  {
    step: '1',
    title: 'Create Your Profile',
    text: 'Sign up as a volunteer or organization. Set your availability, skills, and interests to get personalized matches.',
  },
  {
    step: '2',
    title: 'Discover Opportunities',
    text: 'Browse curated volunteer postings from verified non-profits filtered by cause, location, and time commitment.',
  },
  {
    step: '3',
    title: 'Apply & Get Approved',
    text: 'Submit your application in seconds. Organizations review and approve through our dual-approval workflow.',
  },
  {
    step: '4',
    title: 'Track Your Impact',
    text: 'Log hours, earn recognition, and build a verified volunteering history you can share with the world.',
  },
]

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="page-shell">
        <section className="hero-section" id="opportunities">
          <div className="hero-copy">
            <span className="eyebrow">WELCOME TO VOLUNTEERCONNECT</span>
            <h1>Make a Difference in Your Community</h1>
            <p>
              Connect with meaningful volunteer opportunities and non-profit
              organizations. Track your impact, schedule your time, and build a
              better world - one hour at a time.
            </p>

            <div className="hero-actions">
              <Link to="/sign-up" className="btn primary">
                Get Started - It's Free
              </Link>
              <Link to="/opportunities" className="btn secondary">
                Browse Opportunities
              </Link>
            </div>

            <div className="hero-metrics">
              <div>
                <span className="metric-value">348</span>
                <span className="metric-label">ACTIVE VOLUNTEERS</span>
              </div>
              <div>
                <span className="metric-value">42</span>
                <span className="metric-label">ORGANIZATIONS</span>
              </div>
              <div>
                <span className="metric-value">2,847</span>
                <span className="metric-label">HOURS LOGGED</span>
              </div>
            </div>
          </div>

          <div className="hero-panel">
            {activityItems.map((item) => (
              <div className="activity-card" key={item.title}>
                <div className="activity-chip">{item.initial}</div>
                <div>
                  <p className="activity-title">{item.title}</p>
                  <p className="activity-subtitle">{item.subtitle}</p>
                </div>
                <span className={`status ${item.statusClass}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="purpose-section" id="purpose">
          <div className="section-header">
            <span className="eyebrow">OUR PURPOSE</span>
            <h2>
              VolunteerConnect is built on a foundation of three core pillars
              that guide everything we do.
            </h2>
          </div>

          <div className="purpose-grid">
            {purposeCards.map((card) => {
              const Icon = card.icon

              return (
                <article className="purpose-card" key={card.title}>
                  <div className="purpose-icon">
                    <Icon size={24} strokeWidth={2.2} />
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section id="how-it-works" className="workflow-section">
          <div className="section-header light">
            <span className="eyebrow">HOW IT WORKS</span>
            <h2>
              Getting started takes less than 5 minutes. Here's how volunteers
              and organizations connect.
            </h2>
          </div>

          <div className="workflow-grid">
            {workflowSteps.map((item) => (
              <article className="workflow-card" key={item.step}>
                <div className="step-circle">{item.step}</div>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-section">
          <div>
            <h2>Ready to Make Your Mark?</h2>
            <p>
              Join hundreds of volunteers and dozens of organizations already
              making a difference in their communities.
            </p>
          </div>

          <div className="cta-actions">
            <Link to="/sign-up" className="btn primary">
              Sign Up as Volunteer
            </Link>
            <Link to="/sign-up" className="btn outlined">
              Register Your Organization
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default LandingPage
