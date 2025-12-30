const mongoose = require('mongoose')
const path = require('path')
const dotenv = require('dotenv')
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') })
const app = require('./app')
const logger = require('./utils/logger')

const port = process.env.PORT || 3000
const dbUri =
  process.env.DATABASE_Atlas ||
  'mongodb+srv://kiroemad559_db_user:ki123@cluster0.hdevekq.mongodb.net/?appName=Cluster0'

mongoose
  .connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000
  })
  .then(() => {
    logger.info('DB connection successful')
    app.listen(port, '0.0.0.0', () => {
      logger.info(`App running in port ${port}`)
    })
  })
  .catch(err => {
    logger.error(`DB connection failed: ${err.message}`)
    process.exit(1)
  })
