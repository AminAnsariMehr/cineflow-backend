const requiredEnv = ["MONGODB_URI", "CORS_ORIGIN", "MONGODB_URI"];

export const validateEnv = () => {
  const missing = requiredEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`❌ Missing environment variables: ${missing.join(", ")}`);
  }

  console.log("✅ Environment variables validated");
};

const requiredEnvVars = ["PORT", "MONGODB_URI"];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  corsOrigin: process.env.CORS_ORIGIN || "*",
  nodeEnv: process.env.NODE_ENV || "development",
};
