# Pharmacy Telegram Bot

This is a Telegram bot for an online pharmacy system with multiple languages support (English, Russian, Uzbek).

## Features

- User registration with name and phone number
- Multi-language support (English, Russian, Uzbek)
- Medicine search functionality
- User profiles
- Shopping cart management
- Order placement with location and payment options
- Admin panel for medicine management

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- PostgreSQL database (Supabase)
- Telegram Bot Token (from BotFather)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your details:
   ```
   # Bot token from BotFather
   TELEGRAM_BOT_TOKEN=your_bot_token_here

   # Supabase Database URL
   DATABASE_URL=your_supabase_url_here
   DIRECT_URL=your_direct_url_here

   # Admin channel ID for order notifications
   ADMIN_CHANNEL_ID=your_channel_id_here
   ```

4. Generate Prisma client:
   ```
   npx prisma generate
   ```

5. Run the setup script to create sample data:
   ```
   node setup.js
   ```

6. Start the bot:
   ```
   npm start
   ```

## Bot Commands

- `/start` - Start the bot or return to main menu

## Database Schema

The bot uses the following database schema:

- Admin - Store admin users
- Supplier - Store suppliers
- Pharmacy - Store pharmacies
- Medicine - Store medicines
- User - Store Telegram users
- CartItem - Store cart items
- Order - Store orders
- OrderItem - Store order items

## Development

To run the bot in development mode with auto-restart on file changes:

```
npm run dev
```

## Languages

The bot supports the following languages:
- English (en)
- Russian (ru)
- Uzbek (uz)

## License

This project is licensed under the MIT License