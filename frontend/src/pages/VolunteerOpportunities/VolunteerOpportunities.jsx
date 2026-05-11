import React, { useState } from 'react'
import './VolunteerOpportunities.css'

const opportunities = [
  {
    id: 1,
    organization: 'Helping Hands MY',
    organizationInitials: 'HH',
    title: 'Community Food Drive Helper',
    description:
      'Help sort, pack, and distribute food packages to low-income families across the Klang Valley. You will work alongside our team to ensure families receive nutritious meals.',
    location: 'Kuala Lumpur',
    hoursPerWeek: '4 hrs/week',
    frequency: 'Weekends',
    tags: ['Food', 'Community', 'Weekends'],
    spotsLeft: 8,
    status: 'Open',
    statusColor: '#2ecc71',
  },
  {
    id: 2,
    organization: 'Green Earth Society',
    organizationInitials: 'GE',
    title: 'Beach Cleanup Volunteer',
    description:
      'Join our monthly coastal cleanup crew to remove plastic and debris from Port Dickson beaches. Protect marine ecosystems while building community connections.',
    location: 'Port Dickson',
    hoursPerWeek: '6 hrs/event',
    frequency: 'Monthly',
    tags: ['Environment', 'Monthly', 'Outdoors'],
    spotsLeft: 20,
    status: 'Open',
    statusColor: '#2ecc71',
  },
  {
    id: 3,
    organization: 'Kids First Foundation',
    organizationInitials: 'KF',
    title: 'Literacy Tutor',
    description:
      'Support underprivileged children aged 7-12 in developing foundational reading and writing skills. Sessions are flexible and can be conducted online or in-person.',
    location: 'Petaling Jaya',
    hoursPerWeek: '2 hrs/week',
    frequency: 'Flexible',
    tags: ['Education', 'Children', 'Flexible'],
    spotsLeft: 5,
    status: 'Open',
    statusColor: '#2ecc71',
  },
  {
    id: 4,
    organization: 'Paws & Claws KL',
    organizationInitials: 'PC',
    title: 'Animal Shelter Assistant',
    description:
      'Care for rescued cats and dogs at our shelter - feeding, grooming, socializing, and helping with adoptions. Perfect for animal lovers looking to make a direct impact.',
    location: 'Kuala Lumpur',
    hoursPerWeek: '3 hrs/week',
    frequency: 'Weekdays',
    tags: ['Animals', 'Weekly', 'Indoors'],
    spotsLeft: 3,
    status: 'Filling Fast',
    statusColor: '#f39c12',
  },
  {
    id: 5,
    organization: 'Senior Link Malaysia',
    organizationInitials: 'SM',
    title: 'Elderly Companion Visitor',
    description:
      'Visit elderly residents in care homes for meaningful conversation, light activities, and companionship. Combat isolation while learning valuable life stories.',
    location: 'Shah Alam',
    hoursPerWeek: '2 hrs/week',
    frequency: 'Weekdays',
    tags: ['Elderly', 'Healthcare', 'Weekdays'],
    spotsLeft: 12,
    status: 'Open',
    statusColor: '#2ecc71',
  },
  {
    id: 6,
    organization: 'EduReach NGO',
    organizationInitials: 'EN',
    title: 'STEM Workshop Facilitator',
    description:
      'Facilitate hands-on science, technology, engineering and maths workshops for secondary school students. Help inspire the next generation of innovators.',
    location: 'Kuala Lumpur',
    hoursPerWeek: '4 hrs/week',
    frequency: 'Weekends',
    tags: ['STEM', 'Education', 'Weekends'],
    spotsLeft: 6,
    status: 'Open',
    statusColor: '#2ecc71',
  },
  {
    id: 7,
    organization: 'Foodbank Kuala Lumpur',
    organizationInitials: 'FK',
    title: 'Warehouse Operations Volunteer',
    description:
      'Support daily warehouse operations - receiving food donations, quality-checking items, organising inventory. Essential work that keeps our operations running smoothly.',
    location: 'Kuala Lumpur',
    hoursPerWeek: '5 hrs/week',
    frequency: 'Flexible',
    tags: ['Food', 'Warehouse', 'Flexible'],
    spotsLeft: 10,
    status: 'Open',
    statusColor: '#2ecc71',
  },
  {
    id: 8,
    organization: 'River Warriors MY',
    organizationInitials: 'RW',
    title: 'River Cleanup & Monitoring',
    description:
      'Participate in our monthly urban river cleanup along the Klang River. Collect litter, monitor water quality, and work toward cleaner waterways.',
    location: 'Subang Jaya',
    hoursPerWeek: 'One-off',
    frequency: 'Monthly',
    tags: ['Environment', 'Outdoors', 'Monthly'],
    spotsLeft: 15,
    status: 'Open',
    statusColor: '#2ecc71',
  },
]

const categories = [
  { name: 'EDUCATION', count: 14 },
  { name: 'ENVIRONMENT', count: 11 },
  { name: 'FOOD & HUNGER', count: 9 },
  { name: 'ANIMAL WELFARE', count: 8 },
  { name: 'HEALTH & WELLNESS', count: 12 },
  { name: 'COMMUNITY', count: 22 },
]

const VolunteerOpportunities = () => {
  const [selectedCategory, setSelectedCategory] = useState(null)

  return (
    <div className="volunteer-opps-page">
      <header className="volunteer-opps-header">
        <div className="volunteer-opps-hero">
          <span className="volunteer-opps-eyebrow">
            VOLUNTEER OPPORTUNITIES
          </span>
          <h1>Find Your Next Cause</h1>
          <p>
            Browse 76 verified opportunities from 42 organizations. Filter by
            cause, location, and availability to find your perfect match.
          </p>

          <div className="volunteer-opps-search-filters">
            <select className="volunteer-opps-filter-select">
              <option>All Categories</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select className="volunteer-opps-filter-select">
              <option>All Locations</option>
              <option>Kuala Lumpur</option>
              <option>Petaling Jaya</option>
              <option>Shah Alam</option>
              <option>Port Dickson</option>
            </select>
            <button className="volunteer-opps-search-btn">Search</button>
          </div>
        </div>
      </header>

      <div className="volunteer-opps-container">
        <aside className="volunteer-opps-filter-sidebar">
          <div className="volunteer-opps-filter-section">
            <h3>CATEGORY</h3>
            {categories.map((cat) => (
              <label className="volunteer-opps-filter-checkbox" key={cat.name}>
                <input
                  checked={selectedCategory === cat.name}
                  onChange={() =>
                    setSelectedCategory(
                      selectedCategory === cat.name ? null : cat.name,
                    )
                  }
                  type="checkbox"
                />
                <span>{cat.name}</span>
                <span className="volunteer-opps-count">{cat.count}</span>
              </label>
            ))}
          </div>

          <div className="volunteer-opps-filter-section">
            <h3>COMMITMENT</h3>
            {['4-8 HRS/WEEK', 'ONE-OFF EVENTS', 'LONG-TERM'].map((item) => (
              <label className="volunteer-opps-filter-checkbox" key={item}>
                <input type="checkbox" />
                <span>{item}</span>
              </label>
            ))}
          </div>

          <div className="volunteer-opps-filter-section">
            <h3>AVAILABILITY</h3>
            {['WEEKDAYS', 'WEEKENDS', 'EVENINGS', 'FLEXIBLE'].map((item) => (
              <label className="volunteer-opps-filter-checkbox" key={item}>
                <input type="checkbox" />
                <span>{item}</span>
              </label>
            ))}
          </div>

          <div className="volunteer-opps-filter-section">
            <h3>STATUS</h3>
            <label className="volunteer-opps-filter-checkbox">
              <input type="checkbox" />
              <span>OPEN</span>
              <span className="volunteer-opps-count">68</span>
            </label>
            <label className="volunteer-opps-filter-checkbox">
              <input type="checkbox" />
              <span>FILLING FAST</span>
              <span className="volunteer-opps-count">8</span>
            </label>
          </div>

          <button className="volunteer-opps-clear-filters">
            x Clear all filters
          </button>
        </aside>

        <main className="volunteer-opps-list">
          <div className="volunteer-opps-list-header">
            <span>8 opportunities found</span>
            <select className="volunteer-opps-sort-select">
              <option>Most Recent</option>
              <option>Most Spots Available</option>
              <option>Trending</option>
            </select>
          </div>

          <div className="volunteer-opps-grid">
            {opportunities.map((opp) => (
              <article className="volunteer-opps-card" key={opp.id}>
                <div className="volunteer-opps-card-header">
                  <div className="volunteer-opps-org">
                    <div
                      className={`volunteer-opps-avatar ${opp.organizationInitials.toLowerCase()}`}
                    >
                      {opp.organizationInitials}
                    </div>
                    <div>
                      <p className="volunteer-opps-org-name">
                        {opp.organization}
                      </p>
                      <p className="volunteer-opps-org-role">Organization</p>
                    </div>
                  </div>
                  <span
                    className="volunteer-opps-status"
                    style={{ color: opp.statusColor }}
                  >
                    {opp.status}
                  </span>
                </div>

                <h3 className="volunteer-opps-title">{opp.title}</h3>
                <p className="volunteer-opps-description">{opp.description}</p>

                <div className="volunteer-opps-meta">
                  <span>📍 {opp.location}</span>
                  <span>⏱️ {opp.hoursPerWeek}</span>
                  <span>🗓️ {opp.frequency}</span>
                </div>

                <div className="volunteer-opps-tags">
                  {opp.tags.map((tag) => (
                    <span className="volunteer-opps-tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="volunteer-opps-footer">
                  <span className="volunteer-opps-spots">
                    {opp.spotsLeft} spots left
                  </span>
                  <button className="volunteer-opps-apply-btn">Apply →</button>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default VolunteerOpportunities
