import React from 'react'

const VolunteerHoursCard = ({ totalVolunteerHours }) => {
  return (
    <section className="hours-card">
      <span>Total Volunteer Hours</span>
      <strong>{totalVolunteerHours}</strong>
      <p>Planned duration across completed opportunities.</p>
    </section>
  )
}

export default VolunteerHoursCard
