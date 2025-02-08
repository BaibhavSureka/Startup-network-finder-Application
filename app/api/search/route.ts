import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import nodemailer from "nodemailer";

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Configure Nodemailer transporter for sending emails
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number.parseInt(process.env.EMAIL_SERVER_PORT!, 10),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  try {
    // Check user session
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { query } = await req.json();

    // Debug logs for API key (only for development)
    if (process.env.NODE_ENV !== "production") {
      console.log("API Key:", process.env.GEMINI_API_KEY ? "Loaded ✅" : "Not Found ❌");
    }

    // Fetch user credits and recharge status
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("credits, recharge_status")
      .eq("email", session.user.email)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user data:", userError);
      return NextResponse.json({ error: "Error fetching user data" }, { status: 500 });
    }

    // If user has no credits, check their recharge status
    if (userData.credits <= 0) {
      if (userData.recharge_status) {
        // User already used their free recharge → Send denial email
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: session.user.email,
          subject: "Credit Recharge Request Denied",
          text: "Sorry, we are not offering additional credits at this time.",
        });

        return NextResponse.json(
          { error: "You have already used your free recharge. No more credits available." },
          { status: 403 }
        );
      } else {
        // User has not used their free recharge → Send credits exhausted email
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: session.user.email,
          subject: "Credits Exhausted",
          text: "Your credits are exhausted. Please send a new email to baibhavsureka1@gmail.com by mentioning 'recharge 5 credits' in the subject to get extra credits.",
        });

        return NextResponse.json(
          { error: "Your credits are exhausted. Please check your email to recharge." },
          { status: 403 }
        );
      }
    }

    // Fetch investors and mentors data
    const { data: investorsMentors, error: dbError } = await supabase
      .from("investors_mentors")
      .select("*");

    if (dbError) {
      console.error("Error fetching data from database:", dbError);
      return NextResponse.json({ error: "Error fetching data from database" }, { status: 500 });
    }

    // Call Gemini API with fixed endpoint and API key in URL
    try {
      const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Given the following list of investors and mentors: ${JSON.stringify(investorsMentors)}, 
                  and the user query: "${query}", 
                  please suggest the most suitable investor or mentor. 
                  Respond with only the name of the investor or mentor.`,
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Extract result from API response
      const result = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "No match found";

      // Deduct 1 credit from the user
      await supabase
        .from("users")
        .update({ credits: userData.credits - 1 })
        .eq("email", session.user.email);

      return NextResponse.json({ result });
    } catch (error: any) {
      console.error("Error calling Gemini API:", error.response?.data || error.message);
      return NextResponse.json({ error: "Error processing your request. Please try again later." }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
