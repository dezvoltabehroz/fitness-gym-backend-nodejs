'use strict'
// Get dependencies
const AWS = require('aws-sdk')
const multer = require('multer')
const multerSharp = require('multer-sharp-s3')

AWS.config.update({
    accessKeyId: "AKIATWY6KK4YDIQNFCJZ",
    secretAccessKey: "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",
    region: "eu-west-1"
})
const s3 = new AWS.S3()

// Upload Profile Picture
const profileUpload = multer({
    storage: multerSharp({
        s3,
        Bucket: "educogym",
        ACL: "public-read",
        resize: [
            { suffix: 'original', width: 1500 }
        ],
        multiple: true,
        Key: (req, file, cb) => { cb(null, file.originalname) }
    })
})

module.exports = {
    profileUpload
}