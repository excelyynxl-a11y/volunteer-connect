import React, { useRef, useEffect } from 'react'
import { howItWorkSteps } from '../../lib/data'
import HowItWorkCard from '../../components/HowItWorkCard'
import './HowItWork.css'

const HowItWork = () => {
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
    <section id="howitwork" className="workflow-section">
      {/* How-It-Work header */}
      <div className="section-header light">
        <span className="eyebrow">
          HOW IT WORKS
        </span>
        <h2>
          Getting started takes less than 5 minutes. Here's how volunteers
          and organizations connect.
        </h2>
      </div>

      {/* steps card display */}
      <div className="workflow-grid">
        {howItWorkSteps.map((item, index) => (
          <div
            key={item.step}
            ref={(el) => (cardRefs.current[index] = el)}
            className="animate-in"
            style={{ transitionDelay: `${index * 0.25}s` }}
          >
            <HowItWorkCard
              step={item.step}
              title={item.title}
              text={item.text}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default HowItWork
