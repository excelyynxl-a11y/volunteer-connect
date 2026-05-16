import { Search } from "lucide-react";
import OpportunityCard from "../../components/OpportunityCard";

const mockOpportunities = [
  {
    _id: "opp_community_food_drive_helper_001",
    title: "Community Food Drive Helper",
    details: "Support food packing, registration, and distribution for local families.",
    organisationId: "664f8d0f2a5c8a6e8d1f0001",
    organisationName: "Helping Hands Malaysia",
    images: [],
    location: "Selangor, Cheras",
    startAt: "2026-05-20T09:00:00.000Z",
    endAt: "2026-05-20T14:00:00.000Z",
    applicationDeadline: "2026-05-18T23:59:00.000Z",
    maxVolunteers: 20,
    approvedVolunteersCount: 8,
    category: ["Community"],
    requirements: "Comfortable helping with packing, greeting attendees, and light lifting.",
    status: "active",
    publishedAt: "2026-05-01T09:00:00.000Z",
    createdAt: "2026-05-01T09:00:00.000Z",
    updatedAt: "2026-05-01T09:00:00.000Z",
  },
  {
    _id: "opp_beach_cleanup_volunteer_002",
    title: "Beach Cleanup Volunteer",
    details: "Help collect litter, sort recyclables, and document cleanup progress along the shoreline.",
    organisationId: "664f8d0f2a5c8a6e8d1f0002",
    organisationName: "Green Earth Society",
    images: [],
    location: "Pulau Pinang, Batu Ferringhi",
    startAt: "2026-05-24T08:00:00.000Z",
    endAt: "2026-05-24T12:00:00.000Z",
    applicationDeadline: "2026-05-22T23:59:00.000Z",
    maxVolunteers: 30,
    approvedVolunteersCount: 16,
    category: ["Environment"],
    requirements: "Bring a reusable water bottle and wear comfortable outdoor shoes.",
    status: "active",
    publishedAt: "2026-05-03T10:00:00.000Z",
    createdAt: "2026-05-03T10:00:00.000Z",
    updatedAt: "2026-05-03T10:00:00.000Z",
  },
  {
    _id: "opp_animal_care_support_003",
    title: "Animal Care Support",
    details: "Assist shelter staff with feeding routines, kennel cleaning, and basic enrichment activities.",
    organisationId: "664f8d0f2a5c8a6e8d1f0003",
    organisationName: "Paws & Claws KL",
    images: [],
    location: "Kuala Lumpur, Setapak",
    startAt: "2026-05-26T09:00:00.000Z",
    endAt: "2026-05-26T13:00:00.000Z",
    applicationDeadline: "2026-05-24T23:59:00.000Z",
    maxVolunteers: 12,
    approvedVolunteersCount: 5,
    category: ["Animal Welfare"],
    requirements: "Suitable for volunteers who are comfortable around cats and dogs.",
    status: "active",
    publishedAt: "2026-05-04T11:30:00.000Z",
    createdAt: "2026-05-04T11:30:00.000Z",
    updatedAt: "2026-05-04T11:30:00.000Z",
  },
  {
    _id: "opp_social_media_content_helper_004",
    title: "Social Media Content Helper",
    details: "Capture event moments, prepare short captions, and support awareness posts for the campaign.",
    organisationId: "664f8d0f2a5c8a6e8d1f0004",
    organisationName: "Community Bridge MY",
    images: [],
    location: "Selangor, Semenyih",
    startAt: "2026-05-28T13:00:00.000Z",
    endAt: "2026-05-28T17:00:00.000Z",
    applicationDeadline: "2026-05-26T23:59:00.000Z",
    maxVolunteers: 6,
    approvedVolunteersCount: 2,
    category: ["Other"],
    requirements: "Basic photography or social media posting experience is helpful.",
    status: "active",
    publishedAt: "2026-05-06T08:45:00.000Z",
    createdAt: "2026-05-06T08:45:00.000Z",
    updatedAt: "2026-05-06T08:45:00.000Z",
  },
];

const VolunteerOpportunities = () => {
  return (
    <div className="volunteer-opportunities-page">
      <section className="volunteer-opportunities-hero">
        <div>
          <p>VOLUNTEER OPPORTUNITIES</p>
          <h1>Find your next opportunity</h1>
          <span>Find active volunteering opportunities that match your availability and interests.</span>

          <div className="volunteer-opportunities-search">
            <label>
              <Search size={20} />
              <input type="search" placeholder="Search opportunities or organisations" />
            </label>
            <button type="button">Search</button>
          </div>
        </div>
      </section>

      <section className="volunteer-opportunities-panel">
        <div className="volunteer-opportunities-header">
          <div>
            <h2>Active Opportunity Postings</h2>
            <p>Start with one available activity while the full listing is being built.</p>
          </div>
          <span className="volunteer-opportunities-count">{mockOpportunities.length} Active</span>
        </div>

        <div className="volunteer-opportunities-grid">
          {mockOpportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity._id}
              opportunity={opportunity}
              variant="volunteer"
              actions={["view"]}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default VolunteerOpportunities;
