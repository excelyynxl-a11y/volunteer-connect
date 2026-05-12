import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { axiosInstance } from '../lib/axios'
import { formatDate } from '../lib/utils'
import { useAuthStore } from '../store/useAuthStore'



export function useVolunteerProfileData() {
  // Route-derived identifiers
  const [searchParams] = useSearchParams()
  const authUser = useAuthStore((state) => state.authUser)

  const routeVolunteerId = searchParams.get('id')
  const authenticatedVolunteerId =
    authUser?.role === 'volunteer' ? authUser?._id || authUser?.id : ''

  const volunteerId = routeVolunteerId || authenticatedVolunteerId || ''

  // Local hook state
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    ageGroup: '',
    avatar: '',
    biodata: '',
    skills: [],
    availability: [],
    resume: {
      url: '',
      publicId: '',
      originalName: '',
      uploadedAt: null,
    },
    approvalStatus: '',
  })
  const [participationHistory, setParticipationHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // Profile and participation data loading
  useEffect(() => {
    let isMounted = true

    const fetchVolunteerData = async () => {
      // Reset loading state before each request cycle
      setIsLoading(true)
      setLoadError('')
      
      if (!volunteerId) {
        setProfileData({
          fullName: '',
          email: '',
          ageGroup: '',
          avatar: '',
          biodata: '',
          skills: [],
          availability: [],
          resume: {
            url: '',
            publicId: '',
            originalName: '',
            uploadedAt: null,
          },
          approvalStatus: '',
        })

        setParticipationHistory([])
        setLoadError('Unable to load volunteer profile because no volunteer ID is available.')
        setIsLoading(false)
        return
      }

      // Fetch profile and past experience in parallel
      const [profileResult, historyResult] = await Promise.allSettled([
        axiosInstance.get(`/volunteer/profile/${volunteerId}`),
        axiosInstance.get(`/volunteer/profile/${volunteerId}/past-experience`),
      ])

      if (!isMounted) {
        return
      }

      // Transform profile response into UI state
      if (profileResult.status === 'fulfilled') {
        const profile = profileResult.value.data?.data ?? {}
        
        setProfileData({
          fullName: profile.name ?? '',
          email: profile.email ?? '',
          ageGroup: profile.ageGroup ?? '',
          avatar: profile.avatar ?? '',
          biodata: profile.biodata ?? '',
          skills: Array.isArray(profile.skills) ? profile.skills : [],
          availability: Array.isArray(profile.availability) ? profile.availability : [],
          resume: {
            url: profile.resume?.url ?? '',
            publicId: profile.resume?.publicId ?? '',
            originalName: profile.resume?.originalName ?? '',
            uploadedAt: profile.resume?.uploadedAt ?? null,
          },
          approvalStatus: profile.approvalStatus ?? '',
        })
      } else {
        setLoadError(
          profileResult.reason?.response?.data?.message || 'Failed to load volunteer profile.'
        )
      }

      // Transform participation response into UI state
      if (historyResult.status === 'fulfilled') {
        const experienceData = historyResult.value.data?.data ?? []

        setParticipationHistory(
          experienceData.map((activity, index) => ({
            id: activity._id,
            title: `Completed Opportunity ${index + 1}`,
            organisation: 'Organisation details unavailable',
            date: formatDate(activity.updatedAt || activity.createdAt),
            hours: `${Number(activity.loggedHours ?? 0).toFixed(1)} hrs`,
            loggedHours: Number(activity.loggedHours ?? 0),
            status: activity.status ?? 'Completed',
          }))
        )
      }

      setIsLoading(false)
    }

    fetchVolunteerData()

    return () => {
      isMounted = false
    }
  }, [volunteerId])

  // Derived summary values
  const totalVolunteerHours = useMemo(
    () =>
      `${participationHistory
        .reduce((total, activity) => total + activity.loggedHours, 0)
        .toFixed(1)}h`,
    [participationHistory]
  )

  return {
    volunteerId,
    profileData,
    participationHistory,
    totalVolunteerHours,
    isLoading,
    loadError,
  }
}
