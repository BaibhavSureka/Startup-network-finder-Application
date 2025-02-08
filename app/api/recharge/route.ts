import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { google } from "googleapis";

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

// Gmail API Setup
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.GMAIL_REDIRECT_URI!
);
oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN! });

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

// Email Transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number.parseInt(process.env.EMAIL_SERVER_PORT!),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// Function to fetch unread emails with subject "recharge 5 credits"
async function fetchRechargeEmails() {
  try {
    console.log("Fetching unread recharge emails...");
    
    const response = await gmail.users.messages.list({
      userId: "me",
      q: "is:unread subject:'recharge 5 credits'",
    });

    if (!response.data.messages) {
      console.log("No unread recharge emails found.");
      return [];
    }

    const emails = [];
    for (const msg of response.data.messages) {
      const email = await gmail.users.messages.get({ userId: "me", id: msg.id! });
      const fromHeader = email.data.payload?.headers?.find((h) => h.name === "From");
      const emailSender = fromHeader?.value?.match(/<(.*)>/)?.[1] || null;
      
      if (emailSender) emails.push({ id: msg.id, sender: emailSender });
    }

    console.log("Recharge emails:", emails);
    return emails;
  } catch (error) {
    console.error("Error fetching emails:", error);
    return [];
  }
}

// Recharge API
export async function POST(req: NextRequest) {
  try {
    console.log("Recharge API called...");

    const rechargeEmails = await fetchRechargeEmails();
    if (rechargeEmails.length === 0) {
      return NextResponse.json({ message: "No new recharge requests found" });
    }

    for (const { id, sender } of rechargeEmails) {
      console.log(`Processing recharge for: ${sender}`);

      // Fetch user from Supabase
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("credits, recharge_status")
        .eq("email", sender)
        .single();

      if (userError || !userData) {
        console.error(`Error fetching user ${sender}:`, userError);
        continue;
      }

      console.log(`User ${sender} - Current credits: ${userData.credits}, Recharge Status: ${userData.recharge_status}`);

      if (userData.recharge_status) {
        console.log(`User ${sender} has already recharged once. Sending denial email...`);
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: sender,
          subject: "Credit Recharge Request Denied",
          text: "Sorry, we are not offering additional credits at this time.",
        });
      } else {
        console.log(`Recharging user ${sender} with 5 credits...`);
        const { error: updateError } = await supabase
          .from("users")
          .update({ credits: userData.credits + 5, recharge_status: true })
          .eq("email", sender);

        if (updateError) {
          console.error(`Error updating user ${sender} credits:`, updateError);
          continue;
        }

        console.log(`Sending confirmation email to ${sender}...`);
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: sender,
          subject: "Credits Recharged",
          text: "Your account has been recharged with 5 additional credits.",
        });
      }

      // Mark email as read
      console.log(`Marking email ${id} as read...`);
      await gmail.users.messages.modify({
        userId: "me",
        id: id,
        requestBody: { removeLabelIds: ["UNREAD"] },
      });
    }

    return NextResponse.json({ message: "Processed recharge requests" });
  } catch (error) {
    console.error("Recharge processing error:", error);
    return NextResponse.json({ error: "An error occurred while processing recharges" }, { status: 500 });
  }
}
