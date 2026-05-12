import React from 'react'
import { Bell, Search } from 'lucide-react'

const VolunteerTopbar = () => {
  return (
    <header className="profile-topbar">
      <label className="profile-search">
        <Search size={20} />
        <input type="search" placeholder="Search the platform..." />
      </label>

      <button className="notification-button" type="button" aria-label="Notifications">
        <Bell size={22} />
        <span />
      </button>
    </header>
  )
}

export default VolunteerTopbar
