// app/api/send-email/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { to, subject, text } = await request.json();
    // Configure your transporter (this example uses Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_USER, // your email address
        pass: process.env.EMAIL_PASS, // your email password or app-specific password
      },
    });
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.response);
    return NextResponse.json({ success: true, info });
  } catch (err: any) {
    console.error('Error in send-email API:', err);
    return NextResponse.json({ error: 'Failed to send email', details: err.message || err }, { status: 500 });
  }
}
