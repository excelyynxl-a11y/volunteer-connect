import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Auth.css'

const SignUp = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Volunteer')

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('Signup:', role, email, password)
  }

  return (
    <div className="auth-screen">
      <aside className="auth-sidebar">
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

        <span className="eyebrow">STEP 1 OF 3</span>
        <h2>I want to</h2>
        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>

        <div className="role-buttons">
          {['Volunteer', 'Organization'].map((item) => (
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

          <button className="primary-btn" type="submit">
            Continue
          </button>
        </form>

        <div className="social-row">
          <span>or sign up with</span>
          <div>
            <button className="social-button" type="button">
              Google
            </button>
            <button className="social-button" type="button">
              Facebook
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SignUp
