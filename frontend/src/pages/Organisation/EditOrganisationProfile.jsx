import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Info, LayoutDashboard, Save, X, Settings } from "lucide-react";
import './OrganisationDashboard.css'
import axios from 'axios';


const EditOrganisationProfile = () => {
    

    const navigate = useNavigate();

    const [organisationData, setOrganisationData] = useState({
        name: "Yoo Organisation",
        aboutUs: "Here's Yoo Organisation",
    });


    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('http://localhost:5001/api/organisation/profile', organisationData, {
                withCredentials: true 
            });
            
            if (response.status === 200) {
                alert("Profile Updated Successfully");
                navigate('/organisation-dashboard');
            }
        } catch (error) {
            console.error("Update failed:", error.response?.data || error.message);
        }
    };

    // Update your button in the JSX:
    <button className="btn-primary-org" onClick={handleSave}>
        <Save size={18} /> Save Profile
    </button>

};

export default EditOrganisationProfile;
