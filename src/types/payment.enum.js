const paymentWay = {
  Cash: 'cash',
  online: 'online'
}

const paymentStatus = {
  Paid: 'paid',
  Deposit: 'deposit',
  Refunded: 'refunded',
  Cancelled: 'cancelled'
}

const paymentWith = {
  InstaPay: 'instaPay',
  Vodafone: 'vodafone'
}

const paymentType = {
  Revenues: 'revenues',
  Expenses: 'expenses'
}

module.exports = {
  paymentStatus,
  paymentWay,
  paymentWith,
  paymentType
}
