import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Opportunity from "../models/opportunity.model.js";
import { Organisation } from "../models/user.model.js";

const MONGO_URI = "mongodb://localhost:27017/VolunteerConnect";

const sampleOrganisations = [
  {
    name: "Helping Hands Malaysia",
    email: "helping.hands@example.com",
    password: "password123",
    biodata:
      "Community support organisation focused on food distribution and neighbourhood outreach.",
  },
  {
    name: "Green Earth Society",
    email: "green.earth@example.com",
    password: "password123",
    biodata:
      "Environmental non-profit running cleanup, recycling, and conservation activities.",
  },
  {
    name: "Paws & Claws KL",
    email: "paws.claws@example.com",
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

const getSeedOrganisations = async () => {
  const organisations = [];

  for (const organisation of sampleOrganisations) {
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
    title: "Community Food Drive Helper",
    details:
      "Support food packing, registration, and distribution for local families during a weekend food drive.",
    organisationId: '6a06531556b67d61f9cd19b9',
    images: [],
    location: "Selangor, Cheras",
    startAt: daysFromNow(7, 9),
    endAt: daysFromNow(7, 14),
    applicationDeadline: daysFromNow(5, 23, 59),
    maxVolunteers: 20,
    approvedVolunteersCount: 8,
    category: ["Community"],
    requirements:
      "Comfortable helping with packing, greeting attendees, and light lifting.",
    status: "active",
    publishedAt: daysFromNow(-3, 9),
  },
  {
    title: "Beach Cleanup Volunteer",
    details:
      "Help collect litter, sort recyclables, and document cleanup progress along the shoreline.",
    organisationId: organisations[1]._id,
    images: [],
    location: "Pulau Pinang, Batu Ferringhi",
    startAt: daysFromNow(10, 8),
    endAt: daysFromNow(10, 12),
    applicationDeadline: daysFromNow(8, 23, 59),
    maxVolunteers: 30,
    approvedVolunteersCount: 16,
    category: ["Environment"],
    requirements:
      "Bring a reusable water bottle and wear comfortable outdoor shoes.",
    status: "active",
    publishedAt: daysFromNow(-2, 10),
  },
  {
    title: "Animal Care Support",
    details:
      "Assist shelter staff with feeding routines, kennel cleaning, and basic enrichment activities.",
    organisationId: organisations[2]._id,
    images: [],
    location: "Kuala Lumpur, Setapak",
    startAt: daysFromNow(12, 9),
    endAt: daysFromNow(12, 13),
    applicationDeadline: daysFromNow(10, 23, 59),
    maxVolunteers: 12,
    approvedVolunteersCount: 5,
    category: ["Animal Welfare"],
    requirements:
      "Suitable for volunteers who are comfortable around cats and dogs.",
    status: "active",
    publishedAt: daysFromNow(-1, 11, 30),
  },
  {
    title: "Completed Community Garden Setup",
    details:
      "Prepared planting beds, labelled seedlings, and arranged gardening tools for a community garden.",
    organisationId: organisations[0]._id,
    images: [],
    location: "Selangor, Semenyih",
    startAt: daysFromNow(-14, 8, 30),
    endAt: daysFromNow(-14, 11, 30),
    applicationDeadline: daysFromNow(-16, 23, 59),
    maxVolunteers: 15,
    approvedVolunteersCount: 15,
    category: ["Community", "Environment"],
    requirements: "Outdoor activity experience is helpful but not required.",
    status: "completed",
    publishedAt: daysFromNow(-30, 9),
  },
  {
    title: "Cancelled Outdoor Health Booth",
    details:
      "A public health awareness booth that was cancelled due to weather conditions.",
    organisationId: organisations[1]._id,
    images: [],
    location: "Kuala Lumpur, Sentul",
    startAt: daysFromNow(3, 10),
    endAt: daysFromNow(3, 15),
    applicationDeadline: daysFromNow(1, 23, 59),
    maxVolunteers: 10,
    approvedVolunteersCount: 2,
    category: ["Health", "Event Support"],
    requirements: "Basic event support experience is helpful.",
    status: "cancelled",
    publishedAt: daysFromNow(-5, 8),
  },
];

const seedOpportunities = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("Missing MONGODB_URI or LOCAL_MONGODB_URI in environment variables");
    }

    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    const organisations = await getSeedOrganisations();
    const opportunities = buildOpportunities(organisations);

    await Opportunity.deleteMany({
      title: {
        $in: opportunities.map((opportunity) => opportunity.title),
      },
    });

    const createdOpportunities = await Opportunity.insertMany(opportunities);

    console.log(`Seeded ${createdOpportunities.length} opportunities successfully`);

    createdOpportunities.forEach((opportunity) => {
      const organisation = organisations.find((item) =>
        item._id.equals(opportunity.organisationId),
      );

      console.log(
        `${opportunity.title} | ${opportunity.status} | ${organisation?.name}`,
      );
    });
  } catch (error) {
    console.error("Error seeding opportunities:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

seedOpportunities();
