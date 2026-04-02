import { Smile } from 'lucide-react'
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage'
import SignUp from './pages/Auth/SignUp'
import VolunteerDashboard from './pages/Volunteer/VolunteerDashboard'
import OrganisationDashboard from './pages/Organisation/OrganisationDashboard'
import AdminDashboard from './pages/Admin/AdminDashboard'
import Login from './pages/Auth/Login';
import Navbar from './components/Navbar';

const App = () => {
  return (
    <div>
      <Smile />
      <div>CAN U SEE THIS TEXT AND SMILEY FACE? IF YOU CAN, IT MEANS YOU WILL BE ABLE TO USE ICON PROVIDED BY LUCIDE-REACT ICON LIBRARY!</div>
      <Navbar />
      <div>CAN YOU SEE THIS NAVBAR? IF YOU CAN, IT MEANS YOU CAN CREATE REUSABLE COMPONENT IN THE FORM OR JSX AND USE THEM ACROSS UR JSX LAYOUTS / PAGES / COMPONENTS!</div>
      <Routes>
        {/* landing page route */}
        <Route path='/' element={<LandingPage />}/>

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