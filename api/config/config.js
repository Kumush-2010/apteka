import { config } from 'dotenv'
config()

const DATABASE_URL = process.env.DATABASE_URL
const DIRECT_URL = process.env.DIRECT_URL
const PORT = process.env.PORT
const JWT_KEY = process.env.JWT_KEY
const IS_PRODUCTION = process.env.IS_PRODUCTION === 'production'
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const BUCKET_NAME = process.env.BUCKET_NAME
const BOT_TOKEN = process.env.BOT_TOKEN

export {
    DATABASE_URL, DIRECT_URL, PORT,
    JWT_KEY, IS_PRODUCTION, SUPABASE_URL, SUPABASE_KEY, BUCKET_NAME,
    BOT_TOKEN
}