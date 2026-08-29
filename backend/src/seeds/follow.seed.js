import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import Application from "../models/application.model.js";
import Follow from "../models/follow.model.js";
import Opportunity from "../models/opportunity.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
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

const SEED_PASSWORD = process.env.SEED_PASSWORD || "Password123!";
const ALLOW_REMOTE_SEED = process.env.ALLOW_REMOTE_SEED === "true";
const SEED_TITLE_PREFIX = "[Seed]";
const SEED_TITLE_PATTERN = `^${SEED_TITLE_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`;

const isRemoteMongoUri = (uri) => uri.startsWith("mongodb+srv://");

const getMongoTargetLabel = (uri) => {
  if (uri.startsWith("mongodb+srv://")) {
    const target = uri.replace("mongodb+srv://", "").split("@").pop();
    return `remote ${target}`;
  }

  try {
    const url = new URL(uri);
    return `${url.host}${url.pathname}`;
  } catch {
    return uri;
  }
};

const organisations = [
  {
    key: "org1",
    name: "Helping Hands Malaysia",
    email: "vc.seed.org1@gmail.com",
    biodata:
      "Community support organisation focused on food distribution, neighbourhood outreach, and family support programs.",
  },
  {
    key: "org2",
    name: "Green Earth Society",
    email: "vc.seed.org2@gmail.com",
    biodata:
      "Environmental non-profit running cleanup, recycling, conservation, and public education activities.",
  },
  {
    key: "org3",
    name: "Kids First Foundation",
    email: "vc.seed.org3@gmail.com",
    biodata:
      "Education charity supporting literacy, mentoring, homework clubs, and school-readiness programs.",
  },
  {
    key: "org4",
    name: "Paws & Claws KL",
    email: "vc.seed.org4@gmail.com",
    biodata:
      "Animal welfare organisation supporting shelter operations, adoption drives, and animal care awareness.",
  },
  {
    key: "org5",
    name: "CareBridge Community",
    email: "vc.seed.org5@gmail.com",
    biodata:
      "Community health and elderly care organisation coordinating companionship, wellness, and event support.",
  },
];

const volunteers = [
  {
    key: "vol1",
    name: "Alicia Tan",
    email: "vc.seed.volunteer1@gmail.com",
    ageGroup: "21-30",
    biodata:
      "Friendly volunteer interested in education support, food distribution, and community events.",
    skills: ["Teaching", "Event Support", "Communication"],
    availability: [
      { dayOfWeek: "Saturday", startTime: "09:00", endTime: "14:00", preference: "preferred" },
      { dayOfWeek: "Sunday", startTime: "10:00", endTime: "15:00", preference: "available" },
    ],
  },
  {
    key: "vol2",
    name: "Brandon Lee",
    email: "vc.seed.volunteer2@gmail.com",
    ageGroup: "31-40",
    biodata:
      "Experienced in logistics, charity drives, and coordinating small volunteer teams.",
    skills: ["Logistics", "Food Distribution", "Team Coordination"],
    availability: [
      { dayOfWeek: "Friday", startTime: "18:00", endTime: "21:00", preference: "available" },
      { dayOfWeek: "Saturday", startTime: "14:00", endTime: "18:00", preference: "preferred" },
    ],
  },
  {
    key: "vol3",
    name: "Chloe Ng",
    email: "vc.seed.volunteer3@gmail.com",
    ageGroup: "21-30",
    biodata:
      "Enjoys working with children, elderly communities, and environmental activities.",
    skills: ["Childcare", "Elderly Support", "Environmental Cleanup"],
    availability: [
      { dayOfWeek: "Wednesday", startTime: "17:00", endTime: "20:00", preference: "available" },
      { dayOfWeek: "Sunday", startTime: "08:00", endTime: "12:00", preference: "preferred" },
    ],
  },
  {
    key: "vol4",
    name: "Daniel Lim",
    email: "vc.seed.volunteer4@gmail.com",
    ageGroup: "41-50",
    biodata:
      "Patient and reliable volunteer with mentoring, fundraising, and admin support experience.",
    skills: ["Mentoring", "Fundraising", "Administration"],
    availability: [
      { dayOfWeek: "Tuesday", startTime: "19:00", endTime: "21:00", preference: "available" },
      { dayOfWeek: "Saturday", startTime: "08:00", endTime: "12:00", preference: "preferred" },
    ],
  },
  {
    key: "vol5",
    name: "Farah Ismail",
    email: "vc.seed.volunteer5@gmail.com",
    ageGroup: "31-40",
    biodata:
      "Volunteer interested in health awareness, public engagement, and inclusive community programs.",
    skills: ["Public Speaking", "Health Awareness", "Disability Support"],
    availability: [
      { dayOfWeek: "Thursday", startTime: "18:00", endTime: "21:00", preference: "available" },
      { dayOfWeek: "Sunday", startTime: "13:00", endTime: "17:00", preference: "preferred" },
    ],
  },
];

const daysFromNow = (days, hour, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const opportunityTemplates = [
  {
    title: "Community Food Drive Helper",
    orgKey: "org1",
    details:
      "Support food packing, registration, and distribution for local families during a weekend food drive.",
    location: "Selangor, Cheras",
    days: 7,
    startHour: 9,
    endHour: 14,
    deadlineOffset: 2,
    maxVolunteers: 20,
    category: ["Community"],
    requirements: "Comfortable with light lifting\nFriendly with visitors\nAble to stand for several hours",
    status: "active",
  },
  {
    title: "Beach Cleanup Volunteer",
    orgKey: "org2",
    details:
      "Help collect litter, sort recyclables, and document cleanup progress along the shoreline.",
    location: "Pulau Pinang, Batu Ferringhi",
    days: 10,
    startHour: 8,
    endHour: 12,
    deadlineOffset: 2,
    maxVolunteers: 30,
    category: ["Environment"],
    requirements: "Bring a reusable water bottle\nWear comfortable outdoor shoes",
    status: "active",
  },
  {
    title: "Literacy Tutor Session",
    orgKey: "org3",
    details:
      "Help primary school students practise reading, spelling, and short writing exercises.",
    location: "Selangor, Kajang",
    days: 12,
    startHour: 15,
    endHour: 18,
    deadlineOffset: 2,
    maxVolunteers: 12,
    category: ["Education"],
    requirements: "Patient with children\nBasic English reading skills",
    status: "active",
  },
  {
    title: "Animal Shelter Assistant",
    orgKey: "org4",
    details:
      "Assist shelter staff with feeding routines, kennel cleaning, and enrichment activities.",
    location: "Kuala Lumpur, Setapak",
    days: 14,
    startHour: 9,
    endHour: 13,
    deadlineOffset: 2,
    maxVolunteers: 14,
    category: ["Animal Welfare"],
    requirements: "Comfortable around cats and dogs\nClosed-toe shoes required",
    status: "active",
  },
  {
    title: "Senior Care Companion Visit",
    orgKey: "org5",
    details:
      "Spend time with elderly residents through conversation, simple games, and activity assistance.",
    location: "Kuala Lumpur, Kepong",
    days: 15,
    startHour: 10,
    endHour: 13,
    deadlineOffset: 3,
    maxVolunteers: 10,
    category: ["Elderly Care", "Community"],
    requirements: "Patient communication\nRespectful around elderly residents",
    status: "active",
  },
  {
    title: "Recycling Drive Sorter",
    orgKey: "org2",
    details:
      "Sort recyclables, guide drop-off visitors, and track collection categories at a public recycling drive.",
    location: "Pulau Pinang, Butterworth",
    days: 16,
    startHour: 9,
    endHour: 13,
    deadlineOffset: 2,
    maxVolunteers: 15,
    category: ["Environment", "Event Support"],
    requirements: "Gloves provided\nAble to sort materials carefully",
    status: "active",
  },
  {
    title: "Fundraising Booth Volunteer",
    orgKey: "org3",
    details:
      "Help run a public booth, explain campaign goals, and record donation pledges.",
    location: "Selangor, Subang Jaya",
    days: 18,
    startHour: 11,
    endHour: 17,
    deadlineOffset: 2,
    maxVolunteers: 18,
    category: ["Fundraising", "Event Support"],
    requirements: "Confident speaking to the public\nBriefing will be provided",
    status: "active",
  },
  {
    title: "Inclusive Sports Day Support",
    orgKey: "org5",
    details:
      "Assist participants, manage stations, and support accessibility needs during an inclusive sports day.",
    location: "Selangor, Shah Alam",
    days: 21,
    startHour: 8,
    endHour: 13,
    deadlineOffset: 4,
    maxVolunteers: 25,
    category: ["Disability Support", "Event Support"],
    requirements: "Able to follow safety guidance\nRespectful and inclusive attitude",
    status: "active",
  },
  {
    title: "Community Garden Setup",
    orgKey: "org1",
    details:
      "Prepare planting beds, label seedlings, arrange tools, and welcome residents to a community garden.",
    location: "Selangor, Semenyih",
    days: 23,
    startHour: 8,
    endHour: 12,
    deadlineOffset: 3,
    maxVolunteers: 15,
    category: ["Community", "Environment"],
    requirements: "Outdoor activity experience is helpful but not required",
    status: "active",
  },
  {
    title: "Public Health Awareness Booth",
    orgKey: "org5",
    details:
      "Support a health awareness booth by distributing flyers and helping visitors complete short surveys.",
    location: "Kuala Lumpur, Sentul",
    days: 24,
    startHour: 10,
    endHour: 15,
    deadlineOffset: 3,
    maxVolunteers: 10,
    category: ["Health", "Event Support"],
    requirements: "Comfortable speaking with visitors\nBasic Malay or English preferred",
    status: "active",
  },
  {
    title: "Homework Club Assistant",
    orgKey: "org3",
    details:
      "Help secondary students complete homework and organise study resources after school.",
    location: "Selangor, Petaling Jaya",
    days: 27,
    startHour: 16,
    endHour: 19,
    deadlineOffset: 3,
    maxVolunteers: 8,
    category: ["Education"],
    requirements: "Comfortable with school-level subjects\nPatient mentoring style",
    status: "active",
  },
  {
    title: "Pet Adoption Event Crew",
    orgKey: "org4",
    details:
      "Guide visitors, help manage adoption booths, and support animal handlers during an adoption event.",
    location: "Kuala Lumpur, Mont Kiara",
    days: 29,
    startHour: 10,
    endHour: 17,
    deadlineOffset: 4,
    maxVolunteers: 16,
    category: ["Animal Welfare", "Event Support"],
    requirements: "Comfortable around pets\nAble to follow handler instructions",
    status: "active",
  },
  {
    title: "Completed Soup Kitchen Shift",
    orgKey: "org1",
    details:
      "Prepared meal packs, served visitors, and cleaned kitchen stations after a community dinner.",
    location: "Kuala Lumpur, Chow Kit",
    days: -18,
    startHour: 16,
    endHour: 21,
    deadlineOffset: 3,
    maxVolunteers: 12,
    category: ["Community"],
    requirements: "Food hygiene briefing provided before shift",
    status: "completed",
  },
  {
    title: "Completed River Cleanup",
    orgKey: "org2",
    details:
      "Removed litter from a riverbank and sorted recyclable materials after the cleanup.",
    location: "Selangor, Klang",
    days: -25,
    startHour: 8,
    endHour: 12,
    deadlineOffset: 5,
    maxVolunteers: 22,
    category: ["Environment"],
    requirements: "Outdoor shoes and sun protection recommended",
    status: "completed",
  },
  {
    title: "Completed Reading Carnival",
    orgKey: "org3",
    details:
      "Ran reading corners, storytelling activities, and book giveaway stations for children.",
    location: "Selangor, Puchong",
    days: -32,
    startHour: 9,
    endHour: 15,
    deadlineOffset: 5,
    maxVolunteers: 18,
    category: ["Education", "Community"],
    requirements: "Comfortable interacting with children and parents",
    status: "completed",
  },
  {
    title: "Closed Food Bank Inventory",
    orgKey: "org1",
    details:
      "Counted donated goods, checked expiry dates, and prepared storage shelves for the next distribution.",
    location: "Selangor, Ampang",
    days: -7,
    startHour: 9,
    endHour: 12,
    deadlineOffset: 3,
    maxVolunteers: 6,
    category: ["Community"],
    requirements: "Attention to detail\nAble to lift small boxes",
    status: "closed",
  },
  {
    title: "Closed Vaccination Queue Support",
    orgKey: "org5",
    details:
      "Assisted visitors with queue flow, registration guidance, and basic crowd movement.",
    location: "Kuala Lumpur, Titiwangsa",
    days: -5,
    startHour: 8,
    endHour: 14,
    deadlineOffset: 3,
    maxVolunteers: 14,
    category: ["Health"],
    requirements: "Calm under pressure\nAble to guide visitors politely",
    status: "closed",
  },
  {
    title: "Cancelled Outdoor Adoption Fair",
    orgKey: "org4",
    details:
      "A pet adoption fair that was cancelled due to venue maintenance work.",
    location: "Selangor, Kota Damansara",
    days: 5,
    startHour: 10,
    endHour: 16,
    deadlineOffset: 2,
    maxVolunteers: 20,
    category: ["Animal Welfare"],
    requirements: "Event briefing would have been provided on arrival",
    status: "cancelled",
  },
  {
    title: "Cancelled Park Cleanup",
    orgKey: "org2",
    details:
      "A park cleanup event cancelled due to unsafe weather conditions.",
    location: "Selangor, Putrajaya",
    days: 6,
    startHour: 8,
    endHour: 11,
    deadlineOffset: 2,
    maxVolunteers: 24,
    category: ["Environment", "Community"],
    requirements: "Outdoor work and recyclable sorting",
    status: "cancelled",
  },
  {
    title: "Cancelled Youth Mentoring Workshop",
    orgKey: "org3",
    details:
      "A youth mentoring workshop cancelled because the host venue became unavailable.",
    location: "Kuala Lumpur, Bangsar",
    days: 9,
    startHour: 13,
    endHour: 17,
    deadlineOffset: 3,
    maxVolunteers: 9,
    category: ["Education"],
    requirements: "Mentoring experience preferred",
    status: "cancelled",
  },
];

const applicationTemplates = [
  ["vol1", 0, "approved"],
  ["vol2", 0, "pending"],
  ["vol3", 0, "rejected"],
  ["vol4", 1, "approved"],
  ["vol5", 1, "pending"],
  ["vol1", 2, "pending"],
  ["vol2", 2, "approved"],
  ["vol3", 3, "pending"],
  ["vol4", 3, "rejected"],
  ["vol5", 4, "approved"],
  ["vol1", 5, "withdrawn", "Schedule conflict after applying."],
  ["vol2", 6, "pending"],
  ["vol3", 7, "approved"],
  ["vol4", 8, "pending"],
  ["vol5", 9, "rejected"],
  ["vol1", 10, "pending"],
  ["vol2", 11, "approved"],
  ["vol3", 12, "approved"],
  ["vol4", 13, "approved"],
  ["vol5", 14, "approved"],
  ["vol1", 15, "approved"],
  ["vol2", 16, "pending"],
  ["vol3", 17, "withdrawn", "No longer available on the event date."],
  ["vol4", 18, "rejected"],
  ["vol5", 19, "pending"],
];

const followTemplates = [
  ["vol1", "org1"],
  ["vol1", "org2"],
  ["vol1", "org3"],
  ["vol2", "org2"],
  ["vol2", "org4"],
  ["vol3", "org1"],
  ["vol3", "org5"],
  ["vol4", "org3"],
  ["vol5", "org4"],
  ["vol5", "org5"],
];

const upsertSeedUsers = async () => {
  const password = await bcrypt.hash(SEED_PASSWORD, 10);
  const organisationDocs = [];
  const volunteerDocs = [];

  for (const organisation of organisations) {
    const doc = await Organisation.findOneAndUpdate(
      { email: organisation.email },
      {
        $set: {
          name: organisation.name,
          email: organisation.email,
          password,
          biodata: organisation.biodata,
          avatar: "",
          approvalStatus: "approved",
        },
      },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    );
    organisationDocs.push(doc);
  }

  for (const volunteer of volunteers) {
    const doc = await Volunteer.findOneAndUpdate(
      { email: volunteer.email },
      {
        $set: {
          name: volunteer.name,
          email: volunteer.email,
          password,
          ageGroup: volunteer.ageGroup,
          biodata: volunteer.biodata,
          skills: volunteer.skills,
          availability: volunteer.availability,
          resume: "https://example.com/seed-resume.pdf",
          avatar: "",
          approvalStatus: "approved",
        },
      },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
    );
    volunteerDocs.push(doc);
  }

  return {
    organisationByKey: Object.fromEntries(
      organisations.map((organisation, index) => [organisation.key, organisationDocs[index]]),
    ),
    volunteerByKey: Object.fromEntries(
      volunteers.map((volunteer, index) => [volunteer.key, volunteerDocs[index]]),
    ),
    organisationDocs,
    volunteerDocs,
  };
};

const buildOpportunityDocument = (template, organisationByKey, index) => {
  const startAt = daysFromNow(template.days, template.startHour);
  const endAt = daysFromNow(template.days, template.endHour);
  const applicationDeadline = daysFromNow(
    template.days - template.deadlineOffset,
    23,
    59,
  );

  return {
    title: `${SEED_TITLE_PREFIX} ${template.title}`,
    details: template.details,
    organisationId: organisationByKey[template.orgKey]._id,
    location: template.location,
    startAt,
    endAt,
    applicationDeadline,
    maxVolunteers: template.maxVolunteers,
    approvedVolunteersCount: 0,
    category: template.category,
    requirements: template.requirements,
    status: template.status,
    publishedAt: daysFromNow(-index - 1, 9),
  };
};

const recreateSeedOpportunities = async (organisationByKey) => {
  const oldSeedOpportunities = await Opportunity.find({
    title: { $regex: SEED_TITLE_PATTERN },
  }).select("_id");

  await Application.deleteMany({
    opportunityId: { $in: oldSeedOpportunities.map((opportunity) => opportunity._id) },
  });

  await Opportunity.deleteMany({
    title: { $regex: SEED_TITLE_PATTERN },
  });

  return Opportunity.insertMany(
    opportunityTemplates.map((template, index) =>
      buildOpportunityDocument(template, organisationByKey, index),
    ),
  );
};

const createSeedApplications = async (volunteerByKey, opportunityDocs) => {
  const applications = applicationTemplates.map(
    ([volunteerKey, opportunityIndex, status, withdrawalReason = ""]) => ({
      volunteerId: volunteerByKey[volunteerKey]._id,
      opportunityId: opportunityDocs[opportunityIndex]._id,
      status,
      withdrawalReason,
    }),
  );

  const applicationDocs = await Application.insertMany(applications, { ordered: false });
  const approvedCounts = new Map();

  for (const application of applicationDocs) {
    if (application.status !== "approved") continue;

    const opportunityId = application.opportunityId.toString();
    approvedCounts.set(opportunityId, (approvedCounts.get(opportunityId) || 0) + 1);
  }

  await Promise.all(
    opportunityDocs.map((opportunity) =>
      Opportunity.updateOne(
        { _id: opportunity._id },
        { $set: { approvedVolunteersCount: approvedCounts.get(opportunity._id.toString()) || 0 } },
      ),
    ),
  );

  return applicationDocs;
};

const createSeedFollows = async (volunteerByKey, organisationByKey) => {
  const seedVolunteerIds = Object.values(volunteerByKey).map(
    (volunteer) => volunteer._id,
  );

  await Follow.deleteMany({
    volunteerId: { $in: seedVolunteerIds },
  });

  return Follow.insertMany(
    followTemplates.map(([volunteerKey, organisationKey]) => ({
      volunteerId: volunteerByKey[volunteerKey]._id,
      organisationId: organisationByKey[organisationKey]._id,
    })),
  );
};

const recreateSeedConversations = async (volunteerByKey, organisationByKey) => {
  const seedVolunteer = volunteerByKey.vol2;
  const seedOrg = organisationByKey.org1;
  const secondOrg = organisationByKey.org2;
  const organisationIds = [seedOrg._id, secondOrg._id];

  const oldConversations = await Conversation.find({
    $or: [
      {
        volunteerId: seedVolunteer._id,
        organisationId: { $in: organisationIds },
      },
      { participants: seedVolunteer._id },
    ],
  }).select("_id");
  const oldConversationIds = oldConversations.map((conversation) => conversation._id);

  await Message.deleteMany({ conversationId: { $in: oldConversationIds } });
  await Conversation.deleteMany({ _id: { $in: oldConversationIds } });

  const now = Date.now();
  const minutesAgo = (mins) => new Date(now - mins * 60 * 1000);

  const conversations = [
    {
      volunteerId: seedVolunteer._id,
      organisationId: seedOrg._id,
      messages: [
        {
          senderId: seedVolunteer._id,
          content: "Hello, I would like to confirm my availability for the Saturday food drive.",
          createdAt: minutesAgo(38),
          isRead: true,
        },
        {
          senderId: seedOrg._id,
          content: "Hello Brandon, your shift is confirmed for Saturday 9am at the community hall.",
          createdAt: minutesAgo(30),
          isRead: false,
        },
        {
          senderId: seedVolunteer._id,
          content: "Thanks, I will be there.",
          createdAt: minutesAgo(25),
          isRead: true,
        },
        {
          senderId: seedOrg._id,
          content: "Please bring your ID and wear comfortable shoes.",
          createdAt: minutesAgo(20),
          isRead: false,
        },
      ],
    },
    {
      volunteerId: seedVolunteer._id,
      organisationId: secondOrg._id,
      messages: [
        {
          senderId: seedVolunteer._id,
          content: "Hi, I would like to join the beach cleanup event next week.",
          createdAt: minutesAgo(110),
          isRead: true,
        },
        {
          senderId: secondOrg._id,
          content: "Thanks for your interest. Please bring a reusable water bottle and a hat.",
          createdAt: minutesAgo(95),
          isRead: false,
        },
      ],
    },
  ];

  const insertedConversations = await Conversation.insertMany(
    conversations.map((conv) => ({
      volunteerId: conv.volunteerId,
      organisationId: conv.organisationId,
      lastMessageAt: conv.messages[conv.messages.length - 1].createdAt,
      responseDeadline: new Date(
        conv.messages[conv.messages.length - 1].createdAt.getTime() + 3 * 60 * 60 * 1000,
      ),
    })),
  );

  const allMessages = [];

  insertedConversations.forEach((conversation, index) => {
    conversations[index].messages.forEach((message) => {
      allMessages.push({
        conversationId: conversation._id,
        senderId: message.senderId,
        content: message.content,
        isRead: message.isRead,
        createdAt: message.createdAt,
      });
    });
  });

  await Message.insertMany(allMessages);

  return insertedConversations;
};

const printSummary = ({
  organisationByKey,
  organisationDocs,
  volunteerDocs,
  opportunityDocs,
  applicationDocs,
  followDocs,
  seededConversations,
}) => {
  console.log("\nSeed completed.");
  console.log(`Users: ${organisationDocs.length} organisations, ${volunteerDocs.length} volunteers`);
  console.log(`Opportunities: ${opportunityDocs.length}`);
  console.log(`Applications: ${applicationDocs.length}`);
  console.log(`Follows: ${followDocs.length}`);
  console.log(`Conversations: ${seededConversations.length}`);
  console.log(`Password for all seed accounts: ${SEED_PASSWORD}`);

  console.log("\nOrganisation accounts:");
  organisationDocs.forEach((organisation) => {
    console.log(`- ${organisation.email} (${organisation.name})`);
  });

  console.log("\nVolunteer accounts:");
  volunteerDocs.forEach((volunteer) => {
    console.log(`- ${volunteer.email} (${volunteer.name})`);
  });

  console.log("\nPrimary follow-page test account:");
  console.log(`- ${volunteers[0].email} (${volunteers[0].name}) follows:`);
  followTemplates
    .filter(([volunteerKey]) => volunteerKey === volunteers[0].key)
    .forEach(([, organisationKey]) => {
      console.log(`  - ${organisationByKey[organisationKey].name}`);
    });
};

const seed = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("Missing MONGODB_URI in backend/.env");
    }

    if (isRemoteMongoUri(MONGO_URI) && !ALLOW_REMOTE_SEED) {
      throw new Error(
        [
          "Refusing to seed a remote MongoDB database.",
          "Set LOCAL_MONGODB_URI=mongodb://localhost:27017/VolunteerConnect in backend/.env for local seed data.",
          "If you intentionally want to seed a remote database, set ALLOW_REMOTE_SEED=true.",
        ].join(" "),
      );
    }

    console.log(`Seed target: ${getMongoTargetLabel(MONGO_URI)}`);
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    const {
      organisationByKey,
      volunteerByKey,
      organisationDocs,
      volunteerDocs,
    } = await upsertSeedUsers();

    const opportunityDocs = await recreateSeedOpportunities(organisationByKey);
    const applicationDocs = await createSeedApplications(volunteerByKey, opportunityDocs);
    const followDocs = await createSeedFollows(
      volunteerByKey,
      organisationByKey,
    );
    const seededConversations = await recreateSeedConversations(volunteerByKey, organisationByKey);

    printSummary({
      organisationByKey,
      organisationDocs,
      volunteerDocs,
      opportunityDocs,
      applicationDocs,
      followDocs,
      seededConversations,
    });
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("\nMongoDB disconnected");
  }
};

seed();
