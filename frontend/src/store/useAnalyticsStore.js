import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

// TODO: LETS GO LONGHEI COOKING TIME
export const useAnalyticsStore = create((get) => ({
    volunteerSignUpAnaltyics: [],
    isVolunteerSignUpAnaltyicsLoading: false,
    organisationSignUpAnaltyics: [],
    isOrganisationSignUpAnaltyicsLoading: false,
    opportunityCreatedAnaltyics: [],
    isOpportunityCreatedAnaltyicsLoading: false,
    reportAnaltyics: [],
    isReportAnaltyicsLoading: false,

    getVolunteerSignUpAnalytics: async() => {
        
    },

    getOrganisationSignUpAnalytics: async() => {

    },

    getOpportunityCreatedAnalytics: async() => {

    },

    getReportAnalytics: async() => {

    },

}))