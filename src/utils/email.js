const nodemailer = require('nodemailer')
const logger = require('./logger')

exports.sendEmail = async (options) => {
  try {
    const hasCreds = !!process.env.EMAIL_USERNAME && !!process.env.EMAIL_PASSWORD
    const isProd = process.env.NODE_ENV === 'production'

    // In production with creds → use real SMTP (Gmail service by default)
    // In development or missing creds → use stream transport to avoid network/auth errors
    const transporter = isProd && hasCreds
      ? nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
          }
        })
      : nodemailer.createTransport({
          streamTransport: true,
          newline: 'unix',
          buffer: true
        })

    const mailOptions = {
      from: process.env.EMAIL_USERNAME || 'no-reply@local.dev',
      to: options.email,
      subject: options.subject,
      html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; background-color:rgb(202, 224, 203); text-align: center;">
                  <div style="max-width: 500px; background: white; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
                      <h2 style="color: rgb(54, 179, 98)">📩 You have a new message! </h2>
                      <p style="font-size: 16px; color: #333;">${options.message}</p>
                      <h1 style="color:rgb(40, 155, 80);font-size: 32px;">${options.OTP}</h1>
                      <hr style="border: none; height: 1px; background: #ddd;">
                      <p style="font-size: 14px; color: #555;">📧 From : <strong> A2Z </strong></p>
                      <footer style="margin-top: 10px; font-size: 12px; color: #888;">
                          <p>🤖This is an automatically generated email, please do not reply.</p>
                      </footer>
                  </div>
              </div>
          `
    }

    const info = await transporter.sendMail(mailOptions)
    if (!isProd || !hasCreds) {
      // Log the email content in development or when using stream transport
      logger.info('Dev email sent (stream transport)', {
        envelope: info.envelope,
        message: info.message && info.message.toString()
      })
    }
  } catch (err) {
    // Prevent crashing when email fails; log the error
    logger.error('Email sending failed', { error: err.message })
    if (process.env.NODE_ENV === 'production') {
      // In production, you might want to rethrow to catch operational alerts
      throw err
    }
  }
}
