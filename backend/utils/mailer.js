import nodemailer from 'nodemailer';

/**
 * Gmail SMTP Transport
 * Uses App Password (NOT your actual Gmail password).
 * Generate at: Google Account → Security → 2FA → App Passwords → Mail
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

/**
 * Send follow-up email to citizen asking if their grievance is resolved.
 * @param {string} to       — Citizen's email address
 * @param {string} grievanceId — MongoDB ObjectId of the grievance
 * @param {string} category — Grievance category (e.g. 'water')
 * @param {string} title    — Short title of the grievance
 */
export async function sendFollowUpEmail(to, grievanceId, category, title) {
  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resolvedLink = `${frontendBase}/grievance/${grievanceId}?feedback=resolved`;
  const pendingLink = `${frontendBase}/grievance/${grievanceId}?feedback=pending`;

  const mailOptions = {
    from: `"BhashaFlow" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Is your grievance resolved? — BhashaFlow #GRV-${grievanceId}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 22px;">🇮🇳 BhashaFlow</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 5px 0 0;">Multilingual Citizen Grievance Portal</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 25px; border: 1px solid #e0e0e0;">
          <h2 style="color: #333; margin-top: 0;">Follow-Up on Your Grievance</h2>
          
          <p style="color: #555; line-height: 1.6;">
            Namaste! We are following up on your grievance submitted to BhashaFlow.
          </p>
          
          <div style="background: #fff; border-left: 4px solid #667eea; padding: 15px; margin: 15px 0; border-radius: 4px;">
            <p style="margin: 0; color: #333;"><strong>Category:</strong> ${category}</p>
            <p style="margin: 5px 0 0; color: #333;"><strong>Title:</strong> ${title}</p>
            <p style="margin: 5px 0 0; color: #888;"><strong>Reference:</strong> GRV-${grievanceId}</p>
          </div>
          
          <p style="color: #555; line-height: 1.6;">
            Has your issue been resolved? Please let us know:
          </p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resolvedLink}" 
               style="background: #4CAF50; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 0 10px; display: inline-block; font-weight: bold;">
              ✅ Yes, Resolved
            </a>
            <a href="${pendingLink}" 
               style="background: #FF9800; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 0 10px; display: inline-block; font-weight: bold;">
              ❌ No, Still Pending
            </a>
          </div>
          
          <p style="color: #888; font-size: 12px; margin-top: 20px;">
            If you did not submit this grievance, please ignore this email.
          </p>
        </div>
        
        <div style="background: #333; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="color: #aaa; margin: 0; font-size: 12px;">
            BhashaFlow — NIIT University Capstone Project 2024
          </p>
        </div>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Follow-up email sent to ${to} — MessageID: ${info.messageId}`);
  return info;
}

export default transporter;
