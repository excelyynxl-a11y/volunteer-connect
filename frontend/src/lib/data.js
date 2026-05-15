import { Eye, Heart, Target } from "lucide-react"

export const activityItems = [
  {
    initial: 'Y',
    title: 'Yiming Xu applied to Community Food Drive',
    subtitle: 'Helping Hands MY - 12 min ago',
    status: 'Pending',
    statusClass: 'pending',
  },
  {
    initial: 'S',
    title: 'Sarah Chen joined Beach Cleanup Volunteer',
    subtitle: 'Green Earth Society - 1 hour ago',
    status: 'Approved',
    statusClass: 'approved',
  },
  {
    initial: 'A',
    title: 'Ahmad Rahman completed Literacy Tutor session',
    subtitle: 'Kids First Foundation - 3 hrs logged',
    status: '+3 hrs',
    statusClass: 'completed',
  },
  {
    initial: 'P',
    title: 'Priya Nair applied to Animal Shelter Assistant',
    subtitle: 'Paws & Claws KL - 5 hours ago',
    status: 'Pending',
    statusClass: 'pending',
  },
]

export const aboutUsCards = [
  {
    icon: Eye,
    title: 'Our Vision',
    text: 'A world where every individual can effortlessly find and contribute to causes they care about - building stronger, more resilient communities through the power of collective action and shared purpose.',
  },
  {
    icon: Target,
    title: 'Our Mission',
    text: 'To bridge the gap between passionate volunteers and impactful non-profit organizations by providing a seamless, transparent platform that simplifies coordination, tracks participation, and celebrates community contribution.',
  },
  {
    icon: Heart,
    title: 'About Us',
    text: 'Founded by community advocates, VolunteerConnect empowers both volunteers and organizations with tools for opportunity discovery, application management, scheduling, and verified hour-logging - all in one trusted platform.',
  },
]

export const howItWorkSteps = [
  {
    step: '1',
    title: 'Create Your Profile',
    text: 'Sign up as a volunteer or organization. Set your availability, skills, and interests to get personalized matches.',
  },
  {
    step: '2',
    title: 'Discover Opportunities',
    text: 'Browse curated volunteer postings from verified non-profits filtered by cause, location, and time commitment.',
  },
  {
    step: '3',
    title: 'Apply & Get Approved',
    text: 'Submit your application in seconds. Organizations review and approve through our dual-approval workflow.',
  },
  {
    step: '4',
    title: 'Track Your Impact',
    text: 'Log hours, earn recognition, and build a verified volunteering history you can share with the world.',
  },
]

export const landingPageNavItems = [
    {name: "Home", href: "#hero"},
    {name: "About Us", href: "#about"},
    {name: "How It Work", href: "#howitwork"}
]

export const volunteerAgeGroupOptions = ['21-30', '31-40', '41-50', '51-60', '60+']

export const volunteerAvailabilityDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export const volunteerAvailabilityTimes = [
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

export const volunteerSkillOptions = [
  'Communication',
  'Event Support',
  'First Aid',
  'Food Distribution',
  'Fundraising',
  'Teaching',
  'Teamwork',
  'Others',
]

export const volunteerAvailabilityPreferenceOptions = [
  { label: 'Available', value: 'available' },
  { label: 'Preferred', value: 'preferred' },
]
