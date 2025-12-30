/*
 Seed script to populate development data across modules.
 Run: npm run seed
*/
const path = require('path')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

// Load env from src/config/config.env
dotenv.config({ path: path.join(__dirname, '..', 'config', 'config.env') })

const User = require('../models/user.model')
const Product = require('../models/product.model')
const Review = require('../models/review.model')
const Cart = require('../models/cart.model')
const CartItem = require('../models/cartItem.model')
const Order = require('../models/order.model')
const Payment = require('../models/payment.model')
const Notification = require('../models/notification.model')
const WishItem = require('../models/wishItem.model')
const Inquiry = require('../models/inquiry.model')

const { roles } = require('../types/user.enum')
const { paymentStatus, paymentWay, paymentType } = require('../types/payment.enum')

async function connect() {
  const uri = process.env.DATABASE_Atlas
  if (!uri) throw new Error('DATABASE_Atlas is not set in env')
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000
  })
}

async function clearAll() {
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Review.deleteMany({}),
    Cart.deleteMany({}),
    CartItem.deleteMany({}),
    Order.deleteMany({}),
    Payment.deleteMany({}),
    Notification.deleteMany({}),
    WishItem.deleteMany({}),
    Inquiry.deleteMany({})
  ])
}

async function seed() {
  await connect()
  console.log('Connected to DB')

  await clearAll()
  console.log('Cleared existing data')

  // Create users
  const defaultOrg = process.env.DEFAULT_ORGANIZATION_ID || 'website-org'
  const [admin, operation, customer] = await User.create([
    {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'Password123!',
      role: roles.Admin,
      organizationId: defaultOrg,
      phoneNumber: '01022223333',
      isVerified: true,
      address: [
        {
          firstName: 'Admin',
          lastName: 'User',
          phoneNumber: '01022223333',
          address: '123 Admin St',
          city: 'Cairo',
          region: 'EG-C',
          isDefault: true
        }
      ]
    },
    {
      firstName: 'Ops',
      lastName: 'User',
      email: 'ops@example.com',
      password: 'Password123!',
      role: roles.Operation,
      organizationId: defaultOrg,
      phoneNumber: '01555556666',
      isVerified: true,
      address: [
        {
          firstName: 'Ops',
          lastName: 'User',
          phoneNumber: '01555556666',
          address: '456 Ops Blvd',
          city: 'Cairo',
          region: 'EG-C',
          isDefault: true
        }
      ]
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password123!',
      role: roles.User,
      organizationId: defaultOrg,
      phoneNumber: '01244445555',
      isVerified: true,
      address: [
        {
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '01244445555',
          address: '789 Customer Rd',
          city: 'Cairo',
          region: 'EG-C',
          isDefault: true
        }
      ]
    }
  ])
  console.log('Seeded users')

  // Create products
  const products = await Product.create([
    {
      category: 'Electronics',
      name: 'ACME Headphones',
      description: 'Noise cancelling',
      imageList: ['https://picsum.photos/id/21/400/300'],
      price: 199.99,
      PurchasePrice: 120.0,
      stockQty: 50,
      organizationId: defaultOrg,
      createdBy: operation._id,
      advProduct: ['Bluetooth', 'ANC']
    },
    {
      category: 'Chemicals',
      name: 'Industrial Paint',
      description: 'High-durability specialized paint',
      imageList: ['https://picsum.photos/id/22/400/300'],
      price: 350.0,
      PurchasePrice: 200.0,
      stockQty: 100,
      organizationId: defaultOrg,
      createdBy: operation._id,
      advProduct: ['Weather-resistant']
    },
    {
      category: 'Construction',
      name: 'Concrete Additive',
      description: 'Improves strength',
      imageList: ['https://picsum.photos/id/23/400/300'],
      price: 500.0,
      PurchasePrice: 300.0,
      stockQty: 80,
      organizationId: defaultOrg,
      createdBy: operation._id
    }
  ])
  console.log('Seeded products')

  // Create reviews for first two products by customer
  await Review.create([
    {
      userId: customer._id,
      productId: products[0]._id,
      description: 'Great sound quality!',
      rateNum: 5
    },
    {
      userId: customer._id,
      productId: products[1]._id,
      description: 'Very durable finish',
      rateNum: 4
    }
  ])
  console.log('Seeded reviews')

  // Create cart for customer
  const cart = await Cart.create({ userId: customer._id })
  const cartItems = await CartItem.create([
    { cartId: cart._id, productId: products[0]._id, itemQty: 2 },
    { cartId: cart._id, productId: products[1]._id, itemQty: 1 }
  ])
  // Update cart totals
  const totalQty = cartItems.reduce((sum, it) => sum + it.itemQty, 0)
  const priceMap = new Map(products.map((p) => [p._id.toString(), p.price]))
  const totalPrice = cartItems.reduce(
    (sum, it) => sum + it.itemQty * (priceMap.get(it.productId.toString()) || 0),
    0
  )
  await Cart.findByIdAndUpdate(cart._id, { totalQty, totalPrice })
  console.log('Seeded cart and items')

  // Create order from cart
  const addr = customer.address[0]
  const order = await Order.create({
    cartId: cart._id,
    userId: customer._id,
    address: {
      firstName: addr.firstName,
      lastName: addr.lastName,
      phoneNumber: addr.phoneNumber,
      address: addr.address,
      city: addr.city,
      region: addr.region
    },
    deliveryPrice: 50
  })
  console.log('Seeded order')

  // Create payment for order
  await Payment.create({
    userId: customer._id,
    orderId: order.orderId,
    paymentStatus: paymentStatus.Paid,
    paymentWay: paymentWay.Cash,
    type: paymentType.Revenues,
    totalPrice: totalPrice + 50
  })
  console.log('Seeded payment')

  // Create a notification for customer
  await Notification.create({
    userID: customer._id,
    title: 'Welcome',
    message: 'Your account is ready. Enjoy shopping!',
    userType: roles.User
  })
  console.log('Seeded notification')

  // Add a wish item
  await WishItem.create({ userId: customer._id, productId: products[2]._id })
  console.log('Seeded wish item')

  // Create inquiry
  await Inquiry.create({
    name: 'John Doe',
    description: 'I need more details about Industrial Paint durability.',
    phoneNumber: '+201002866565',
    email: 'john@example.com'
  })
  console.log('Seeded inquiry')

  console.log('Seeding complete.')
}

seed()
  .catch((err) => {
    console.error('Seeding failed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.connection.close()
    process.exit()
  })
