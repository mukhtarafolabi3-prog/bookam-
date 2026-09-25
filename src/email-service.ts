import nodemailer from 'nodemailer';

export interface TicketEmailPayload {
  to: string;
  ticketId: string;
  customerName: string;
  eventName: string;
  eventDate: string;
  eventTime?: string;
  eventVenue: string;
  ticketType: string;
  quantity: number;
  totalAmount?: number;
  appUrl?: string;
}

export function isEmailConfigured(): boolean {
  return Boolean(
    (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) ||
    (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) ||
    process.env.RESEND_API_KEY
  );
}

export function generateTicketEmailText(payload: TicketEmailPayload): string {
  const host = payload.appUrl || 'https://bookam.ng';
  const cleanHost = host.replace(/\/$/, '');
  const ticketUrl = `${cleanHost}/ticket.html?id=${encodeURIComponent(payload.ticketId)}`;

  return `Hi ${payload.customerName || 'Attendee'},

Your payment has been approved and verified! Your official entry ticket pass is ready.

==================================================
🎟️ BOOKAM OFFICIAL EVENT PASS
==================================================
Event: ${payload.eventName}
Pass Number: ${payload.ticketId}
Attendee Name: ${payload.customerName}
Package / Tier: ${payload.ticketType} (${payload.quantity}x)
Date: ${payload.eventDate}
Time: ${payload.eventTime || '09:00 AM'}
Venue: ${payload.eventVenue}
Verification Status: ACTIVE & VERIFIED
==================================================

👉 ACCESS & SCAN YOUR DIGITAL TICKET PASS:
${ticketUrl}

IMPORTANT INSTRUCTIONS:
- Please keep this email safe or bookmark your digital ticket pass link.
- Present the QR code on your phone at the entrance for quick scanning and wristband/badge collection.
- For assistance or queries, reply to this email or contact support@bookam.ng.

Thank you for choosing BOOKAM!
The BOOKAM Events & Community Team
`;
}

export function generateTicketEmailHtml(payload: TicketEmailPayload): string {
  const host = payload.appUrl || 'https://bookam.ng';
  const cleanHost = host.replace(/\/$/, '');
  const ticketUrl = `${cleanHost}/ticket.html?id=${encodeURIComponent(payload.ticketId)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`BOOKAM|${payload.ticketId}|${payload.eventName}`)}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Official Ticket Pass</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 24px 0;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #7C3AED 0%, #4338CA 100%); padding: 32px 24px; text-align: center;">
              <div style="display: inline-block; padding: 6px 14px; background: rgba(255,255,255,0.15); border-radius: 9999px; color: #FFFFFF; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px;">
                Verified Ticket Confirmation
              </div>
              <h1 style="color: #FFFFFF; font-size: 26px; font-weight: 800; margin: 0 0 6px 0;">BOOKAM</h1>
              <p style="color: #E0E7FF; font-size: 14px; margin: 0;">More Than Tickets. It's a Community.</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 28px;">
              <div style="background-color: #ECFDF5; border-left: 4px solid #10B981; padding: 12px 16px; border-radius: 6px; margin-bottom: 24px;">
                <strong style="color: #065F46; font-size: 14px; display: block;">✅ Payment Verified & Approved!</strong>
                <span style="color: #047857; font-size: 13px;">Hi ${payload.customerName}, your admission pass has been officially activated.</span>
              </div>

              <h2 style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 8px 0;">
                ${payload.eventName}
              </h2>

              <!-- Ticket Card Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF5FF; border: 1.5px solid #DDD6FE; border-radius: 12px; margin: 20px 0; padding: 20px;">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; color: #7C3AED;">Official Pass Number</span>
                    <div style="font-size: 24px; font-weight: 900; color: #6D28D9; font-family: monospace; letter-spacing: 1px; margin-top: 4px;">
                      ${payload.ticketId}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <img src="${qrUrl}" alt="Entry QR Code" width="160" height="160" style="display: block; border-radius: 8px; border: 1px solid #E9D5FF; background: #FFFFFF; padding: 8px;" />
                    <span style="font-size: 12px; color: #6B7280; margin-top: 6px; display: block;">Scan QR code at venue entrance</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 13px; color: #374151;">
                      <tr>
                        <td width="35%" style="color: #6B7280; font-weight: 600;">Attendee:</td>
                        <td width="65%" style="font-weight: 700; color: #111827;">${payload.customerName}</td>
                      </tr>
                      <tr>
                        <td style="color: #6B7280; font-weight: 600;">Package / Tier:</td>
                        <td style="font-weight: 700; color: #6D28D9;">${payload.ticketType} (${payload.quantity}x)</td>
                      </tr>
                      <tr>
                        <td style="color: #6B7280; font-weight: 600;">Date & Time:</td>
                        <td style="font-weight: 700; color: #111827;">${payload.eventDate} &bull; ${payload.eventTime || '09:00 AM'}</td>
                      </tr>
                      <tr>
                        <td style="color: #6B7280; font-weight: 600;">Venue:</td>
                        <td style="font-weight: 700; color: #111827;">${payload.eventVenue}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Call to Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 24px 0 16px 0;">
                <tr>
                  <td align="center">
                    <a href="${ticketUrl}" target="_blank" style="background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%); color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 800; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35);">
                      🎫 View & Download Live Digital Pass
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; color: #64748B; line-height: 1.5; margin: 20px 0 0 0; text-align: center;">
                Can't click the button? Copy and paste this link in your browser:<br/>
                <a href="${ticketUrl}" style="color: #7C3AED; word-break: break-all;">${ticketUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F1F5F9; padding: 20px; text-align: center; border-top: 1px solid #E2E8F0; font-size: 12px; color: #64748B;">
              <p style="margin: 0 0 6px 0;">Questions or need support? Email <a href="mailto:bookam26@gmail.com" style="color: #7C3AED;">bookam26@gmail.com</a></p>
              <p style="margin: 0; font-size: 11px; color: #94A3B8;">&copy; ${new Date().getFullYear()} BOOKAM Platform. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendTicketEmail(payload: TicketEmailPayload): Promise<{ success: boolean; message: string; method?: string }> {
  const textContent = generateTicketEmailText(payload);
  const htmlContent = generateTicketEmailHtml(payload);
  const subject = `[BOOKAM TICKET PASS] Official Ticket for ${payload.eventName} - #${payload.ticketId}`;

  // 1. Check for Resend API Key
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'BOOKAM Tickets <tickets@resend.dev>',
          to: [payload.to],
          subject,
          html: htmlContent,
          text: textContent,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: `Email delivered to ${payload.to} via Resend`, method: 'resend' };
      }
      console.warn('Resend API error:', data);
    } catch (e: any) {
      console.warn('Resend dispatch failed:', e.message);
    }
  }

  // 2. Check for Gmail or Custom SMTP
  const hasGmail = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD;
  const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasGmail || hasSmtp) {
    try {
      const transportConfig = hasGmail
        ? {
            service: 'gmail',
            auth: {
              user: process.env.GMAIL_USER,
              pass: process.env.GMAIL_APP_PASSWORD,
            },
          }
        : {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          };

      const transporter = nodemailer.createTransport(transportConfig as any);
      const fromAddr = process.env.GMAIL_USER || process.env.SMTP_FROM || process.env.SMTP_USER;

      const info = await transporter.sendMail({
        from: `"BOOKAM Tickets" <${fromAddr}>`,
        to: payload.to,
        subject,
        text: textContent,
        html: htmlContent,
      });

      return {
        success: true,
        message: `Email delivered successfully to ${payload.to} (Message ID: ${info.messageId})`,
        method: 'smtp',
      };
    } catch (err: any) {
      console.warn('SMTP dispatch failed:', err.message);
      return {
        success: false,
        message: `SMTP delivery failed: ${err.message}`,
        method: 'smtp_error',
      };
    }
  }

  return {
    success: false,
    message: 'Automated background SMTP is not yet configured. Please use One-Click Gmail Dispatch or configure GMAIL_USER/GMAIL_APP_PASSWORD in environment settings.',
    method: 'smtp_not_configured',
  };
}
