const { OAuth2Client } = require('google-auth-library')
// const fetch = import('node-fetch')

const fetch =
  globalThis.fetch ||
  ((...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args)))
const jwt = require('jsonwebtoken')
const User = require('../models/user.model')
const CreateError = require('http-errors')
const logger = require('./logger')

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID

exports.loginWithSocial = async ({ provider, idToken }) => {
  let email, firstName, lastName

  try {
    if (provider === 'google') {
      const client = new OAuth2Client(GOOGLE_CLIENT_ID)

      const ticket = await client.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID
      })
      // logger.info('google login ', { idToken })

      const payload = ticket.getPayload()
      logger.info('payload ', payload)
      email = payload.email
      firstName =
        payload.given_name || (payload.name ? payload.name.split(' ')[0] : '')
      lastName =
        payload.family_name ||
        (payload.name ? payload.name.split(' ').slice(1).join(' ') : '')
    } else if (provider === 'facebook') {
      const fbRes = await fetch(
        `https://graph.facebook.com/me?fields=id,name,first_name,last_name,email&access_token=${idToken}`
      )
      const fbData = await fbRes.json()
      logger.info('fbData ', fbData)

      if (!fbData.email) {
        logger.warn('Facebook login failed - email missing', { fbData })
        throw CreateError(400, 'Facebook email is required')
      }
      logger.info('fbData ', fbData)
      email = fbData.email
      firstName =
        fbData.first_name || (fbData.name ? fbData.name.split(' ')[0] : '')
      lastName =
        fbData.last_name ||
        (fbData.name ? fbData.name.split(' ').slice(1).join(' ') : '')
    } else {
      logger.warn('user.Invalid social login provider', { provider })
      throw CreateError(400, 'user.Invalid social provider')
    }

    if (!email) {
      logger.error('user.Social login failed - no email retrieved', {
        provider
      })
      throw CreateError(400, 'user.Unable to retrieve email')
    }

    let user = await User.findOne({ email })

    if (!user) {
      user = await User.create({
        email,
        firstName: firstName || email.split('@')[0],
        lastName: lastName || '-',
        password: '1*23aA*456'
      })
      logger.info('user.Social login - new user created', {
        userId: user._id,
        email,
        provider
      })
    }

    return user
  } catch (err) {
    logger.error('user.Social login error', {
      provider,
      idToken: idToken ? idToken.substring(0, 50) + '...' : 'No token',
      message: err.message,
      stack: err.stack,
      googleClientId: GOOGLE_CLIENT_ID
    })

    // Provide more specific error messages
    if (err.message.includes('Wrong recipient')) {
      throw CreateError(
        400,
        'Invalid Google OAuth configuration. Please check your Google Client ID.'
      )
    }

    throw err
  }
}
