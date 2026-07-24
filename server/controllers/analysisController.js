import Analysis from "../models/Analysis.js";
import User from "../models/User.js";
import { scrapeUrl } from "../services/scraperService.js";
import { analyzeSeoData } from "../services/geminiService.js";

export const analyzeUrl = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url)
      return res
        .status(400)
        .json({ success: false, message: "URL is required" });

    // Validate URL format
    let validUrl;
    try {
      validUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid URL format" });
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const now = new Date();
    const todayStr = now.toDateString();
    const lastDateStr = user.lastAnalysisDate ? new Date(user.lastAnalysisDate).toDateString() : null;

    if (lastDateStr === todayStr) {
      if (user.plan === "free" && user.analysisCount >= 5) {
        return res.status(429).json({ success: false, message: "Daily analysis limit reached (5/5). Please upgrade to Pro for unlimited analyses." });
      }
      user.analysisCount += 1;
    } else {
      user.analysisCount = 1;
      user.lastAnalysisDate = now;
    }
    await user.save();

    const analysis = await Analysis.create({
      userId: req.userId,
      url: validUrl.href,
      status: "processing",
    });
    res.json({
      success: true,
      message: "Analysis started",
      analysisId: analysis._id,
    });

    try {
      // Step 1: Scrape the URL with BrowserBase
      const scrapeResult = await scrapeUrl(validUrl.href);

      if (!scrapeResult.success) {
        analysis.status = "failed";
        await analysis.save();
        return;
      }

      const aiResult = await analyzeSeoData(scrapeResult.data);

      if (!aiResult.success) {
        analysis.status = "failed";
        await analysis.save();
        return;
      }

      analysis.overallScore = aiResult.data.overallScore || 0;
      analysis.categories = aiResult.data.categories || {};
      analysis.metaData = scrapeResult.data.metaData || {};
      analysis.headings = scrapeResult.data.headings || {};
      analysis.links = scrapeResult.data.links || {};
      analysis.images = scrapeResult.data.images || {};
      analysis.bodyText = scrapeResult.data.bodyText || "";
      analysis.keywords = aiResult.data.keywords || [];
      analysis.issues = aiResult.data.issues || [];
      analysis.loadTime = scrapeResult.data.loadTime || 0;
      analysis.pageSize = scrapeResult.data.pageSize || 0;
      analysis.wordCount = scrapeResult.data.wordCount || 0;
      analysis.status = "completed";
      await analysis.save();
    } catch (bgError) {
      console.error("Background analysis error:", bgError.message);
      try {
        analysis.status = "failed";
        await analysis.save();
      } catch (saveError) {
        console.error("Failed to save failed status:", saveError.message);
      }
    }
  } catch (error) {
    console.error("Analyze URl error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: " server error" });
    }
  }
};

export const getAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!analysis)
      return res
        .status(404)
        .json({ success: false, message: "Analysis not found" });

    res.json({ success: true, analysis });
  } catch (error) {
    console.error("Get analysis error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAnalyses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const analyses = await Analysis.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-issues -keywords");

    const total = await Analysis.countDocuments({ userId: req.userId });

    res.json({
      success: true,
      analyses,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get analyses error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteAnalysis = async (req, res) => {
  try {
    await Analysis.findByIdAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    res.json({ success: true, message: "Analysis deleted" });
  } catch (error) {
    console.error("Delete analysis error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
