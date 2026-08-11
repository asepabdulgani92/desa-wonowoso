const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    // For development, we can use Ethereal or just log it if no env vars
    // For production, use Gmail or SMTP

    // Check if env vars are set, otherwise use a dummy logger or fail gracefully
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('Skipping email sending: EMAIL_USER or EMAIL_PASS not set.');
        console.log('Email Options:', {
            email: options.email,
            subject: options.subject,
            message: options.message
        });
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail', // or use host/port for SMTP
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Define email options
    const mailOptions = {
        from: `Desa Wonowoso <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.message, // We use HTML for better formatting
        attachments: options.attachments || []
    };

    // Send email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
