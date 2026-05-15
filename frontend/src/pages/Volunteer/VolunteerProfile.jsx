import React, { useEffect, useMemo } from 'react'
import {
  Award,
  Calendar,
  CheckCircle2,
  Mail,
  Pencil,
  User,
} from 'lucide-react'
import VolunteerHoursCard from '../../components/VolunteerHoursCard'
import VolunteerTopbar from '../../components/VolunteerTopbar'
import { formatApprovalStatus, getInitials } from '../../lib/utils'
import { useAuthStore } from '../../store/useAuthStore'
import { useVolunteerStore } from '../../store/useVolunteerStore'

// Volunteer profile page
const VolunteerProfile = () => {
  const authUser = useAuthStore((state) => state.authUser)
  const volunteerId = authUser?._id || ''

  const {
    participationHistory,
    totalVolunteerHours,
    isLoading,
    loadError,
    getVolunteerPastOpportunity,
  } = useVolunteerStore()

  useEffect(() => {
    getVolunteerPastOpportunity(volunteerId)
  }, [getVolunteerPastOpportunity, volunteerId])

  // Derived display values
  const volunteerInitials = useMemo(
    () => getInitials(authUser?.name),
    [authUser?.name]
  )
  const approvalLabel = useMemo(
    () => formatApprovalStatus(authUser?.approvalStatus),
    [authUser?.approvalStatus]
  )
  const profileSummary = authUser?.biodata || 'No profile summary provided yet.'

  const displaySkills = Array.isArray(authUser?.skills) ? authUser.skills : []

  const displayAvailabilitySlots = Array.isArray(authUser?.availability)
    ? authUser.availability
    : []

  // Main profile layout
  return (
    <div className="volunteer-profile-page">
      <div className="volunteer-profile-content">
        <VolunteerTopbar />

        {/* Profile hero section */}
        <section className="profile-hero">
          <div className="profile-avatar-large">{volunteerInitials}</div>

          <div className="profile-hero-text">
            <p>PUBLIC VOLUNTEER PROFILE</p>
            <h1>{authUser?.name || 'Volunteer Profile'}</h1>
            <span>{profileSummary}</span>

          </div>

          <a className="edit-profile-button" href="/volunteer-dashboard/edit-profile">
            <Pencil size={18} />
            Edit Profile
          </a>
        </section>

        {/* Main profile content */}
        <section className="profile-main-grid">
          <div className="profile-left-column">
            {/* Profile details section */}
            <section className="profile-panel">
              <div className="profile-panel-header">
                <div>
                  <h2>Profile Details</h2>
                  <p>Information shown to organisations when you apply for opportunities.</p>
                </div>
                <div className="status-pill">
                  <User size={17} />
                  {approvalLabel}
                </div>
              </div>

              <div className="profile-detail-grid">
                <DetailCard
                  label="Full Name"
                  value={authUser?.name || 'Not provided'}
                  icon={User}
                />
                <DetailCard
                  label="Email Address"
                  value={authUser?.email || 'Not provided'}
                  icon={Mail}
                />
                <DetailCard
                  label="Age Group"
                  value={authUser?.ageGroup || 'Not provided'}
                  icon={User}
                />
              </div>
            </section>

            {/* Skills section */}
            <section className="profile-panel">
              <div className="profile-panel-header">
                <div>
                  <h2>Skills</h2>
                  <p>Skills that help organisations understand volunteer suitability.</p>
                </div>
                <Award size={22} />
              </div>

              <div className="skill-list">
                {displaySkills.length > 0 ? (
                  displaySkills.map((skill) => <span key={skill}>{skill}</span>)
                ) : (
                  <p>No skills added yet.</p>
                )}
              </div>
            </section>

            {/* Participation history section */}
            <section className="profile-panel">
              <div className="profile-panel-header">
                <div>
                  <h2>Past Participation</h2>
                  <p>Recent activities counted toward volunteer hours.</p>
                </div>
                <span className="count-badge">{participationHistory.length}</span>
              </div>

              <div className="participation-list">
                {loadError ? (
                  <p>{loadError}</p>
                ) : isLoading ? (
                  <p>Loading past opportunities...</p>
                ) : participationHistory.length > 0 ? (
                  participationHistory.map((activity) => (
                    <article className="participation-item" key={activity.id}>
                      <div className="participation-icon">
                        <CheckCircle2 size={21} />
                      </div>

                      <div className="participation-content">
                        <strong>{activity.title}</strong>
                        <span>{activity.organisation}</span>
                        <p>
                          {activity.date} | {activity.hours}
                        </p>
                      </div>

                      <div className="participation-actions">
                        <span className="completed-pill">{activity.status}</span>
                      </div>
                    </article>
                  ))
                ) : (
                  <p>No completed volunteer participation found yet.</p>
                )}
              </div>
            </section>
          </div>

          <div className="profile-right-column">
            <VolunteerHoursCard totalVolunteerHours={totalVolunteerHours} />

            {/* Availability section */}
            <section className="profile-panel">
              <div className="profile-panel-header">
                <div>
                  <h2>Availability</h2>
                  <p>Preferred volunteering times.</p>
                </div>
                <Calendar size={22} />
              </div>

              <div className="availability-display-list">
                {displayAvailabilitySlots.length > 0 ? (
                  displayAvailabilitySlots.map((slot) => {
                    const statusLabel = slot.preference === 'preferred' ? 'Preferred' : 'Available'

                    return (
                      <div
                        className="availability-display-row"
                        key={`${slot.dayOfWeek}-${slot.startTime}-${slot.endTime}-${slot.preference}`}
                      >
                        <div>
                          <strong>{slot.dayOfWeek}</strong>
                          <span>
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <span
                          className={slot.preference === 'preferred' ? 'preferred-pill' : 'available-pill'}
                        >
                          {statusLabel}
                        </span>
                      </div>
                    )
                  })
                ) : (
                  <p>No availability added yet.</p>
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  )
}

function DetailCard({ icon, label, value }) {
  return (
    <div className="profile-detail-card">
      <div className="detail-icon">
        {React.createElement(icon, { size: 18 })}
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default VolunteerProfile
