import dotenv from 'dotenv';
dotenv.config()

console.log(process.env.SENDGRID_API_KEY)

import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const msg = {
  to: 'anthonysu6206026@gmail.com', // Change to your recipient
  from: 'anthonysu6206026@gmail.com', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })