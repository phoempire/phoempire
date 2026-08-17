import nodemailer from "nodemailer";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, party, message } = req.body ?? {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.mail.yahoo.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.YAHOO_USER,
        pass: process.env.YAHOO_APP_PASSWORD,
      },
    });

    const textBody = [
      `Name: ${name}`,
      `Email: ${email}`,
      party ? `Party / Occasion: ${party}` : null,
      "",
      "Message:",
      message,
    ].filter(Boolean).join("\n");

    const htmlBody = [
      `<p><strong>Name:</strong> ${name}</p>`,
      `<p><strong>Email:</strong> ${email}</p>`,
      party ? `<p><strong>Party / Occasion:</strong> ${party}</p>` : "",
      `<p><strong>Message:</strong></p>`,
      `<p>${message.replace(/\n/g, "<br>")}</p>`,
    ].join("");

    await transporter.sendMail({
      from: `"Phở Empire Website" <${process.env.YAHOO_USER}>`,
      to: process.env.CONTACT_TO_EMAIL,
      subject: `Website inquiry from ${name}`,
      text: textBody,
      html: htmlBody,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Contact form email error:", err);
    return res.status(500).json({ error: "Failed to send" });
  }
}