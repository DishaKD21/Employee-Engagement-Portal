import cron from "node-cron";
import { logger } from "../../config/logger.js";
import { recognitionService } from "./recognition.service.js";

let recognitionSchedulerStarted = false;

export function startRecognitionScheduler() {
  if (recognitionSchedulerStarted) {
    return;
  }

  cron.schedule("0 8 * * *", () => {
    void recognitionService.runDailyRecognitionChecks().then((result) => {
      logger.info(`Recognition scheduler completed for ${result.runDate}`);
    }).catch((error) => {
      logger.error("Recognition scheduler failed", error);
    });
  });

  recognitionSchedulerStarted = true;
  logger.info("Recognition scheduler started for 8:00 AM daily runs");
}