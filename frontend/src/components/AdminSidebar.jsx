import React from 'react'
import Badge from './Badge'
import { LogOut } from 'lucide-react'

const AdminSidebar = ({
    adminName
}) => {
  return (
    <div>
        <div>
            <Badge
                icon="V"
                name="VolunteerConnect"
                subtitle={adminName}
            />
        </div>

        {/* volunteers navigation */}
        <div>
            Volunteers
        </div>

        {/* organisations navigation */}
        <div>
            Organisation 
        </div>

        {/* opportunities navigation */}
        <div>
            Opportunity
        </div>

        {/* reports navigation */}
        <div>
            Report 
        </div>
        
        {/* analytics navigation */}
        <div>
            Analytics 
        </div>

        {/* profile or settings */}
        <div>
            Profile 
        </div>

        {/* logout button */}
        <div>
            <LogOut />
            <p>
                Logout 
            </p>
        </div>

    </div>
  )
}

export default AdminSidebar