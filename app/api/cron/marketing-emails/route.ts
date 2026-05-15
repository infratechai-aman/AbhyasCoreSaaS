import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import nodemailer from "nodemailer";

export async function GET(request: Request) {
  // 1. Verify Vercel Cron Request
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate Brevo SMTP Credentials
  if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_PASS) {
    return NextResponse.json({ error: "Missing Brevo SMTP credentials in environment variables" }, { status: 500 });
  }

  if (!adminDb) {
    return NextResponse.json({ error: "Server not configured." }, { status: 500 });
  }

  try {
    // 3. Find "Free" users who haven't been emailed recently
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const snapshot = await adminDb
      .collection("users")
      .where("subscription.plan", "==", "Free")
      .get();

    const usersToEmail = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (!data.email) continue;
      
      const lastPromotedAt = data.lastPromotedAt;
      if (!lastPromotedAt || lastPromotedAt < thirtyDaysAgo) {
        usersToEmail.push({ id: doc.id, email: data.email, displayName: data.displayName || "Student" });
      }

      // Brevo free tier limit is 300 per day
      if (usersToEmail.length >= 300) {
        break;
      }
    }

    if (usersToEmail.length === 0) {
      return NextResponse.json({ message: "No free users found eligible for promotion today." });
    }

    // 4. Configure Nodemailer with Brevo
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    // 5. Send Emails
    let sentCount = 0;
    const nowISO = new Date().toISOString();

    for (const user of usersToEmail) {
      const emailHtml = `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #111827; font-size: 28px; font-weight: 800; margin: 0;">Unlock Your Full Potential 🚀</h1>
            <p style="color: #4b5563; font-size: 16px; margin-top: 10px;">Upgrade to AbhyasCore Premium</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <p style="color: #374151; font-size: 16px; line-height: 1.5;">Hi ${user.displayName},</p>
            <p style="color: #374151; font-size: 16px; line-height: 1.5;">We noticed you're currently on the Free plan. To truly ace your exams, you need the right tools. AbhyasCore Premium gives you everything you need to succeed.</p>
            
            <ul style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0; padding-left: 20px;">
              <li>✨ <strong>Unlimited Custom Exams:</strong> Create infinite tests tailored to your weak points.</li>
              <li>🤖 <strong>Advanced AI Tutor:</strong> Get instant, step-by-step explanations for any question.</li>
              <li>📚 <strong>Full PYQ Archive:</strong> Access decades of Past Year Questions.</li>
            </ul>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://abhyascore.com/dashboard/checkout" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; font-weight: bold; font-size: 16px; text-decoration: none; padding: 14px 28px; border-radius: 8px; box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.39);">Upgrade to Premium Now</a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>© ${new Date().getFullYear()} AbhyasCore. All rights reserved.</p>
          </div>
        </div>
      `;

      try {
        await transporter.sendMail({
          from: '"AbhyasCore Team" <team@abhyascore.com>',
          to: user.email,
          subject: "Ready to ace your exams? 🚀",
          html: emailHtml,
        });

        // 6. Update user's lastPromotedAt timestamp
        await adminDb.collection("users").doc(user.id).update({
          lastPromotedAt: nowISO
        });

        sentCount++;
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
        // We continue to the next user even if one fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully processed and sent ${sentCount} promotional emails.` 
    });

  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
