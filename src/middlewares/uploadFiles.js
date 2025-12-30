const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('cloudinary').v2

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
})

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = ''

    if (file.fieldname === 'pdf') {
      folder = 'A2Z/pdf' // Store PDFs in 'A2Z/pdf'
    } else if (file.fieldname === 'image') {
      folder = 'A2Z/images' // Store images in 'A2Z/images'
    } else if (file.fieldname === 'video') {
      folder = 'A2Z/videos' // Store videos in 'A2Z/videos'
    }

    return {
      folder: folder,
      resource_type: file.fieldname === 'video' ? 'video' : 'auto',
      public_id: file.originalname.split('.')[0] // Use filename without extension
    }
  }
})

// Multer configuration to accept `pdf`, `image`, and `video`
const uploadMiddleware = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Validate file types
    const allowedImageTypes = ['image/jpeg', 'image/png']
    const allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi']

    if (file.fieldname === 'pdf' && file.mimetype === 'application/pdf') {
      cb(null, true) // Accept PDFs
    } else if (
      file.fieldname === 'image' &&
      allowedImageTypes.includes(file.mimetype)
    ) {
      cb(null, true) // Accept JPEG/PNG images
    } else if (
      file.fieldname === 'video' &&
      allowedVideoTypes.includes(file.mimetype)
    ) {
      cb(null, true) // Accept MP4/MOV/AVI videos
    } else {
      cb(
        new Error(
          'Invalid file type! Only PDF, image (JPEG/PNG), and video (MP4/MOV/AVI) files are allowed.'
        ),
        false
      )
    }
  }
})

module.exports = uploadMiddleware
