require("dotenv").config()
const nodemailer = require("nodemailer")
const path = require("path")
const fs = require("fs")
const hbs = require("handlebars")

const readAndSendEmail = async (data, views) => {
  const pathName = path.join(__dirname, `../views/${views}.hbs`)
  const source = fs.readFileSync(pathName, "utf8")
  const template = hbs.compile(source)
  const result = template(data)

  return result
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMPT_USER,
    pass: process.env.SMPT_PASS,
  },
})

async function sendEmail(mailTo, subject, data, views) {
  const html = await readAndSendEmail(data, views)

  const mailOptions = {
    from: "twodot40@gmail.com",
    to: mailTo,
    subject: subject,
    html: html,
  }
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error)
    } else {
      console.log("Email sent: ", info.response)
    }
  })
}

module.exports = sendEmail

