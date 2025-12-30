const { default: mongoose } = require("mongoose")
const Product = require("../models/product.model")

 exports.updateProductAverageRate = async (productId) => {
   const stats = await mongoose.model('Review').aggregate([
     { $match: { productId: new mongoose.Types.ObjectId(productId) } },
     {
       $group: {
         _id: '$productId',
         averageRate: { $avg: '$rateNum' }
       }
     }
   ])

   const averageRate =
     stats.length > 0 ? Number(stats[0].averageRate.toFixed(2)) : 0

   await Product.findByIdAndUpdate(productId, { averageRate }, { new: true })
 }
