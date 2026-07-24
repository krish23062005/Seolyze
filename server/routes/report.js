import express from "express";
import auth from "../middleware/auth.js";
import Analysis from "../models/Analysis.js";
import User from "../models/User.js";
import { generateReportPDF } from "../services/pdfService.js";
import { sendReportEmail } from "../services/emailService.js";

const router = express.Router();

// @desc    Download PDF report for an analysis
// @route   GET /api/reports/download/:analysisId
// @access  Private
router.get("/download/:analysisId", auth, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.analysisId,
      userId: req.userId,
    });

    if (!analysis) {
      return res.status(404).json({ success: false, message: "Analysis not found" });
    }

    const user = await User.findById(req.userId);
    
    // Generate PDF
    const pdfBuffer = await generateReportPDF(analysis, user.agencyName);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="SEO_Report_${new URL(analysis.url).hostname}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF Download Error:", error);
    res.status(500).json({ success: false, message: "Error generating PDF report" });
  }
});

// @desc    Update report settings (schedule, agency name)
// @route   PUT /api/reports/settings
// @access  Private
router.put("/settings", auth, async (req, res) => {
  try {
    const { reportSchedule, agencyName } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (reportSchedule !== undefined) {
      user.reportSchedule = reportSchedule;
    }
    if (agencyName !== undefined) {
      user.agencyName = agencyName;
    }
    
    await user.save();
    
    res.json({
      success: true,
      settings: {
        reportSchedule: user.reportSchedule,
        agencyName: user.agencyName
      }
    });
  } catch (error) {
    console.error("Report Settings Update Error:", error);
    res.status(500).json({ success: false, message: "Error updating settings" });
  }
});

// @desc    Trigger test email (for dev purposes)
// @route   POST /api/reports/test-email/:analysisId
// @access  Private
router.post("/test-email/:analysisId", auth, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.analysisId,
      userId: req.userId,
    });

    if (!analysis) {
      return res.status(404).json({ success: false, message: "Analysis not found" });
    }

    const user = await User.findById(req.userId);
    
    const pdfBuffer = await generateReportPDF(analysis, user.agencyName);
    await sendReportEmail(user, analysis, pdfBuffer);

    res.json({ success: true, message: "Test email sent. Check server logs for Ethereal URL." });
  } catch (error) {
    console.error("Test Email Error:", error);
    res.status(500).json({ success: false, message: "Error sending test email" });
  }
});
// @desc    Trigger email with latest report
// @route   POST /api/reports/send-latest-email
// @access  Private
router.post("/send-latest-email", auth, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      userId: req.userId,
      status: "completed"
    }).sort({ createdAt: -1 });

    if (!analysis) {
      return res.status(404).json({ success: false, message: "No completed analysis found to send" });
    }

    const user = await User.findById(req.userId);
    
    const pdfBuffer = await generateReportPDF(analysis, user.agencyName);
    await sendReportEmail(user, analysis, pdfBuffer);

    res.json({ success: true, message: "Email sent successfully." });
  } catch (error) {
    console.error("Send Latest Email Error:", error);
    res.status(500).json({ success: false, message: "Error sending email" });
  }
});

export default router;
