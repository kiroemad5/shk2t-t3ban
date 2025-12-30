const Payment = require('../models/payment.model')
const { paymentWay, paymentStatus } = require('../types/payment.enum')

exports.calculateTotalCountAndAmount = async (type) => {
  const paidRevenues = await Payment.find({
    type,
    paymentStatus: paymentStatus.Paid
  })
  // Calculate total count and total amount
  const totalCount = paidRevenues.length
  const totalAmount = paidRevenues.reduce(
    (sum, payment) => sum + (payment.totalPrice || 0),
    0
  )
  // Count by payment way
  const onlineCount = paidRevenues.filter(
    (payment) => payment.paymentWay === paymentWay.online
  ).length
  const cashCount = totalCount - onlineCount

  // Calculate online and cash totals
  const onlineAmount = paidRevenues
    .filter((payment) => payment.paymentWay === paymentWay.online)
    .reduce((sum, payment) => sum + (payment.totalPrice || 0), 0)

  const cashAmount = totalAmount - onlineAmount

  return {
    totalCount,
    totalAmount,
    onlineCount,
    cashCount,
    onlineAmount,
    cashAmount
  }
}
