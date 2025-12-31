const express = require('express')
const path = require('path')
const morgan = require('morgan')
const i18n = require('i18n')
const cors = require('cors')
const routes = require('./routes/index.js')
const { security } = require('./utils/security')
const errorHandler = require('./middlewares/errorHandler.middleware.js') // لو عندك Error handler
const logger = require('./utils/logger.js')
require('dotenv').config()

const app = express()

////////////////////////////////////////////////////////////////////////
// 1️⃣ أمان أول حاجة
security(app)

// 2️⃣ إعداد الـ i18n
i18n.configure({
  locales: ['en', 'ar'],
  defaultLocale: 'ar',
  directory: path.join(__dirname, 'locales'),
  queryParameter: 'lang',
  autoReload: true,
  syncFiles: true,
  objectNotation: true
})
app.use(i18n.init)

app.use(
  cors({
    origin: '*',
    credentials: true
    // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

//read language from query or headers
app.use((req, res, next) => {
  const lang = req.query.lang || req.headers['accept-language'] || 'en'
  req.setLocale(lang.startsWith('ar') ? 'ar' : 'en')
  next()
})

//middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'public')))

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
app.use('/app/v1', routes)

app.get('/health', (req, res) => res.status(200).send('OK'))

app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`)
  err.status = 404
  next(err)
})

app.use(errorHandler)

module.exports = app
