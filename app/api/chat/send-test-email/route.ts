import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
const sentEmails = new Set<string>();

export async function POST(request: Request) {
  const { email } = await request.json();

  if (sentEmails.has(email)) {
    return NextResponse.json(
      { success: false, error: "Email already sent to this address" },
      { status: 400 }
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'mail.privateemail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'noreply@citaleco.com',
        pass: 'v^rtqn;iE9JdFFM'
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const info = await transporter.sendMail({
      from: '"Citaleco" <noreply@citaleco.com>',
      to: email,
      subject: 'Test Login Notification',
      text: `This is a test email sent to ${email}`,
      html: `
        <div>
          <h1>Citaleco Test Email</h1>
          <p>This is a test email sent to ${email}</p>
          <p>Sent at: ${new Date().toLocaleString()}</p>
        </div>
      `
    });

    sentEmails.add(email);
    
    console.log('Message ID:', info.messageId);
    return NextResponse.json({ 
      success: true,
      messageId: info.messageId
    });
    
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to send email" 
      },
      { status: 500 }
    );
  }
}