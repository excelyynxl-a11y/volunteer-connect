import React, { useRef, useEffect } from 'react'
import { aboutUsCards } from '../../lib/data'
import AboutUsCard from '../../components/AboutUsCard'
import './AboutUs.css'

const AboutUs = () => {
  const cardRefs = useRef([])

  // subtle fade-in effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.25 }
    )

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section className="about-section" id="about">
      <div className="section-header">
        <span className="eyebrow">ABOUT US</span>
        <h2>
          VolunteerConnect is built on a foundation of three core pillars
          that guide everything we do.
        </h2>
      </div>

      <div className="about-grid">
        {aboutUsCards.map((card, index) => (
          <div
            key={card.title}
            ref={(el) => (cardRefs.current[index] = el)}
            className="animate-in"
            style={{ transitionDelay: `${index * 0.25}s` }}
          >
            <AboutUsCard
              icon={card.icon}
              title={card.title}
              text={card.text}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default AboutUs
