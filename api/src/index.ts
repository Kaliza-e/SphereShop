import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { initDb } from "./db";
import { seedData } from "./db/seed";
import { logger } from "./middleware/logger";

const PORT = process.env.PORT || 3000;

async function startServer() {
  await initDb();
  await seedData();

  app.listen(PORT, () => {
    logger.info(`SphereShop API Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  logger.error("Failed to start server:", err);
  process.exit(1);
});
