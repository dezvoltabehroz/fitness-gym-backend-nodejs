'use strict'
// Get dependencies
const AWS = require('aws-sdk')
const multer = require('multer')
const multerSharp = require('multer-sharp-s3')

AWS.config.update({
    accessKeyId: "AKIATWY6KK4YBBI5DNP4",
    secretAccessKey: "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",
    region: "eu-west-1"
})
const s3 = new AWS.S3()

// Upload Profile Picture
const profileUpload = multer({
    storage: multerSharp({
        s3,
        ACL: "public-read",
        Bucket: "eccles-educogym",
        metadata: (req, file, callBack) => { callBack(null, { fieldName: file.fieldname }) },
        key: (req, file, callBack) => { var fullPath = new Date().getTime() + file.originalname; callBack(null, fullPath) },
        resize: [{ "suffix": "original" }]
    })
})

module.exports = {
    profileUpload
}