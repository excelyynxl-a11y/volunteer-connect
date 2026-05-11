import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import './Header.css'

const Header = () => {
  return (
    <header className="site-navbar">
      <Link to="/" className="site-brand" aria-label="VolunteerConnect home">
        {/* TODO: insert Badge component */}
        {/* <Badge
            icon="V"
            name="VolunteerConnect"
            subtitle="COMMUNITY PLATFORM"
        /> */}

      </Link>

      <nav className="site-nav-links" aria-label="Primary navigation">
        <NavLink to="/vision">
            Vision & Mission
        </NavLink>
        <NavLink to="/about">
            About Us 
        </NavLink>
        <NavLink to="/opportunities">
            Opportunities
        </NavLink>
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

export default Header
