import React from 'react'
import { LogOut, Shield } from 'lucide-react'

const VolunteerSidebar = ({ accountLabel, fullName, initials, navItems, sidebarClassName }) => {
  return (
    <aside className={sidebarClassName}>
      <div className="brand-block">
        <div className="brand-mark">
          <Shield size={22} />
        </div>
        <div>
          <strong>VolunteerConnect</strong>
          <span>VOLUNTEER</span>
        </div>
      </div>

      <nav className="profile-nav" aria-label="Volunteer profile navigation">
        {navItems.map((item) => {
          const IconComponent = item.icon

          return (
            <a key={item.label} className={item.isActive ? 'active' : undefined} href={item.href}>
              <IconComponent size={19} />
              {item.label}
            </a>
          )
        })}
      </nav>

      <div className="profile-account">
        <div className="avatar">{initials}</div>
        <div>
          <strong>{fullName}</strong>
          <span>{accountLabel}</span>
        </div>
        <LogOut size={18} />
      </div>
    </aside>
  )
}

export default VolunteerSidebar
