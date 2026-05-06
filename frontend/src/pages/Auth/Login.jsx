import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Login.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Login:', email, password)
  }

  return (
    <main className="auth-screen login-screen">
      <aside className="auth-sidebar dark-sidebar">
        <div className="brand-block">
          <div className="brand-mark">V</div>
          <div>
            <p className="brand-name">VolunteerConnect</p>
            <span className="brand-subtitle">COMMUNITY PLATFORM</span>
          </div>
        </div>

        <h1>Good to have you back.</h1>
        <p>
          Sign in to access your volunteer dashboard, manage applications, and
          continue making a difference.
        </p>

        <div className="feature-list">
          <p>Browse 76+ verified opportunities</p>
          <p>Track your volunteer hours</p>
          <p>Message organizations directly</p>
          <p>Build your impact portfolio</p>
        </div>
      </aside>

      <section className="auth-content">
        <Link to="/" className="back-link">
          Back to home
        </Link>

        <span className="auth-eyebrow">WELCOME BACK</span>
        <h2>Log In</h2>
        <p>
          Don't have an account? <Link to="/sign-up">Sign up free</Link>
        </p>

        <div className="role-buttons centered" aria-label="Account type">
          <button type="button" className="role active">
            Volunteer
          </button>
          <button type="button" className="role">
            Organization
          </button>
          <button type="button" className="role">
            Admin
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email address
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <div className="form-meta">
            <label className="checkbox-label">
              <input type="checkbox" />
              REMEMBER ME
            </label>
            <Link to="/">Forgot password?</Link>
          </div>

          <button type="submit" className="primary-btn">
            Sign In
          </button>
        </form>
      </section>
    </main>
  )
}

export default Login
