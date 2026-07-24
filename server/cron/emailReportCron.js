import cron from "node-cron";
import User from "../models/User.js";
import Analysis from "../models/Analysis.js";
import { generateReportPDF } from "../services/pdfService.js";
import { sendReportEmail } from "../services/emailService.js";

export const startEmailReportCron = () => {
  // Run every day at 8:00 AM
  cron.schedule("0 8 * * *", async () => {
    console.log("[CRON] Starting scheduled email reports job...");
    try {
      const now = new Date();
      
      // Find all users who have a report schedule set
      const users = await User.find({
        reportSchedule: { $in: ["weekly", "monthly"] },
      });

      for (const user of users) {
        let shouldSend = false;

        // If they never received one, send it
        if (!user.lastReportSentAt) {
          shouldSend = true;
        } else {
          const daysSinceLastReport = (now - user.lastReportSentAt) / (1000 * 60 * 60 * 24);
          
          if (user.reportSchedule === "weekly" && daysSinceLastReport >= 7) {
            shouldSend = true;
          } else if (user.reportSchedule === "monthly" && daysSinceLastReport >= 30) {
            shouldSend = true;
          }
        }

        if (shouldSend) {
          // Get their latest analysis
          const latestAnalysis = await Analysis.findOne({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(1);

          if (latestAnalysis) {
            try {
              console.log(`[CRON] Generating report for ${user.email} (${latestAnalysis.url})`);
              const pdfBuffer = await generateReportPDF(latestAnalysis, user.agencyName);
              await sendReportEmail(user, latestAnalysis, pdfBuffer);
              
              // Update last sent time
              user.lastReportSentAt = now;
              await user.save();
            } catch (err) {
              console.error(`[CRON] Failed to send report to ${user.email}:`, err);
            }
          }
        }
      }
      console.log("[CRON] Scheduled email reports job completed.");
    } catch (error) {
      console.error("[CRON] Error in email reports job:", error);
    }
  });
  console.log("Email report cron job scheduled.");
};
