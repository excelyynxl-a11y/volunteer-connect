import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Search,
  ArrowLeft,
  ArrowRight,
  X,
  Check,
  Eye,
  ClipboardList,
  Calendar,
} from "lucide-react";
import { useOrganisationStore } from "../../store/useOrganisationStore";
import { useApplicationStore } from "../../store/useApplicationStore";
import { getInitials } from "../../lib/utils";
import { APPLICARION_TAB_STATUS_LABELS, APPLICATION_TABS } from "../../lib/application";
import ApplicationOpportunityList from "../../components/ApplicationOpportunityList";
import ApplicationOpportunityDetail from "../../components/ApplicationOpportunityDetail";

const mapApplicationToViewModel = (application) => ({
  id: application._id,
  volunteerId: application.volunteerId?._id,
  volunteerName: application.volunteerId?.name || "Unknown volunteer",
  volunteerInitials: getInitials(application.volunteerId?.name),
  submittedOn: application.createdAt,
  status: APPLICARION_TAB_STATUS_LABELS[application.status] || application.status,
  rejectionMessage: application.rejectionReason || application.withdrawalReason || "",
  skills: application.volunteerId?.skills || [],
  availability: application.volunteerId?.availability || [],
});

const mapOpportunityToViewModel = (opportunity, applicationsForOpportunity) => ({
  id: opportunity._id,
  title: opportunity.title,
  category: Array.isArray(opportunity.category)
    ? opportunity.category.join(", ")
    : opportunity.category,
  location: opportunity.location,
  status:
    opportunity.status?.charAt(0).toUpperCase() + opportunity.status?.slice(1),
  eventDate: opportunity.startAt,
  deadline: opportunity.applicationDeadline,
  capacity: opportunity.maxVolunteers || 0,
  applications: applicationsForOpportunity.map(mapApplicationToViewModel),
});

const OrganisationApplication = () => {
  const navigate = useNavigate();
  const { opportunityId } = useParams();
  const [hasLoadedApplications, setHasLoadedApplications] = useState(false);
  const {
    allMyOpportunities,
    isOpportunitiesLoading,
    opportunitiesError,
    getMyOpportunities,
  } = useOrganisationStore();
  const {
    applications,
    isApplicationsLoading,
    applicationsError,
    getMyOrganisationApplications,
    approveApplication,
    rejectApplication,
    clearApplicationsError,
  } = useApplicationStore();

  useEffect(() => {
    let isActive = true;

    const loadApplicationManagement = async () => {
      await Promise.allSettled([
        getMyOpportunities(),
        getMyOrganisationApplications(),
      ]);

      if (isActive) {
        setHasLoadedApplications(true);
      }
    };

    loadApplicationManagement();

    return () => {
      isActive = false;
    };
  }, [getMyOpportunities, getMyOrganisationApplications]);

  const opportunityViewModels = useMemo(() => {
    return allMyOpportunities.map((opportunity) => {
      const applicationsForOpportunity = applications.filter(
        (application) =>
          String(application.opportunityId?._id ?? application.opportunityId) ===
          String(opportunity._id),
      );
      return mapOpportunityToViewModel(opportunity, applicationsForOpportunity);
    });
  }, [allMyOpportunities, applications]);

  const selectedOpportunity = opportunityViewModels.find(
    (opportunity) => String(opportunity.id) === opportunityId,
  );

  const handleApprove = async (applicationId) => {
    try {
      await approveApplication(applicationId);
      const refreshResult = await getMyOrganisationApplications();
      return refreshResult?.success === false
        ? refreshResult
        : { success: true };
    } catch (error) {
      clearApplicationsError();
      return {
        success: false,
        error: error.response?.data?.message || "The application could not be approved.",
      };
    }
  };

  const handleReject = async (applicationId, reason) => {
    try {
      await rejectApplication(applicationId, reason);
      const refreshResult = await getMyOrganisationApplications();
      return refreshResult?.success === false
        ? refreshResult
        : { success: true };
    } catch (error) {
      clearApplicationsError();
      return {
        success: false,
        error: error.response?.data?.message || "The application could not be rejected.",
      };
    }
  };

  if (opportunitiesError || applicationsError) {
    return (
      <div className="organisation-page">
        <p>{opportunitiesError || applicationsError}</p>
      </div>
    );
  }

  if (
    !hasLoadedApplications ||
    isOpportunitiesLoading ||
    isApplicationsLoading
  ) {
    return (
      <div className="organisation-page">
        <p>Loading opportunities...</p>
      </div>
    );
  }

  if (opportunityId && !selectedOpportunity) {
    return (
      <div className="organisation-page">
        <div className="organisation-empty">
          <ClipboardList className="organisation-empty-icon" />
          <h3>Opportunity applications unavailable</h3>
          <p>This opportunity could not be found for your organisation.</p>
          <button
            type="button"
            className="app-back-btn"
            onClick={() => navigate("/organisation-dashboard/applications")}
          >
            <ArrowLeft size={14} /> Back to Opportunities
          </button>
        </div>
      </div>
    );
  }

  if (selectedOpportunity) {
    return (
      <ApplicationOpportunityDetail
        key={selectedOpportunity.id}
        opportunity={selectedOpportunity}
        onBack={() => navigate("/organisation-dashboard/applications")}
        onApprove={handleApprove}
        onReject={handleReject}
        onViewVolunteer={(volunteerId) => {
          if (volunteerId) {
            navigate(
              `/organisation-dashboard/applications/${selectedOpportunity.id}/volunteers/${volunteerId}`,
            );
          }
        }}
      />
    );
  }

  return (
    <ApplicationOpportunityList
      opportunities={opportunityViewModels}
      onManage={(id) =>
        navigate(`/organisation-dashboard/applications/${id}`)
      }
    />
  );
};

export default OrganisationApplication;
