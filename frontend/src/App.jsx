import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage'
import SignUp from './pages/Auth/SignUp'
import VolunteerDashboard from './pages/Volunteer/VolunteerDashboard'
import VolunteerOpportunities from './pages/VolunteerOpportunities/VolunteerOpportunities'
import OrganisationDashboard from './pages/Organisation/OrganisationDashboard'
import AdminDashboard from './pages/Admin/AdminDashboard'
import Login from './pages/Auth/Login';
import Navbar from './components/Navbar';
import Vision from './pages/Vision/Vision';
import Mission from './pages/Mission/Mission';
import AboutUs from './pages/AboutUs/AboutUs';

const App = () => {
  return (
    <div>
      {/* <Navbar /> */}
      <Routes>
        {/* landing page route */}
        <Route path='/' element={<LandingPage />}/>
        <Route path='/vision' element={<Vision />}/>
        <Route path='/mission' element={<Mission />}/>
        <Route path='/about' element={<AboutUs />}/>
        <Route path='/opportunities' element={<VolunteerOpportunities />}/>

        {/* authentication and account creation route */}
        <Route path='/sign-up' element={<SignUp />}/>
        <Route path='/login' element={<Login />}/>

        {/* volunteer route */}
        <Route path='/volunteer-dashboard' element={<VolunteerDashboard />}/>

        {/* organisation route */}
        <Route path='/organisation-dashboard' element={<OrganisationDashboard />}/>

        {/* admin route */}
        <Route path='/admin-dashboard' element={<AdminDashboard />}/>

        {/* catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    
    </div>
  )
}

export default App
