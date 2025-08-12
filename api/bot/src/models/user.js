import prisma from '../config/db';

/**
 * Find user by Telegram ID
 * @param {number} telegramId - Telegram user ID
 * @returns {Promise<Object|null>} - User object or null if not found
 */
async function findByTelegramId(telegramId) {
  return prisma.user.findUnique({
    where: {
      telegramId: BigInt(telegramId)
    }
  });
}

/**
 * Create new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} - Created user object
 */
async function create(userData) {
  return prisma.user.create({
    data: {
      ...userData,
      telegramId: BigInt(userData.telegramId),
      role: 'User'
    }
  });
}

/**
 * Update user data
 * @param {number} telegramId - Telegram user ID
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} - Updated user object
 */
async function update(telegramId, userData) {
  return prisma.user.update({
    where: {
      telegramId: BigInt(telegramId)
    },
    data: userData
  });
}

/**
 * Get user with cart items
 * @param {number} telegramId - Telegram user ID
 * @returns {Promise<Object|null>} - User with cart items or null if not found
 */
async function getUserWithCart(telegramId) {
  return prisma.user.findUnique({
    where: {
      telegramId: BigInt(telegramId)
    },
    include: {
      cartItems: {
        include: {
          medicine: true
        }
      }
    }
  });
}

export default {
  findByTelegramId,
  create,
  update,
  getUserWithCart
};