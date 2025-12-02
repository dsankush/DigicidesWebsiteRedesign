// app/api/contact/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs'; // ✅ Ensures Node environment on Vercel

const resend = new Resend(process.env.RESEND_API_KEY);
const WEBHOOK_URL = process.env.WEBHOOK_URL; // ✅ Add webhook URL to environment variables

export async function POST(req: Request) {
  try {
    // ✅ Extract all form fields correctly
    const { name, organization, email, phone, message } = await req.json() as { 
      name: string; 
      organization: string; 
      email: string; 
      phone: string; 
      message: string; 
    };

    console.log("Form Data:", name, organization, email, phone, message);

    // ✅ Basic validation
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ✅ Send the email through Resend
    const data = await resend.emails.send({
      from: 'connect@dreamlaunch.studio',
      to: ['connect@digicides.com', 'jeet.das@digicides.com', 'manoj.rajput@digicides.com'],
      subject: `New Contact Form Submission from ${name}${organization ? ` (${organization})` : ''}`,
      html: `
        <h2>New Contact Us Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Organization:</strong> ${organization || 'N/A'}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr/>
        <p style="font-size:12px;color:#666;">Submitted on: ${new Date().toLocaleString('en-IN')}</p>
      `,
    });

    // ✅ Trigger webhook with form data
    if (WEBHOOK_URL) {
      try {
        const webhookPayload = {
          name,
          organization: organization || null,
          email,
          phone: phone || null,
          message,
          submittedAt: new Date().toISOString(),
          timestamp: Date.now()
        };

        const webhookResponse = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        });

        if (!webhookResponse.ok) {
          console.error('Webhook failed:', webhookResponse.status, await webhookResponse.text());
        } else {
          console.log('Webhook triggered successfully');
        }
      } catch (webhookError) {
        // ✅ Log webhook errors but don't fail the main request
        console.error('Webhook trigger error:', webhookError);
      }
    }

    // ✅ Return success
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Email send failed:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}