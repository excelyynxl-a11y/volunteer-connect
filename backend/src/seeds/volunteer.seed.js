import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Volunteer } from "../models/user.model.js";

const MONGO_URI = process.env.LOCAL_MONGODB_URI || process.env.MONGODB_URI;

const volunteers = [
  {
    name: "Alicia Tan",
    email: "alicia.volunteer@example.com",
    password: "password123",
    avatar: "",
    ageGroup: "21-30",
    biodata:
      "I am passionate about community service, education support, and helping local non-profit organisations run meaningful events.",
    skills: ["Teaching", "Event Support", "Communication"],
    availability: [
      {
        dayOfWeek: "Saturday",
        startTime: "09:00",
        endTime: "13:00",
        preference: "preferred",
      },
      {
        dayOfWeek: "Sunday",
        startTime: "10:00",
        endTime: "15:00",
        preference: "available",
      },
    ],
    resume: "",
    approvalStatus: "approved",
  },
  {
    name: "Brandon Lee",
    email: "brandon.volunteer@example.com",
    password: "password123",
    avatar: "",
    ageGroup: "31-40",
    biodata:
      "I have experience supporting charity drives, food distribution activities, and volunteer coordination for community outreach programs.",
    skills: ["Food Distribution", "Team Coordination", "Logistics"],
    availability: [
      {
        dayOfWeek: "Friday",
        startTime: "18:00",
        endTime: "21:00",
        preference: "available",
      },
      {
        dayOfWeek: "Saturday",
        startTime: "14:00",
        endTime: "18:00",
        preference: "preferred",
      },
    ],
    resume: "",
    approvalStatus: "pending",
  },
  {
    name: "Chloe Ng",
    email: "chloe.volunteer@example.com",
    password: "password123",
    avatar: "",
    ageGroup: "21-30",
    biodata:
      "I enjoy working with children, elderly communities, and environmental initiatives. I am comfortable assisting with both online and in-person activities.",
    skills: ["Childcare", "Elderly Support", "Environmental Cleanup"],
    availability: [
      {
        dayOfWeek: "Wednesday",
        startTime: "17:00",
        endTime: "20:00",
        preference: "available",
      },
      {
        dayOfWeek: "Sunday",
        startTime: "08:00",
        endTime: "12:00",
        preference: "preferred",
      },
    ],
    resume: "",
    approvalStatus: "approved",
  },
];

const seedVolunteers = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("Missing MONGODB_URI or MONGO_URI in environment variables");
    }

    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    await Volunteer.deleteMany({
      email: {
        $in: volunteers.map((volunteer) => volunteer.email),
      },
    });

    const hashedVolunteers = await Promise.all(
      volunteers.map(async (volunteer) => ({
        ...volunteer,
        password: await bcrypt.hash(volunteer.password, 10),
      })),
    );

    const createdVolunteers = await Volunteer.insertMany(hashedVolunteers);

    console.log(`Seeded ${createdVolunteers.length} volunteers successfully`);

    createdVolunteers.forEach((volunteer) => {
      console.log(`${volunteer.name} | ${volunteer.email} | ${volunteer._id}`);
    });
  } catch (error) {
    console.error("Error seeding volunteers:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

seedVolunteers();
