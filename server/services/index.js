'use strict'
// Get dependencies
const AWS = require('aws-sdk')
const multer = require('multer')
const multerSharp = require('multer-sharp-s3')

AWS.config.update({
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    region: process.env.region
})
const s3 = new AWS.S3()

// Upload Profile Picture
const uploadProfilePicture = multer({
    storage: multerSharp({
        s3,
        ACL: "public-read",
        Bucket: process.env.bucket_name,
        metadata: (req, file, callBack) => { callBack(null, { fieldName: file.fieldname }) },
        key: (req, file, callBack) => { var fullPath = new Date().getTime() + file.originalname; callBack(null, fullPath) },
        resize: { "suffix": "original" },
    })
})

module.exports = {
    uploadProfilePicture
}