const requiredEnvVars = ["MONGODB_URI"];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const parsedPort = Number(process.env.PORT);

export const env = {
  port:
    process.env.PORT === undefined
      ? 5000
      : Number.isInteger(parsedPort) && parsedPort > 0
        ? parsedPort
        : (() => {
            throw new Error("PORT must be a positive integer");
          })(),
  mongoUri: process.env.MONGODB_URI,
  corsOrigin: process.env.CORS_ORIGIN || "*",
  nodeEnv: process.env.NODE_ENV || "development",
};
