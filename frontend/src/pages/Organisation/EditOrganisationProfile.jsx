import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Info, LayoutDashboard, Save, X, Settings } from "lucide-react";
import './OrganisationDashboard.css'
import '../../components/Organisation.css';
import { useAuthStore } from "../../store/useAuthStore.js";
import { axiosInstance } from "../../lib/axios";

const EditOrganisationProfile = () => {

    const navigate = useNavigate();

    const { authUser, setAuthUser } = useAuthStore();

    const [formData, setFormData] = useState({
        name: authUser?.name|| "",
        biodata: authUser?.biodata || "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.put('http://localhost:5001/api/organisation/profile', formData, {
                withCredentials: true 
            });

            if (response.status === 200) {
                // Update global state so the dashboard reflects changes immediately
                setAuthUser(response.data); 
                alert("Profile Updated Successfully");
                navigate('/organisation-dashboard/profile');
            }
        } catch (error) {
            console.error("Update failed:", error.response?.data || error.message);
            alert("Failed to update profile. Check console for details.");
        }
    };
    return (
        <div className="org-container">
            <main className="org-main" style={{ padding: '40px' }}>
                <section className="edit-profile-card profile-card">
                    <div className="card-header">
                        <h2>Edit Organisation Profile</h2>
                        <button className="view-all-link" onClick={() => navigate(-1)}>
                            <X size={18} /> Cancel
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="edit-form">
                        <div className="input-group">
                            <label><Building2 size={16} /> Organisation Name</label>
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name} 
                                onChange={handleChange}
                                placeholder="Enter organisation name"
                                required 
                            />
                        </div>

                        <div className="input-group">
                            <label><Info size={16} /> About Us / Biodata</label>
                            <textarea 
                                name="biodata"
                                value={formData.biodata} 
                                onChange={handleChange}
                                placeholder="Describe your mission..."
                                rows="6"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-primary-org">
                                <Save size={18} /> Save Profile
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default EditOrganisationProfile;
