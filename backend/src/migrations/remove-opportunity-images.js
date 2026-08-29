import "dotenv/config";
import mongoose from "mongoose";

const mongoUri = process.env.LOCAL_MONGODB_URI || process.env.MONGODB_URI;
const isConfirmed = process.env.CONFIRM_REMOVE_OPPORTUNITY_IMAGES === "true";
const isRemoteMongoUri = mongoUri?.startsWith("mongodb+srv://");

const runMigration = async () => {
  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI or LOCAL_MONGODB_URI");
  }

  if (isConfirmed && isRemoteMongoUri && process.env.ALLOW_REMOTE_MIGRATION !== "true") {
    throw new Error(
      "Refusing to modify a remote MongoDB URI. Set ALLOW_REMOTE_MIGRATION=true only after taking a backup.",
    );
  }

  await mongoose.connect(mongoUri);

  try {
    const opportunities = mongoose.connection.collection("opportunities");
    const filter = { images: { $exists: true } };
    const documentsWithImageField = await opportunities.countDocuments(filter);
    const documentsWithImageValues = await opportunities.countDocuments({
      "images.0": { $exists: true },
    });

    console.log(
      `Found ${documentsWithImageField} Opportunity document(s) with the legacy images field; ${documentsWithImageValues} contain image values.`,
    );

    if (!isConfirmed) {
      console.log(
        "Dry run only. Take a database backup, then set CONFIRM_REMOVE_OPPORTUNITY_IMAGES=true to remove the field.",
      );
      return;
    }

    const result = await opportunities.updateMany(filter, { $unset: { images: "" } });
    const remainingDocuments = await opportunities.countDocuments(filter);

    console.log(
      `Removed the legacy images field from ${result.modifiedCount} Opportunity document(s). ${remainingDocuments} document(s) remain with the field.`,
    );
  } finally {
    await mongoose.disconnect();
  }
};

runMigration().catch((error) => {
  console.error(`Opportunity image migration failed: ${error.message}`);
  process.exitCode = 1;
});
