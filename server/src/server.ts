import { createApp } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const app = createApp();

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

void startServer();