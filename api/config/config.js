import { config } from "dotenv";
config();

const DATABASE_URL = process.env.DATABASE_URL;
const DIRECT_URL = process.env.DIRECT_URL;
const PORT = process.env.PORT;
const JWT_KEY = process.env.JWT_KEY;
const NODE_ENV = process.env.NODE_ENV === "production";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const BUCKET_NAME = process.env.BUCKET_NAME;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export {
  DATABASE_URL,
  DIRECT_URL,
  PORT,
  JWT_KEY,
  NODE_ENV,
  SUPABASE_URL,
  SUPABASE_KEY,
  BUCKET_NAME,
  TELEGRAM_BOT_TOKEN,
};
