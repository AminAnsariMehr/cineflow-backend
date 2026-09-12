import "dotenv/config";

const requiredEnvVars = ["MONGODB_URI"];

for (const key of requiredEnvVars) {
  // if (!process.env[key]) {
  //   throw new Error(`Missing required environment variable: ${key}`);
  // }

  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

// const parsedPort = Number(process.env.PORT);

const rawPort = process.env.PORT?.trim();
const parsedPort = rawPort === undefined ? 5000 : Number(rawPort);

if (!Number.isInteger(parsedPort) || parsedPort <= 0 || parsedPort > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const nodeEnv = process.env.NODE_ENV?.trim() || "development";

const supportedEnvironments = ["development", "production", "test"];

if (!supportedEnvironments.includes(nodeEnv)) {
  throw new Error(
    `NODE_ENV must be one of: ${supportedEnvironments.join(", ")}`,
  );
}

const corsOrigin = process.env.CORS_ORIGIN?.trim() || "*";

// export const env = {
//   port:
//     process.env.PORT === undefined
//       ? 5000
//       : Number.isInteger(parsedPort) && parsedPort > 0
//         ? parsedPort
//         : (() => {
//             throw new Error("PORT must be a positive integer");
//           })(),
//   mongoUri: process.env.MONGODB_URI,
//   corsOrigin: process.env.CORS_ORIGIN || "*",
//   nodeEnv: process.env.NODE_ENV || "development",
// };

export const env = Object.freeze({
  port: parsedPort,
  mongoUri: process.env.MONGODB_URI.trim(),
  corsOrigin,
  nodeEnv,
});
