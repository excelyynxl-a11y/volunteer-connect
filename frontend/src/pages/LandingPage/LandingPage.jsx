import React from 'react'
import Header from './Header'
import Hero from './Hero'
import AboutUs from './AboutUs'
import HowItWork from './HowItWork'
import Footer from './Footer'
import './LandingPage.css'

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="page-shell">
        <Header />
        <Hero />
        <AboutUs />
        <HowItWork />
        <Footer />
      </div>
    </div>
  )
}

export default LandingPage
