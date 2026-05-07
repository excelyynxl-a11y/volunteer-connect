import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './SignUp.css'

const SignUp = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Volunteer')

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('Signup:', role, email, password)
  }

  return (
    <main className="signup-page">
      <section className="signup-panel">
        <div className="signup-brand-row">
          <div className="signup-brand-mark">V</div>
          <div>
            <p className="signup-brand-name">VolunteerConnect</p>
            <span className="signup-brand-subtitle">COMMUNITY PLATFORM</span>
          </div>
        </div>

        <div className="signup-panel-copy">
          <h1>Join thousands making a difference.</h1>
          <p>
            Create your free account and start connecting with meaningful
            volunteer opportunities today.
          </p>
        </div>

        <div className="signup-feature-list">
          <p>Browse 76+ verified opportunities</p>
          <p>Track your volunteer hours</p>
          <p>Message organizations directly</p>
          <p>Build your impact portfolio</p>
        </div>
      </section>

      <section className="signup-content">
        <div className="signup-form-shell">
          <Link to="/" className="signup-back-link">
            ? Back to home
          </Link>

          <span className="signup-eyebrow">STEP 1 OF 3</span>
          <h2>I want to?</h2>

          <p className="signup-login-prompt">
            Already have an account? <Link to="/login">Log in ?</Link>
          </p>

          <div className="signup-role-buttons">
            <button
              type="button"
              className={role === 'Volunteer' ? 'signup-role active' : 'signup-role'}
              onClick={() => setRole('Volunteer')}
            >
              Volunteer
            </button>
            <button
              type="button"
              className={
                role === 'Organization' ? 'signup-role active' : 'signup-role'
              }
              onClick={() => setRole('Organization')}
            >
              Organization
            </button>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            <label>
              Email address
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            <button type="submit" className="signup-submit">
              Continue ?
            </button>
          </form>

          <div className="signup-social">
            <span>or sign up with</span>
            <div className="signup-social-buttons">
              <button type="button">Google</button>
              <button type="button">Facebook</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default SignUp
