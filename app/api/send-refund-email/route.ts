import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

type RefundEmailPayload = {
  email: string; // user's email whose coupon expired
};

export async function POST(request: Request) {
  try {
    const { email: userEmail }: RefundEmailPayload = await request.json();

    if (!userEmail) {
      return NextResponse.json(
        { error: "Missing `email` in request body" },
        { status: 400 }
      );
    }

    // Admin email is now handled on server side
    const adminEmail = "testai01dummy@gmail.com";

    // configure transporter (same as your send-email route)
    const transporter = nodemailer.createTransport({
      host: "smtpout.secureserver.net",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: `Refund Request: ${userEmail}`,
      text: `
Hello My Lord,

The discount code created by ${userEmail} has now been redeemed three times.
Kindly process a refund for that user.

Thank you,
Your Application
      `.trim(),
      html: `
        <p>Hello My Lord,</p>
        <p>
          The discount code created by <strong>${userEmail}</strong> has now been redeemed three times.
        </p>
        <p>Please process a refund for that user.</p>
        <p>Thank you,<br/>Your Application</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Refund-email sent:", info.response);

    return NextResponse.json({ success: true, info: info.response });
  } catch (err: any) {
    console.error("Error in send-refund-email API:", err);
    return NextResponse.json(
      { error: "Failed to send refund email", details: err.message },
      { status: 500 }
    );
  }
}
