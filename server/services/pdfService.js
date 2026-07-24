import ejs from "ejs";
import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateReportPDF = async (analysis, agencyName) => {
  try {
    // 1. Render the HTML using EJS
    const templatePath = path.join(__dirname, "..", "templates", "report.ejs");
    const html = await ejs.renderFile(templatePath, {
      analysis,
      agencyName,
    });

    // 2. Launch Puppeteer to create PDF
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    
    const page = await browser.newPage();
    
    // Set HTML content
    await page.setContent(html, { waitUntil: "networkidle0" });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        bottom: "20px",
        left: "20px",
        right: "20px"
      }
    });

    await browser.close();
    
    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};
