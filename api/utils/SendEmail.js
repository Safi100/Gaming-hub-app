const nodemailer = require("nodemailer");

module.exports.sendEmail = async (email, subject, text) => {
  return new Promise(async (resolve, reject) => {
    try {
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.PASS_USER
        }
      });
      var mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        html: text
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          console.log('Email sent: ' + info.response);
          resolve(true); // Resolve with true when the email is sent successfully
        }
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
}
