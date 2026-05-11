import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Login.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Volunteer')
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('Login:', role, email, password, rememberMe)
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand-row">
          <div className="login-brand-mark">V</div>
          <div>
            <p className="login-brand-name">VolunteerConnect</p>
            <span className="login-brand-subtitle">COMMUNITY PLATFORM</span>
          </div>
        </div>

        <div className="login-panel-copy">
          <h1>Good to have you back.</h1>
          <p>
            Sign in to access your volunteer dashboard, manage applications,
            and continue making a difference.
          </p>
        </div>

        <div className="login-feature-list">
          <p>Browse 76+ verified opportunities</p>
          <p>Track your volunteer hours</p>
          <p>Message organizations directly</p>
          <p>Build your impact portfolio</p>
        </div>
      </section>

      <section className="login-content">
        <div className="login-form-shell">
          <Link to="/" className="login-back-link">
            ? Back to home
          </Link>

          <span className="login-eyebrow">WELCOME BACK</span>
          <h2>Log In</h2>

          <p className="login-signup-prompt">
            Don't have an account? <Link to="/sign-up">Sign up free ?</Link>
          </p>

          <div className="login-role-buttons">
            {['Volunteer', 'Organization', 'Admin'].map((item) => (
              <button
                key={item}
                type="button"
                className={role === item ? 'login-role active' : 'login-role'}
                onClick={() => setRole(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
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

            <div className="login-form-meta">
              <label className="login-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>REMEMBER ME</span>
              </label>

              <Link to="/" className="login-forgot-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="login-submit">
              Sign In ?
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

export default Login
