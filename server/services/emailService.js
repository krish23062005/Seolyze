import nodemailer from "nodemailer";

let testAccount = null;
let transporter = null;

// Initialize Ethereal email transporter for testing
const initTransporter = async () => {
  if (transporter) return transporter;

  try {
    testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    console.log("Email Transporter Initialized!");
    return transporter;
  } catch (error) {
    console.error("Failed to initialize email transporter:", error);
    throw error;
  }
};

export const sendReportEmail = async (user, analysis, pdfBuffer) => {
  try {
    const tp = await initTransporter();
    const agencyName = user.agencyName || "Seolyze";
    
    const mailOptions = {
      from: `"${agencyName} Reports" <reports@${agencyName.toLowerCase().replace(/\s+/g, '')}.com>`,
      to: user.email,
      subject: `Your SEO Report for ${analysis.url} is Ready!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #3b82f6;">SEO Audit Complete</h2>
          <p>Hi ${user.name},</p>
          <p>Your scheduled SEO audit for <strong>${analysis.url}</strong> has been completed.</p>
          <p><strong>Overall Score:</strong> ${analysis.overallScore}/100</p>
          <p>We found ${analysis.issues.length} issues that could be improved.</p>
          <p>Please find your detailed report attached to this email.</p>
          <br/>
          <p>Best regards,<br/>The ${agencyName} Team</p>
        </div>
      `,
      attachments: [
        {
          filename: `SEO_Report_${new URL(analysis.url).hostname}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf"
        }
      ]
    };

    const info = await tp.sendMail(mailOptions);
    console.log("-----------------------------------------");
    console.log("Email sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    console.log("-----------------------------------------");
    
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
