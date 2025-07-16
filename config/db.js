require("dotenv").config()
const mongoose = require("mongoose")
const uri = process.env.MONGODB_URI
const dbName = process.env.DB_NAME


// console.log(uri, "uri")
// console.log(dbName, "dbName")

module.exports = mongoose.connect(`${uri}/${dbName}`)
