const { default: mongoose } = require('mongoose')
const {
  createNotificationWithSession
} = require('../services/notification.services')
// const { createWishItemService } = require('../services/wishItem.services')

exports.createWishWithNoti = async (req, res) => {
  const notificationData = {
    userID: req.user._id,
    title: 'create noti with wish item',
    message: 'hello'
  }
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    await createNotificationWithSession(notificationData, session)
    // const result = await createWishItemService(req, res, session)

    await session.commitTransaction()
    // return result
  } catch (err) {
    await session.abortTransaction()
    throw err
  } finally {
    session.endSession()
  }
}
