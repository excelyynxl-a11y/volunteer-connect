import React from 'react'
import AdminSidebar from '../../components/AdminSidebar'

const AdminDashboard = () => {
  return (
    <div>

      {/* admin sidebar */}
      <AdminSidebar 
        adminName="Admin 1"
      />

      <div>
        {/* Whatever that is clicked on admin sidebar will be rendered here. By default it is the homepage */}
        
      </div>
    </div>
  )
}

export default AdminDashboard