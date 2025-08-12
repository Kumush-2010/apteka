import UserModel from '../models/user';

/**
 * Authentication middleware
 * Checks if user exists and adds user object to msg
 * @param {Object} bot - Telegram bot instance
 * @param {Object} msg - Message object
 * @param {Function} next - Next function
 */
async function authenticate(bot, msg, next) {
  try {
    // Skip if no from field (e.g. channel posts)
    if (!msg.from) return next();
    
    const userId = msg.from.id;
    
    // Find user in database
    const user = await UserModel.findByTelegramId(userId);
    
    // Add user to msg object
    msg.user = user;
    
    return next();
  } catch (error) {
    console.error('Error in authentication middleware:', error);
    return next();
  }
}

export {
  authenticate
};