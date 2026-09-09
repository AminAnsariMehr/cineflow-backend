import "dotenv/config";
import { validateEnv } from "./config/env.js";
import app from "./app.js";
import connectDB from "./config/db.js";

validateEnv();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Cineflow API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`❌ Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
