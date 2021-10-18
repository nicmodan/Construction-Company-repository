require('dotenv').config()

const PORT = process.env.PORT

const MONGODB_URL = process.env.URL

module.exports = {
    PORT, MONGODB_URL
}