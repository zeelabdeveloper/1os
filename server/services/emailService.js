// const nodemailer = require('nodemailer');
// const pug = require('pug');
// const htmlToText = require('html-to-text');
// const { EmailConfig } = require('../helper/emailConfig');

// module.exports = class Email {
//   constructor(user, url) {
//     this.to = user.email;
//     this.firstName = user.name.split(' ')[0];
//     this.url = url;
//     this.from = `HR Team <${process.env.EMAIL_FROM}>`;
//   }

//   newTransport() {
//     if (process.env.NODE_ENV === 'production') {
//       return nodemailer.createTransport({
//         service: 'SendGrid',
//         auth: {
//           user: process.env.SENDGRID_USERNAME,
//           pass: process.env.SENDGRID_PASSWORD
//         }
//       });
//     }

//     return nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: process.env.EMAIL_PORT,
//       auth: {
//         user: EmailConfig.mailFromAddress,
//         pass: EmailConfig.mailPassword
//       }
//     });
//   }

//   async send(template, subject) {
//     const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
//       firstName: this.firstName,
//       url: this.url,
//       subject
//     });

//     const mailOptions = {
//       from: this.from,
//       to: this.to,
//       subject,
//       html,
//       text: htmlToText.fromString(html)
//     };

//     await this.newTransport().sendMail(mailOptions);
//   }

//   async sendInterviewScheduled() {
//     await this.send('interviewScheduled', 'Your interview has been scheduled!');
//   }
// };

// // Send interview scheduled email
// module.exports.sendInterviewScheduledEmail = async ({
//   candidateEmail,
//   candidateName,
//   interviewerName,
//   startTime,
//   endTime,
//   meetingLink,
//   position
// }) => {
//   const transport = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD
//     }
//   });

//   const formattedDate = new Date(startTime).toLocaleDateString('en-US', {
//     weekday: 'long',
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric'
//   });

//   const startTimeFormatted = new Date(startTime).toLocaleTimeString('en-US', {
//     hour: '2-digit',
//     minute: '2-digit',
//     timeZoneName: 'short'
//   });

//   const endTimeFormatted = new Date(endTime).toLocaleTimeString('en-US', {
//     hour: '2-digit',
//     minute: '2-digit',
//     timeZoneName: 'short'
//   });

//   const message = {
//     from: process.env.EMAIL_FROM,
//     to: candidateEmail,
//     subject: `Interview Scheduled for ${position}`,
//     html: `
//       <div>
//         <h2>Interview Scheduled</h2>
//         <p>Hello ${candidateName},</p>
//         <p>Your interview for the position of <strong>${position}</strong> has been scheduled.</p>
        
//         <h3>Interview Details:</h3>
//         <ul>
//           <li><strong>Date:</strong> ${formattedDate}</li>
//           <li><strong>Time:</strong> ${startTimeFormatted} - ${endTimeFormatted}</li>
//           <li><strong>Interviewer:</strong> ${interviewerName}</li>
//           ${meetingLink ? `<li><strong>Meeting Link:</strong> <a href="${meetingLink}">Join Meeting</a></li>` : ''}
//         </ul>
        
//         <p>Please make sure to be available at the scheduled time.</p>
//         <p>Best regards,<br/>The Hiring Team</p>
//       </div>
//     `,
//     text: `
//       Interview Scheduled
//       Hello ${candidateName},
      
//       Your interview for the position of ${position} has been scheduled.
      
//       Interview Details:
//       - Date: ${formattedDate}
//       - Time: ${startTimeFormatted} - ${endTimeFormatted}
//       - Interviewer: ${interviewerName}
//       ${meetingLink ? `- Meeting Link: ${meetingLink}` : ''}
      
//       Please make sure to be available at the scheduled time.
      
//       Best regards,
//       The Hiring Team
//     `
//   };

//   await transport.sendMail(message);
// };