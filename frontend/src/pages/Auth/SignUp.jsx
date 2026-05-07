import React, { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import './Auth.css'

const SignUp = () => {
  const [role, setRole] = useState('Volunteer')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('Signup:', { role, ...formData })
  }

  return (
    <main className="auth-screen">
      <section className="auth-sidebar">
        <div className="brand-block">
          <div className="brand-mark">V</div>
          <div>
            <p className="brand-name">VolunteerConnect</p>
            <span className="brand-subtitle">COMMUNITY PLATFORM</span>
          </div>
        </div>

        <h1>Join thousands making a difference.</h1>
        <p>
          Create your free account and start connecting with meaningful
          volunteer opportunities today.
        </p>

        <div className="feature-list">
          <p>Browse verified opportunities</p>
          <p>Track your volunteer hours</p>
          <p>Message organizations directly</p>
          <p>Build your impact portfolio</p>
        </div>
      </section>

      <section className="auth-content">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} aria-hidden="true" />
          Back to home
        </Link>

        <span className="eyebrow">Step 1 of 3</span>
        <h2>Create account</h2>
        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>

        <div className="role-buttons" aria-label="Choose account type">
          <button
            type="button"
            className={role === 'Volunteer' ? 'role active' : 'role'}
            onClick={() => setRole('Volunteer')}
          >
            Volunteer
          </button>
          <button
            type="button"
            className={role === 'Organization' ? 'role active' : 'role'}
            onClick={() => setRole('Organization')}
          >
            Organization
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email address
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              required
            />
          </label>

          <button type="submit" className="primary-btn">
            Continue
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        </form>
      </section>
    </main>
  )
}

export default SignUp
