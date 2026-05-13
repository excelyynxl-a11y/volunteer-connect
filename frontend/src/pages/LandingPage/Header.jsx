import React from 'react'
import { Link } from 'react-router-dom'
import './Header.css'
import { landingPageNavItems } from '../../lib/data'
import Badge from '../../components/Badge'

const Header = () => {

  // smooth scroll down to navigated section
  const handleNavClick = (e, href) => {
    e.preventDefault()
    const id = href.replace('#', '')
    const target = document.getElementById(id)
    const navbar = document.querySelector('.site-navbar')
    if (target && navbar) {
      const navbarHeight = navbar.offsetHeight
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight
      window.scrollTo({ top: targetTop, behavior: 'smooth' })
    }
  }

  return (
    <header className="site-navbar">
      <Link to="/" className="site-brand" aria-label="VolunteerConnect home">
        <Badge
            icon="V"
            name="VolunteerConnect"
            subtitle="COMMUNITY PLATFORM"
        />

      </Link>

      {/* navigation links */}
      <nav className="site-nav-links" aria-label="Landing page navigation">
          {landingPageNavItems.map((item, key) => (
              <a 
                  key={key} 
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
              >
                  {item.name}
              </a>
          ))}
      </nav>

      {/* login signup buttons */}
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
