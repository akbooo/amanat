require("dotenv").config();
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, html) {
    try {
        const result = await resend.emails.send({
            from: "Amanat <onboarding@resend.dev>",
            to,
            subject,
            html  
        });

        console.log("Resend summary email sent:", result);
        return result; 
    } catch (err) {
        console.error("Error sending summary email via Resend:", err);
        return null; 
    }
}

module.exports = sendEmail;