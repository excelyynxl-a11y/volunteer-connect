import mongoose from "mongoose";
import dotenv from "dotenv";

import Application from "../models/application.model.js";
import { Volunteer } from "../models/user.model.js";

dotenv.config({
  path: "../../.env",
});

const seedApplications = async () => {
  try {
    const mongoUri = process.env.LOCAL_MONGODB_URI;

    if (!mongoUri) {
      throw new Error("LOCAL_MONGODB_URI is missing in .env");
    }

    await mongoose.connect(mongoUri);

    console.log("MongoDB connected:", mongoUri);


    const volunteerOne = await Volunteer.findOne({
      email: "seedvolunteer1@example.com",
    });

    const volunteerTwo = await Volunteer.findOne({
      email: "seedvolunteer2@example.com",
    });

    if (!volunteerOne || !volunteerTwo) {
      throw new Error("Seed volunteers not found.");
    }

    const applications = [
      {
        volunteerId: volunteerOne._id,
        opportunityId: new mongoose.Types.ObjectId(),
        status: "Completed",
        loggedHours: 12,
        isHoursSubmitted: true,
      },
      {
        volunteerId: volunteerOne._id,
        opportunityId: new mongoose.Types.ObjectId(),
        status: "Approved",
        loggedHours: 5,
        isHoursSubmitted: false,
      },
      {
        volunteerId: volunteerTwo._id,
        opportunityId: new mongoose.Types.ObjectId(),
        status: "Completed",
        loggedHours: 20,
        isHoursSubmitted: true,
      },
    ];

    await Application.deleteMany({
      volunteerId: {
        $in: [volunteerOne._id, volunteerTwo._id],
      },
    });

    await Application.insertMany(applications);

    console.log("Application seed data inserted successfully");

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seedApplications();