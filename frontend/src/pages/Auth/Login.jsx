import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Auth.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Volunteer')

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('Login:', role, email, password)
  }

  return (
    <div className="auth-screen login-screen">
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

      <main className="auth-content">
        <Link to="/" className="back-link">
          Back to home
        </Link>

        <span className="eyebrow">WELCOME BACK</span>
        <h2>Log In</h2>
        <p>
          Don't have an account? <Link to="/sign-up">Sign up free</Link>
        </p>

        <div className="role-buttons centered">
          {['Volunteer', 'Organization', 'Admin'].map((item) => (
            <button
              className={role === item ? 'role active' : 'role'}
              key={item}
              onClick={() => setRole(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email address
            <input
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </label>

          <label>
            Password
            <input
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              type="password"
              value={password}
            />
          </label>

          <div className="form-meta">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>REMEMBER ME</span>
            </label>
            <Link to="/">Forgot password?</Link>
          </div>

          <button className="primary-btn" type="submit">
            Sign In
          </button>
        </form>
      </main>
    </div>
  )
}

export default Login
