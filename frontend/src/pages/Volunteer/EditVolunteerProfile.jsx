import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Camera,
  Clock,
  Plus,
  User,
  X,
} from 'lucide-react'
import CustomSelect from '../../components/CustomSelect'
import VolunteerTopbar from '../../components/VolunteerTopbar'
import {
  volunteerAgeGroupOptions,
  volunteerAvailabilityDays,
  volunteerAvailabilityPreferenceOptions,
  volunteerAvailabilityTimes,
  volunteerSkillOptions,
} from '../../lib/data'
import {
  getNewAvailabilitySlotError,
  sortAvailabilitySlots,
} from '../../lib/availability'
import { formatApprovalStatus, getInitials } from '../../lib/utils'
import { useAuthStore } from '../../store/useAuthStore'
import { useVolunteerStore } from '../../store/useVolunteerStore'

// Initial form state
const initialEditableProfile = {
  name: '',
  email: '',
  ageGroup: '',
  biodata: '',
}

// Volunteer edit profile page
const EditVolunteerProfile = () => {
  const navigate = useNavigate()
  const authUser = useAuthStore((state) => state.authUser)
  const volunteerId = authUser?._id || ''

  const {
    isUpdatingVolunteerProfile,
    updateVolunteerProfile,
  } = useVolunteerStore()

  // Local editable form state
  const [editableProfile, setEditableProfile] = useState(initialEditableProfile)
  const [availability, setAvailability] = useState({
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    preference: 'available',
  })
  const [availabilitySlots, setAvailabilitySlots] = useState([])
  const [selectedSkill, setSelectedSkill] = useState('')
  const [otherSkill, setOtherSkill] = useState('')
  const [skillList, setSkillList] = useState([])
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('')
  const avatarPreviewUrlRef = useRef('')
  const [errors, setErrors] = useState({})

  // Sync authenticated profile data into editable form state
  useEffect(() => {
    let isCurrent = true

    queueMicrotask(() => {
      if (!isCurrent) {
        return
      }

      setEditableProfile((currentProfile) => ({
        ...currentProfile,
        name: authUser?.name ?? '',
        email: authUser?.email ?? '',
        ageGroup: authUser?.ageGroup ?? '',
        biodata: authUser?.biodata ?? '',
      }))

      setSkillList(Array.isArray(authUser?.skills) ? authUser.skills : [])

      setAvailabilitySlots(
        Array.isArray(authUser?.availability)
          ? sortAvailabilitySlots(authUser.availability)
          : []
      )
    })

    return () => {
      isCurrent = false
    }
  }, [authUser])

  useEffect(() => () => {
    if (avatarPreviewUrlRef.current) {
      URL.revokeObjectURL(avatarPreviewUrlRef.current)
    }
  }, [])

  // Form field handlers
  const handleEditableProfileChange = (event) => {
    const { name, value } = event.target
    setEditableProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }))
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0] || null

    if (avatarPreviewUrlRef.current) {
      URL.revokeObjectURL(avatarPreviewUrlRef.current)
      avatarPreviewUrlRef.current = ''
    }

    if (file) {
      const previewUrl = URL.createObjectURL(file)
      avatarPreviewUrlRef.current = previewUrl
      setAvatarPreviewUrl(previewUrl)
    } else {
      setAvatarPreviewUrl('')
    }

    setSelectedAvatarFile(file)
    setErrors((prev) => {
      if (!prev.avatar) return prev
      const next = { ...prev }
      delete next.avatar
      return next
    })
  }

  // Availability handlers
  const handleAvailabilityChange = (event) => {
    const { name, value } = event.target
    setAvailability((currentAvailability) => ({
      ...currentAvailability,
      [name]: value,
    }))
    setErrors((currentErrors) => {
      if (!currentErrors.availability) return currentErrors
      const nextErrors = { ...currentErrors }
      delete nextErrors.availability
      return nextErrors
    })
  }

  const addAvailability = () => {
    const { dayOfWeek, startTime, endTime, preference } = availability

    const newSlot = {
      dayOfWeek,
      startTime,
      endTime,
      preference,
    }

    const availabilityError = getNewAvailabilitySlotError(
      newSlot,
      availabilitySlots,
    )

    if (availabilityError) {
      setErrors((prev) => ({ ...prev, availability: availabilityError }))
      return
    }

    setAvailabilitySlots((currentSlots) =>
      sortAvailabilitySlots([...currentSlots, newSlot])
    )

    setAvailability({
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      preference: 'available',
    })

    setErrors((prev) => {
      const next = { ...prev }
      delete next.availability
      return next
    })
  }

  // Skills handlers
  const addSkill = () => {
    const skillToAdd = selectedSkill === 'Others' ? otherSkill.trim() : selectedSkill

    if (!skillToAdd) {
      setErrors((prev) => ({ ...prev, skills: 'Please select or enter a skill.' }))
      return
    }

    if (skillList.includes(skillToAdd)) {
      setErrors((prev) => ({ ...prev, skills: 'This skill has already been added.' }))
      return
    }

    setSkillList((currentSkills) => [...currentSkills, skillToAdd])
    setSelectedSkill('')
    setOtherSkill('')
    setErrors((prev) => {
      const next = { ...prev }
      delete next.skills
      return next
    })
  }

  const removeSkill = (skillToRemove) => {
    setSkillList((currentSkills) => currentSkills.filter((skill) => skill !== skillToRemove))
    setErrors((prev) => {
      const next = { ...prev }
      delete next.skills
      return next
    })
  }

  const removeAvailability = (slotIndexToRemove) => {
    setAvailabilitySlots((currentSlots) =>
      currentSlots.filter((_, index) => index !== slotIndexToRemove)
    )
    setErrors((prev) => {
      const next = { ...prev }
      delete next.availability
      return next
    })
  }

  // Profile save handler
  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationErrors = {}
    if (!editableProfile.name.trim()) {
      validationErrors.name = 'Full name is required.'
    }
    if (!editableProfile.ageGroup) {
      validationErrors.ageGroup = 'Age group is required.'
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})

    const result = await updateVolunteerProfile(volunteerId, {
      fullName: editableProfile.name,
      ageGroup: editableProfile.ageGroup,
      biodata: editableProfile.biodata,
      skills: skillList,
      availability: availabilitySlots,
      avatar: selectedAvatarFile,
    })

    if (!result.success) {
      setErrors({ submit: result.error || 'Failed to save profile details.' })
      return
    }

    const updatedProfile = result.profile ?? {}

    setEditableProfile((currentProfile) => ({
      ...currentProfile,
      name: updatedProfile.name ?? currentProfile.name,
      email: updatedProfile.email ?? currentProfile.email,
      ageGroup: updatedProfile.ageGroup ?? currentProfile.ageGroup,
      biodata: updatedProfile.biodata ?? currentProfile.biodata,
    }))
    setSkillList(Array.isArray(updatedProfile.skills) ? updatedProfile.skills : skillList)
    setAvailabilitySlots(
      Array.isArray(updatedProfile.availability)
        ? sortAvailabilitySlots(updatedProfile.availability)
        : availabilitySlots
    )
    if (avatarPreviewUrlRef.current) {
      URL.revokeObjectURL(avatarPreviewUrlRef.current)
      avatarPreviewUrlRef.current = ''
    }
    setSelectedAvatarFile(null)
    setAvatarPreviewUrl('')
    navigate('/volunteer-dashboard/profile')
  }

  const avatarSrc = avatarPreviewUrl || authUser?.avatar || ''
  const avatarLabel = selectedAvatarFile?.name || 'PNG, JPG, or JPEG up to 5MB'
  const avatarStatusText = selectedAvatarFile
    ? 'New photo selected'
    : authUser?.avatar
      ? 'Current profile photo'
      : 'No profile photo yet'

  // Main edit profile layout
  return (
    <div className="edit-profile-page">
      <div className="edit-profile-content">
        <VolunteerTopbar />

        {/* Profile hero section */}
        <section className="profile-hero">
          <div>
            <p>VOLUNTEER PROFILE</p>
            <h1>Manage your self profile</h1>
            <span>Keep your details, skills, availability, and volunteer history up to date.</span>
          </div>
          <button type="submit" form="edit-profile-form" disabled={isUpdatingVolunteerProfile}>
            {isUpdatingVolunteerProfile ? 'Saving...' : 'Save Profile'}
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
              {formatApprovalStatus(authUser?.approvalStatus)}
            </div>
          </div>

          {errors.submit ? (
            <p className="edit-profile-error">
              <AlertCircle className="edit-profile-error-icon" />
              {errors.submit}
            </p>
          ) : null}

          {/* Profile details fields */}
          <div className="profile-form-grid">
            <div className="edit-profile-avatar-field">
              <div className="edit-profile-avatar-preview">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Volunteer avatar preview" />
                ) : (
                  getInitials(editableProfile.name || authUser?.name)
                )}
              </div>

              <div className="edit-profile-avatar-copy">
                <span>Profile Photo</span>
                <strong>{avatarStatusText}</strong>
                <p>{avatarLabel}</p>
              </div>

              <input
                id="volunteer-avatar-upload"
                className="edit-profile-avatar-input"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleAvatarChange}
              />
              <label className="edit-profile-avatar-button" htmlFor="volunteer-avatar-upload">
                <Camera size={16} />
                Change Photo
              </label>
            </div>

            <label className="edit-profile-field">
              <span>Full Name</span>
              <input
                name="name"
                type="text"
                value={editableProfile.name}
                onChange={handleEditableProfileChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && (
                <p className="edit-profile-field-error">
                  <AlertCircle className="edit-profile-error-icon" />
                  {errors.name}
                </p>
              )}
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
              <CustomSelect
                value={editableProfile.ageGroup}
                placeholder="Select an age group"
                options={volunteerAgeGroupOptions}
                onChange={(value) => handleEditableProfileChange({
                  target: { name: 'ageGroup', value },
                })}
              />
              {errors.ageGroup && (
                <p className="edit-profile-field-error">
                  <AlertCircle className="edit-profile-error-icon" />
                  {errors.ageGroup}
                </p>
              )}
            </label>

            {/* Skills section */}
            <div className="edit-profile-field">
              <span>Skills</span>
              <div className="skills-input-row">
                <CustomSelect
                  value={selectedSkill}
                  placeholder="Select a skill"
                  options={volunteerSkillOptions}
                  onChange={setSelectedSkill}
                />

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

              {errors.skills && (
                <p className="edit-profile-field-error">
                  <AlertCircle className="edit-profile-error-icon" />
                  {errors.skills}
                </p>
              )}

              {skillList.length > 0 ? (
                <ul className="skill-list" aria-label="Added skills">
                  {skillList.map((skill) => (
                    <li key={skill}>
                      <span>{skill}</span>
                      <button
                        type="button"
                        className="remove-chip-button"
                        aria-label={`Remove ${skill}`}
                        onClick={() => removeSkill(skill)}
                      >
                        <X size={12} />
                      </button>
                    </li>
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
              <CustomSelect
                value={availability.dayOfWeek}
                placeholder="Day of Week"
                options={volunteerAvailabilityDays}
                onChange={(value) => handleAvailabilityChange({
                  target: { name: 'dayOfWeek', value },
                })}
              />

              <CustomSelect
                value={availability.startTime}
                placeholder="Start Time"
                options={volunteerAvailabilityTimes}
                onChange={(value) => handleAvailabilityChange({
                  target: { name: 'startTime', value },
                })}
              />

              <CustomSelect
                value={availability.endTime}
                placeholder="End Time"
                options={volunteerAvailabilityTimes}
                onChange={(value) => handleAvailabilityChange({
                  target: { name: 'endTime', value },
                })}
              />

              <CustomSelect
                value={availability.preference}
                options={volunteerAvailabilityPreferenceOptions}
                onChange={(value) => handleAvailabilityChange({
                  target: { name: 'preference', value },
                })}
              />

              <button className="add-slot-button" type="button" onClick={addAvailability}>
                <Plus size={18} />
                Add
              </button>
            </div>

            {errors.availability && (
              <p className="edit-profile-field-error">
                <AlertCircle className="edit-profile-error-icon" />
                {errors.availability}
              </p>
            )}

            {availabilitySlots.length > 0 ? (
              <ul className="slot-list" aria-label="Added availability">
                {availabilitySlots.map((slot, index) => (
                  <li key={`${slot.dayOfWeek}-${slot.startTime}-${slot.endTime}-${slot.preference}-${index}`}>
                    <span>
                      {slot.dayOfWeek}, {slot.startTime} - {slot.endTime} (
                      {slot.preference === 'preferred' ? 'Preferred' : 'Available'})
                    </span>
                    <button
                      type="button"
                      className="remove-chip-button"
                      aria-label={`Remove ${slot.dayOfWeek} ${slot.startTime} to ${slot.endTime}`}
                      onClick={() => removeAvailability(index)}
                    >
                      <X size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No availability added yet.</p>
            )}
          </section>

        </form>
      </div>
    </div>
  )
}

export default EditVolunteerProfile
