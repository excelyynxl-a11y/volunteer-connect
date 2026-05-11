import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  return (
    <header className="site-navbar">
      <Link to="/" className="site-brand" aria-label="VolunteerConnect home">
        <div className="site-brand-mark">V</div>
        <div className="site-brand-details">
          <p className="site-brand-name">VolunteerConnect</p>
          <span className="site-brand-subtitle">COMMUNITY PLATFORM</span>
        </div>
      </Link>

      <nav className="site-nav-links" aria-label="Primary navigation">
        <NavLink to="/vision">Vision & Mission</NavLink>
        <NavLink to="/about">About Us</NavLink>
        <NavLink to="/opportunities">Opportunities</NavLink>
        <a href="/#how-it-works">How It Works</a>
      </nav>

      <div className="site-nav-actions">
        <Link to="/login" className="site-nav-button outlined">
          Log In
        </Link>
        <Link to="/sign-up" className="site-nav-button primary">
          Sign Up Free
        </Link>
      </div>
    </header>
  )
}

export default Navbar
