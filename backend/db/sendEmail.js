import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config();


// Set the API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);



export const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const msg = {
            to,
            from: "anthonysu6206026@gmail.com", // Verified sender email .env doens't work 
            subject,
            text,
            html,
        };
        await sgMail.send(msg);
        console.log('Email sent successfully to', to);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};
