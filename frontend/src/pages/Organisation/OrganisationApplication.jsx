import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  rejectionMessage: application.withdrawalReason || "",
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
  } = useApplicationStore();

  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    getMyOpportunities();
    getMyOrganisationApplications();
  }, [getMyOpportunities, getMyOrganisationApplications]);

  const opportunityViewModels = useMemo(() => {
    return allMyOpportunities.map((opportunity) => {
      const applicationsForOpportunity = applications.filter(
        (application) => application.opportunityId?._id === opportunity._id
      );
      return mapOpportunityToViewModel(opportunity, applicationsForOpportunity);
    });
  }, [allMyOpportunities, applications]);

  const selectedOpportunity = opportunityViewModels.find(
    (o) => o.id === selectedId
  );

  const handleApprove = async (applicationId) => {
    await approveApplication(applicationId);
    await getMyOrganisationApplications();
  };

  const handleReject = async (applicationId, reason) => {
    await rejectApplication(applicationId, reason);
    await getMyOrganisationApplications();
  };

  if (opportunitiesError || applicationsError) {
    return (
      <div className="organisation-page">
        <p>{opportunitiesError || applicationsError}</p>
      </div>
    );
  }

  if (isOpportunitiesLoading || isApplicationsLoading) {
    return (
      <div className="organisation-page">
        <p>Loading opportunities...</p>
      </div>
    );
  }

  if (selectedOpportunity) {
    return (
      <ApplicationOpportunityDetail
        key={selectedOpportunity.id}
        opportunity={selectedOpportunity}
        onBack={() => setSelectedId(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onViewVolunteer={(volunteerId) => {
          if (volunteerId) {
            navigate(
              `/organisation-dashboard/applications/volunteers/${volunteerId}`,
            );
          }
        }}
      />
    );
  }

  return (
    <ApplicationOpportunityList
      opportunities={opportunityViewModels}
      onManage={(id) => setSelectedId(id)}
    />
  );
};

export default OrganisationApplication;
