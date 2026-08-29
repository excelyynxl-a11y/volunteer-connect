const REQUIRED_SERVER_ENVIRONMENT = ["MONGODB_URI", "JWT_SECRET"];

export const validateEnvironment = () => {
  const missing = REQUIRED_SERVER_ENVIRONMENT.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};
