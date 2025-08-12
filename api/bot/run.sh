#!/bin/bash

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please update the .env file with your actual credentials."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Check if setup is needed
read -p "Do you want to setup initial data? (y/n): " setup_choice
if [[ $setup_choice == "y" || $setup_choice == "Y" ]]; then
    echo "Setting up initial data..."
    node setup.js
fi

# Run the bot
echo "Starting the Telegram bot..."
npm start