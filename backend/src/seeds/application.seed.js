import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import Application from "../models/application.model.js";
import Opportunity from "../models/opportunity.model.js";
import { Organisation, Volunteer } from "../models/user.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const MONGO_URI =
  process.env.LOCAL_MONGODB_URI ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/VolunteerConnect";

const SEED_VOLUNTEER_ID = process.env.SEED_VOLUNTEER_ID;

const seedOrganisations = [
  {
    name: "Helping Hands Malaysia",
    email: "seed.helpinghands@example.com",
    password: "password123",
    biodata:
      "Community support organisation focused on food distribution and neighbourhood outreach.",
  },
  {
    name: "Green Earth Society",
    email: "seed.greenearth@example.com",
    password: "password123",
    biodata:
      "Environmental non-profit running cleanup, recycling, and conservation activities.",
  },
  {
    name: "Kids First Foundation",
    email: "seed.kidsfirst@example.com",
    password: "password123",
    biodata:
      "Education charity supporting literacy, mentoring, and school-readiness programs.",
  },
  {
    name: "Paws & Claws KL",
    email: "seed.pawsclaws@example.com",
    password: "password123",
    biodata:
      "Animal welfare organisation supporting shelter operations and adoption events.",
  },
];

const daysFromNow = (days, hour, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const getSeedVolunteer = async () => {
  if (!SEED_VOLUNTEER_ID) {
    throw new Error(
      "SEED_VOLUNTEER_ID is missing. Add SEED_VOLUNTEER_ID=<your volunteer user id> to backend/.env",
    );
  }

  if (!mongoose.Types.ObjectId.isValid(SEED_VOLUNTEER_ID)) {
    throw new Error("SEED_VOLUNTEER_ID must be a valid MongoDB ObjectId.");
  }

  const volunteer = await Volunteer.findById(SEED_VOLUNTEER_ID).select(
    "name email",
  );

  if (!volunteer) {
    throw new Error(`Volunteer not found for SEED_VOLUNTEER_ID=${SEED_VOLUNTEER_ID}`);
  }

  return volunteer;
};

const upsertSeedOrganisations = async () => {
  const organisations = [];

  for (const organisation of seedOrganisations) {
    const existingOrganisation = await Organisation.findOne({
      email: organisation.email,
    });

    if (existingOrganisation) {
      existingOrganisation.name = organisation.name;
      existingOrganisation.biodata = organisation.biodata;
      existingOrganisation.approvalStatus = "approved";
      await existingOrganisation.save();
      organisations.push(existingOrganisation);
      continue;
    }

    const createdOrganisation = await Organisation.create({
      ...organisation,
      password: await bcrypt.hash(organisation.password, 10),
      avatar: "",
      approvalStatus: "approved",
    });

    organisations.push(createdOrganisation);
  }

  return organisations;
};

const buildOpportunities = (organisations) => [
  {
    title: "Seed Community Food Drive Helper",
    details:
      "Support food packing, registration, and distribution for local families during a weekend food drive.",
    organisationId: organisations[0]._id,
    location: "Selangor, Cheras",
    startAt: daysFromNow(7, 9),
    endAt: daysFromNow(7, 14),
    applicationDeadline: daysFromNow(5, 23, 59),
    maxVolunteers: 20,
    approvedVolunteersCount: 1,
    category: ["Community"],
    requirements:
      "Comfortable helping with packing\nAble to do light lifting\nFriendly with visitors",
    status: "active",
    publishedAt: daysFromNow(-3, 9),
  },
  {
    title: "Seed Beach Cleanup Volunteer",
    details:
      "Help collect litter, sort recyclables, and document cleanup progress along the shoreline.",
    organisationId: organisations[1]._id,
    location: "Pulau Pinang, Batu Ferringhi",
    startAt: daysFromNow(10, 8),
    endAt: daysFromNow(10, 12),
    applicationDeadline: daysFromNow(8, 23, 59),
    maxVolunteers: 30,
    approvedVolunteersCount: 1,
    category: ["Environment"],
    requirements:
      "Bring a reusable water bottle\nWear comfortable outdoor shoes",
    status: "active",
    publishedAt: daysFromNow(-2, 10),
  },
  {
    title: "Seed Literacy Tutor",
    details:
      "Help primary school students practise reading and short writing exercises.",
    organisationId: organisations[2]._id,
    location: "Selangor, Kajang",
    startAt: daysFromNow(12, 15),
    endAt: daysFromNow(12, 18),
    applicationDeadline: daysFromNow(10, 23, 59),
    maxVolunteers: 12,
    approvedVolunteersCount: 0,
    category: ["Education"],
    requirements: "Patient with children\nBasic English reading skills",
    status: "active",
    publishedAt: daysFromNow(-1, 11, 30),
  },
  {
    title: "Seed Animal Shelter Assistant",
    details:
      "Assist shelter staff with feeding routines, kennel cleaning, and enrichment activities.",
    organisationId: organisations[3]._id,
    location: "Kuala Lumpur, Setapak",
    startAt: daysFromNow(14, 9),
    endAt: daysFromNow(14, 13),
    applicationDeadline: daysFromNow(12, 23, 59),
    maxVolunteers: 14,
    approvedVolunteersCount: 0,
    category: ["Animal Welfare"],
    requirements: "Comfortable around cats and dogs\nClosed-toe shoes required",
    status: "active",
    publishedAt: daysFromNow(-1, 13),
  },
  {
    title: "Seed Recycling Drive Sorter",
    details:
      "Sort recyclables, guide drop-off visitors, and track collection categories.",
    organisationId: organisations[1]._id,
    location: "Pulau Pinang, Butterworth",
    startAt: daysFromNow(16, 9),
    endAt: daysFromNow(16, 12, 30),
    applicationDeadline: daysFromNow(14, 23, 59),
    maxVolunteers: 15,
    approvedVolunteersCount: 0,
    category: ["Environment"],
    requirements: "Gloves provided\nAble to sort by material type",
    status: "active",
    publishedAt: daysFromNow(-1, 15),
  },
  {
    title: "Seed Fundraising Booth Volunteer",
    details:
      "Help run a public booth, explain campaign goals, and record donation pledges.",
    organisationId: organisations[2]._id,
    location: "Selangor, Subang Jaya",
    startAt: daysFromNow(18, 11),
    endAt: daysFromNow(18, 17),
    applicationDeadline: daysFromNow(16, 23, 59),
    maxVolunteers: 18,
    approvedVolunteersCount: 0,
    category: ["Fundraising", "Event Support"],
    requirements: "Confident speaking to the public\nBriefing will be provided",
    status: "active",
    publishedAt: daysFromNow(-1, 16),
  },
  {
    title: "Seed Senior Care Companion",
    details:
      "Spend time with seniors through conversation, games, and light activity support.",
    organisationId: organisations[0]._id,
    location: "Kuala Lumpur, Setapak",
    startAt: daysFromNow(20, 10),
    endAt: daysFromNow(20, 13),
    applicationDeadline: daysFromNow(18, 23, 59),
    maxVolunteers: 10,
    approvedVolunteersCount: 0,
    category: ["Elderly Care"],
    requirements: "Friendly communication\nComfortable assisting seniors",
    status: "active",
    publishedAt: daysFromNow(-1, 17),
  },
];

const applicationStatusByTitle = {
  "Seed Community Food Drive Helper": "approved",
  "Seed Beach Cleanup Volunteer": "approved",
  "Seed Literacy Tutor": "pending",
  "Seed Animal Shelter Assistant": "pending",
  "Seed Recycling Drive Sorter": "rejected",
  "Seed Fundraising Booth Volunteer": "rejected",
  "Seed Senior Care Companion": "withdrawn",
};

const seedApplications = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    const volunteer = await getSeedVolunteer();
    const organisations = await upsertSeedOrganisations();
    const opportunities = buildOpportunities(organisations);
    const seedOpportunityTitles = opportunities.map((opportunity) => opportunity.title);

    const existingSeedOpportunities = await Opportunity.find({
      title: { $in: seedOpportunityTitles },
    }).select("_id");

    await Application.deleteMany({
      opportunityId: {
        $in: existingSeedOpportunities.map((opportunity) => opportunity._id),
      },
    });

    await Opportunity.deleteMany({
      title: { $in: seedOpportunityTitles },
    });

    const createdOpportunities = await Opportunity.insertMany(opportunities);
    const applications = createdOpportunities.map((opportunity) => {
      const status = applicationStatusByTitle[opportunity.title] || "pending";

      return {
        opportunityId: opportunity._id,
        volunteerId: volunteer._id,
        status,
        withdrawalReason:
          status === "withdrawn"
            ? "Schedule conflict after reviewing my availability."
            : "",
      };
    });

    await Application.insertMany(applications);

    console.log(`Seed volunteer: ${volunteer.name} <${volunteer.email}>`);
    console.log(`Seeded ${organisations.length} organisations`);
    console.log(`Seeded ${createdOpportunities.length} opportunities`);
    console.log(`Seeded ${applications.length} applications`);
  } catch (error) {
    console.error("Application seed error:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

seedApplications();
