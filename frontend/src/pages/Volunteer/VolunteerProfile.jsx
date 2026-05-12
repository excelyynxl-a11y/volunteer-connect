import React, { useMemo } from 'react'
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileCheck,
  LayoutDashboard,
  Mail,
  Pencil,
  Search,
  User,
} from 'lucide-react'
import VolunteerSidebar from '../../components/VolunteerSidebar'
import VolunteerHoursCard from '../../components/VolunteerHoursCard'
import VolunteerTopbar from '../../components/VolunteerTopbar'
import { formatApprovalStatus, getInitials } from '../../lib/utils'
import { useVolunteerProfileData } from '../../hooks/useVolunteerProfileData'
import './VolunteerProfile.css'

// Volunteer profile page
const VolunteerProfile = () => {
  const {
    volunteerId,
    profileData,
    participationHistory,
    totalVolunteerHours,
    isLoading,
    loadError,
  } = useVolunteerProfileData()

  // Derived display values
  const volunteerInitials = useMemo(
    () => getInitials(profileData.fullName),
    [profileData.fullName]
  )
  const approvalLabel = useMemo(
    () => formatApprovalStatus(profileData.approvalStatus),
    [profileData.approvalStatus]
  )
  const profileSummary = profileData.biodata || 'No profile summary provided yet.'

  const displaySkills = Array.isArray(profileData.skills) ? profileData.skills : []

  const displayAvailabilitySlots = Array.isArray(profileData.availability)
    ? profileData.availability
    : []

  // Sidebar navigation
  const sidebarNavItems = useMemo(
    () => [
      { label: 'Dashboard', href: '/volunteer-dashboard', icon: LayoutDashboard },
      { label: 'Discover', href: '/opportunities', icon: Search },
      { label: 'Applications', href: '/applications', icon: FileCheck },
      {
        label: 'My Profile',
        href: `/volunteer-profile?id=${volunteerId}`,
        icon: User,
        isActive: true,
      },
      { label: 'Availability', href: '/edit-profile', icon: Calendar },
      { label: 'History', href: '/volunteer-history', icon: Clock },
    ],
    [volunteerId]
  )

  // Loading state
  if (isLoading) {
    return (
      <main className="volunteer-profile-layout">
        <section className="volunteer-profile-content">
          <div className="profile-panel">
            <p>Loading volunteer profile...</p>
          </div>
        </section>
      </main>
    )
  }

  // Error state
  if (loadError) {
    return (
      <main className="volunteer-profile-layout">
        <section className="volunteer-profile-content">
          <div className="profile-panel">
            <p>{loadError}</p>
          </div>
        </section>
      </main>
    )
  }

  // Main profile layout
  return (
    <main className="volunteer-profile-layout">
      <VolunteerSidebar
        accountLabel="Volunteer Member"
        fullName={profileData.fullName || 'Volunteer Member'}
        initials={volunteerInitials}
        navItems={sidebarNavItems}
        sidebarClassName="volunteer-profile-sidebar"
      />

      <section className="volunteer-profile-content">
        <VolunteerTopbar />

        {/* Profile hero section */}
        <section className="profile-hero">
          <div className="profile-avatar-large">{volunteerInitials}</div>

          <div className="profile-hero-text">
            <p>PUBLIC VOLUNTEER PROFILE</p>
            <h1>{profileData.fullName || 'Volunteer Profile'}</h1>
            <span>{profileSummary}</span>

            <div className="profile-info-pills">
              <InfoPill icon={Mail} text={profileData.email || 'No email available'} />
            </div>
          </div>

          <a className="edit-profile-button" href={`/edit-profile?id=${volunteerId}`}>
            <Pencil size={18} />
            Edit Profile
          </a>
        </section>

        {/* Summary metrics section */}
        <section className="summary-grid">
          <SummaryCard icon={Clock} label="Total Volunteer Hours" value={totalVolunteerHours} />
          <SummaryCard
            icon={CheckCircle2}
            label="Past Participation"
            value={String(participationHistory.length)}
          />
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
                  value={profileData.fullName || 'Not provided'}
                  icon={User}
                />
                <DetailCard
                  label="Email Address"
                  value={profileData.email || 'Not provided'}
                  icon={Mail}
                />
                <DetailCard
                  label="Age Group"
                  value={profileData.ageGroup || 'Not provided'}
                  icon={User}
                />
              </div>

              <div className="past-participation-card">
                <span>Profile Summary</span>
                <p>{profileSummary}</p>
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
                {participationHistory.length > 0 ? (
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
                        <button type="button" aria-label="View participation details">
                          <ChevronRight size={18} />
                        </button>
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

            <VolunteerHoursCard totalVolunteerHours={totalVolunteerHours} />
          </div>
        </section>
      </section>
    </main>
  )
}

// Reusable UI helpers
function InfoPill({ icon: IconComponent, text }) {
  return (
    <span className="info-pill">
      <IconComponent size={15} />
      {text}
    </span>
  )
}

function SummaryCard({ icon: IconComponent, label, value }) {
  return (
    <div className="summary-card">
      <div className="summary-icon">
        <IconComponent size={20} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function DetailCard({ icon: IconComponent, label, value }) {
  return (
    <div className="profile-detail-card">
      <div className="detail-icon">
        <IconComponent size={18} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default VolunteerProfile
