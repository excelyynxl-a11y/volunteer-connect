import React, { useEffect } from 'react'
import { useAuthStore } from '../../store/useAuthStore';
import { useParams } from 'react-router-dom';
import { useOrganisationStore } from '../../store/useOrganisationStore';

const ViewOpportunity = () => {

    const { authUser } = useAuthStore();
    const { id } = useParams();
    const { setCurrentTab, getAllMyOpportunities, allMyOpportunities } = useOrganisationStore();

    useEffect(() => {
        getAllMyOpportunities();
        setCurrentTab('opportunity');
    }, []);

    useEffect(() => {
            const raw = allMyOpportunities?.data ?? allMyOpportunities;
            const list = Array.isArray(raw) ? raw : [];
    
            if (list.length === 0) return;
    
            const opportunityToView = list.find(opp => opp._id === id);
            console.log(opportunityToView);
    
        }, [id, allMyOpportunities]
    );

    return (
        <div>ViewOpportunity</div>
    )
}

export default ViewOpportunity