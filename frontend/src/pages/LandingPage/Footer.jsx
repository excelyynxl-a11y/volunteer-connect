import React from 'react'
import './Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <section className="footer-section">
        <div>
            <h2>
                Ready to Make Your Mark?
            </h2>
            <p>
                Join hundreds of volunteers and dozens of organizations already
                making a difference in their communities.
            </p>
        </div>

        {/* volunteer and organisation sign up options */}
        <div className="footer-actions">
            <Link to="/sign-up" className="btn primary">
                Sign Up as Volunteer
            </Link>
            <Link to="/sign-up" className="btn outlined">
                Register Your Organization
            </Link>
        </div>
    </section>
  )
}

export default Footer