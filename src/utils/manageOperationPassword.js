const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const crypto = require('crypto')

exports.createPassword = function () {
  const length = 10
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const digits = '0123456789'
  const specials = '@#$%&*'
  const allChars = lowercase + uppercase + digits + specials

  const randomChar = (pool) => pool[crypto.randomInt(0, pool.length)]

  const chars = []
  chars.push(randomChar(lowercase))
  chars.push(randomChar(uppercase))
  chars.push(randomChar(digits))
  chars.push(randomChar(specials))

  for (let i = chars.length; i < length; i++) {
    chars.push(randomChar(allChars))
  }

  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1)
    const tmp = chars[i]
    chars[i] = chars[j]
    chars[j] = tmp
  }

  return chars.join('')
}

exports.showPassword = async function (password) {
  return await promisify(jwt.verify)(password, process.env.JWT_SECRET)
}
