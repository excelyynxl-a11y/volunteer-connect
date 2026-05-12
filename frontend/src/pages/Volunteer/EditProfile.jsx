import React, { useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  Clock,
  History,
  LayoutDashboard,
  Plus,
  User,
  Users,
} from 'lucide-react'
import { axiosInstance } from '../../lib/axios'
import VolunteerSidebar from '../../components/VolunteerSidebar'
import VolunteerHoursCard from '../../components/VolunteerHoursCard'
import VolunteerTopbar from '../../components/VolunteerTopbar'
import { formatApprovalStatus, getInitials } from '../../lib/utils'
import { useVolunteerProfileData } from '../../hooks/useVolunteerProfileData'
import './EditProfile.css'

// Initial form state
const initialEditableProfile = {
  name: '',
  email: '',
  ageGroup: '',
  biodata: '',
}

// Static form options
const ageGroupOptions = ['21-30', '31-40', '41-50', '51-60', '60+']

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const times = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
]

const skillOptions = [
  'Communication',
  'Event Support',
  'First Aid',
  'Food Distribution',
  'Fundraising',
  'Teaching',
  'Teamwork',
  'Others',
]

const availabilityPreferenceOptions = [
  { label: 'Available', value: 'available' },
  { label: 'Preferred', value: 'preferred' },
]

// Volunteer edit profile page
const EditProfile = () => {
  // Shared volunteer profile data
  const {
    volunteerId,
    profileData,
    participationHistory,
    totalVolunteerHours,
    isLoading,
    loadError,
  } = useVolunteerProfileData()

  // Local editable form state
  const [editableProfile, setEditableProfile] = useState(initialEditableProfile)
  const [availability, setAvailability] = useState({
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    preference: 'available',
  })
  const [availabilitySlots, setAvailabilitySlots] = useState([])
  const [showFullHistory, setShowFullHistory] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState('')
  const [otherSkill, setOtherSkill] = useState('')
  const [skillList, setSkillList] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  // Sync fetched profile data into editable form state
  useEffect(() => {
    setEditableProfile((currentProfile) => ({
      ...currentProfile,
      name: profileData.fullName ?? '',
      email: profileData.email ?? '',
      ageGroup: profileData.ageGroup ?? '',
      biodata: profileData.biodata ?? '',
    }))

    setSkillList(Array.isArray(profileData.skills) ? profileData.skills : [])

    setAvailabilitySlots(
      Array.isArray(profileData.availability) ? profileData.availability : []
    )

    setSaveMessage('')
  }, [profileData])

  // Derived display values
  const volunteerInitials = useMemo(
    () => getInitials(editableProfile.name),
    [editableProfile.name]
  )
  const sidebarNavItems = useMemo(
    () => [
      {
        label: 'Edit Profile',
        href: `/edit-profile?id=${volunteerId}`,
        icon: LayoutDashboard,
        isActive: true,
      },
      { label: 'Dashboard', href: '/volunteer-dashboard', icon: Users },
      { label: 'Availability', href: `/edit-profile?id=${volunteerId}`, icon: Calendar },
      { label: 'History', href: `/edit-profile?id=${volunteerId}`, icon: History },
    ],
    [volunteerId]
  )

  // Form field handlers
  const handleEditableProfileChange = (event) => {
    const { name, value } = event.target
    setEditableProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }))
    setSaveError('')
    setSaveMessage('')
  }

  // Availability handlers
  const handleAvailabilityChange = (event) => {
    const { name, value } = event.target
    setAvailability((currentAvailability) => ({
      ...currentAvailability,
      [name]: value,
    }))
  }

  const addAvailability = () => {
    const { dayOfWeek, startTime, endTime, preference } = availability

    if (!dayOfWeek || !startTime || !endTime) {
      return
    }
    
    if (startTime >= endTime) {
      setSaveError("End time must be later than start time.");
      setSaveMessage("");
      return;
    }

    const newSlot = {
      dayOfWeek,
      startTime,
      endTime,
      preference,
    }

    setAvailabilitySlots((currentSlots) => [...currentSlots, newSlot])

    setAvailability({
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      preference: 'available',
    })

    setSaveError('')
    setSaveMessage('')
  }

  // Skills handlers
  const addSkill = () => {
    const skillToAdd = selectedSkill === 'Others' ? otherSkill.trim() : selectedSkill

    if (!skillToAdd || skillList.includes(skillToAdd)) {
      return
    }

    setSkillList((currentSkills) => [...currentSkills, skillToAdd])
    setSelectedSkill('')
    setOtherSkill('')
    setSaveError('')
    setSaveMessage('')
  }

  // Profile save handler
  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setSaveError('')
    setSaveMessage('')

    try {
      const response = await axiosInstance.put(`/volunteer/profile/${volunteerId}`, {
        fullName: editableProfile.name,
        ageGroup: editableProfile.ageGroup,
        biodata: editableProfile.biodata,
        skills: skillList,
        availability: availabilitySlots,
      })

      const updatedProfile = response.data?.data ?? {}

      setEditableProfile((currentProfile) => ({
        ...currentProfile,
        name: updatedProfile.name ?? currentProfile.name,
        email: updatedProfile.email ?? currentProfile.email,
        ageGroup: updatedProfile.ageGroup ?? currentProfile.ageGroup,
        biodata: updatedProfile.biodata ?? currentProfile.biodata,
      }))
      setSkillList(Array.isArray(updatedProfile.skills) ? updatedProfile.skills : skillList)
      setAvailabilitySlots(
        Array.isArray(updatedProfile.availability) ? updatedProfile.availability : availabilitySlots
      )
      setSaveMessage('Profile details saved successfully.')
    } catch (saveError) {
      setSaveError(saveError.response?.data?.message || 'Failed to save profile details.')
    } finally {
      setIsSaving(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <main className="edit-profile-layout">
        <section className="edit-profile-content">
          <div className="profile-panel">
            <p>Loading edit profile...</p>
          </div>
        </section>
      </main>
    )
  }

  // Error state
  if (loadError && !editableProfile.name && !editableProfile.email) {
    return (
      <main className="edit-profile-layout">
        <section className="edit-profile-content">
          <div className="profile-panel">
            <p>{loadError}</p>
          </div>
        </section>
      </main>
    )
  }

  // Main edit profile layout
  return (
    <main className="edit-profile-layout">
      <VolunteerSidebar
        accountLabel="Volunteer"
        fullName={editableProfile.name || 'Volunteer'}
        initials={volunteerInitials}
        navItems={sidebarNavItems}
        sidebarClassName="edit-profile-sidebar"
      />

      <section className="edit-profile-content">
        <VolunteerTopbar />

        {/* Profile hero section */}
        <section className="profile-hero">
          <div>
            <p>VOLUNTEER PROFILE</p>
            <h1>Manage your self profile</h1>
            <span>Keep your details, skills, availability, and volunteer history up to date.</span>
          </div>
          <button type="submit" form="edit-profile-form" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </section>

        {/* Main profile form section */}
        <form id="edit-profile-form" className="profile-panel" onSubmit={handleSubmit}>
          <div className="profile-panel-header">
            <div>
              <h2>Self Profile</h2>
              <p>Information shown to organisations when you apply for opportunities.</p>
            </div>
            <div className="status-pill">
              <User size={17} />
              {formatApprovalStatus(profileData.approvalStatus)}
            </div>
          </div>

          {loadError ? <p>{loadError}</p> : null}
          {saveError ? <p>{saveError}</p> : null}
          {saveMessage ? <p>{saveMessage}</p> : null}

          {/* Profile details fields */}
          <div className="profile-form-grid">
            <label className="edit-profile-field">
              <span>Full Name</span>
              <input
                name="name"
                type="text"
                value={editableProfile.name}
                onChange={handleEditableProfileChange}
              />
            </label>

            <label className="edit-profile-field">
              <span>Email Address</span>
              <input
                name="email"
                type="email"
                value={editableProfile.email}
                onChange={handleEditableProfileChange}
                readOnly
              />
            </label>

            <label className="edit-profile-field">
              <span>Age Group</span>
              <select
                name="ageGroup"
                value={editableProfile.ageGroup}
                onChange={handleEditableProfileChange}
              >
                <option value="">Select an age group</option>
                {ageGroupOptions.map((ageGroup) => (
                  <option key={ageGroup} value={ageGroup}>
                    {ageGroup}
                  </option>
                ))}
              </select>
            </label>

            {/* Skills section */}
            <div className="edit-profile-field">
              <span>Skills</span>
              <div className="skills-input-row">
                <select
                  name="selectedSkill"
                  value={selectedSkill}
                  onChange={(event) => setSelectedSkill(event.target.value)}
                >
                  <option value="">Select a skill</option>
                  {skillOptions.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>

                <button className="add-skill-button" type="button" onClick={addSkill}>
                  <Plus size={18} />
                  Add
                </button>
              </div>

              {selectedSkill === 'Others' ? (
                <input
                  name="otherSkill"
                  type="text"
                  value={otherSkill}
                  onChange={(event) => setOtherSkill(event.target.value)}
                  placeholder="Type your other skill"
                />
              ) : null}

              {skillList.length > 0 ? (
                <ul className="skill-list" aria-label="Added skills">
                  {skillList.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              ) : (
                <p>No skills added yet.</p>
              )}
            </div>

            <label className="edit-profile-field full-width">
              <span>Profile Summary</span>
              <textarea
                name="biodata"
                value={editableProfile.biodata}
                onChange={handleEditableProfileChange}
                rows="4"
                maxLength="1000"
                placeholder="Write a short introduction about your volunteering interests and experience."
              />
            </label>
          </div>

          {/* Availability section */}
          <section className="availability-card" aria-labelledby="availability-title">
            <div className="section-heading">
              <div>
                <h2 id="availability-title">Availability</h2>
                <p>Add the days and times you can volunteer.</p>
              </div>
              <Clock size={22} />
            </div>

            <div className="availability-row">
              <select name="dayOfWeek" value={availability.dayOfWeek} onChange={handleAvailabilityChange}>
                <option value="">Day of Week</option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>

              <select
                name="startTime"
                value={availability.startTime}
                onChange={handleAvailabilityChange}
              >
                <option value="">Start Time</option>
                {times.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>

              <select
                name="endTime"
                value={availability.endTime}
                onChange={handleAvailabilityChange}
              >
                <option value="">End Time</option>
                {times.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>

              <select
                name="preference"
                value={availability.preference}
                onChange={handleAvailabilityChange}
              >
                {availabilityPreferenceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <button className="add-slot-button" type="button" onClick={addAvailability}>
                <Plus size={18} />
                Add
              </button>
            </div>

            {availabilitySlots.length > 0 ? (
              <ul className="slot-list" aria-label="Added availability">
                {availabilitySlots.map((slot, index) => (
                  <li key={`${slot.dayOfWeek}-${slot.startTime}-${slot.endTime}-${slot.preference}-${index}`}>
                    {slot.dayOfWeek}, {slot.startTime} - {slot.endTime} (
                    {slot.preference === 'preferred' ? 'Preferred' : 'Available'})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No availability added yet.</p>
            )}
          </section>

          {/* Participation history and hours section */}
          <section className="profile-bottom-grid">
            <div className="history-card">
              <div className="section-heading">
                <div>
                  <h2>Past Participation</h2>
                  <p>Recent activities counted toward your volunteer hours.</p>
                </div>
                <span className="count-badge">{participationHistory.length}</span>
              </div>

              <div className="history-list">
                {participationHistory.length > 0 ? (
                  participationHistory.map((activity) => (
                    <p key={activity.id}>
                      {activity.title} | {activity.date} | {activity.hours}
                    </p>
                  ))
                ) : (
                  <p>No completed volunteer participation found yet.</p>
                )}
              </div>

              <button
                className="text-link"
                type="button"
                onClick={() => setShowFullHistory((currentValue) => !currentValue)}
              >
                {showFullHistory ? 'Hide Full History' : 'View Full History'}
              </button>

              {showFullHistory ? (
                <div className="full-history-panel" aria-label="Full participation history">
                  {participationHistory.map((activity) => (
                    <article className="history-entry" key={activity.id}>
                      <div>
                        <h3>{activity.title}</h3>
                        <p>{activity.organisation}</p>
                      </div>
                      <div className="history-entry-meta">
                        <span>{activity.date}</span>
                        <strong>{activity.hours}</strong>
                        <em>{activity.status}</em>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>

            <VolunteerHoursCard totalVolunteerHours={totalVolunteerHours} />
          </section>
        </form>
      </section>
    </main>
  )
}

export default EditProfile
