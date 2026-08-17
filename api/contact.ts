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
      service: "yahoo",
      auth: {
        user: process.env.YAHOO_USER,
        pass: process.env.YAHOO_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Phở Empire Website" <${process.env.YAHOO_USER}>`,
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `Website inquiry from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        party ? `Party / Occasion: ${party}` : null,
        "",
        "Message:",
        message,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Contact form email error:", err);
    return res.status(500).json({ error: "Failed to send" });
  }
}