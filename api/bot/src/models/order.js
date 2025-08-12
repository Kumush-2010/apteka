import prisma from '../config/db';

/**
 * Create a new order
 * @param {number} userId - User ID
 * @param {Array} items - Cart items
 * @param {number} totalPrice - Total price of the order
 * @param {string} currentLocation - User's current location
 * @param {string} deliveryLocation - Delivery location
 * @param {string} paymentMethod - Payment method
 * @returns {Promise<Object>} - Created order
 */
async function createOrder(userId, items, totalPrice, currentLocation, deliveryLocation, paymentMethod) {
  // Set status based on payment method
  const status = paymentMethod === 'cash' ? 'pending_payment' : 'paid';
  
  // Create order with items
  return prisma.order.create({
    data: {
      userId: BigInt(userId),
      totalPrice,
      currentLocation,
      deliveryLocation,
      status,
      items: {
        create: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      }
    },
    include: {
      items: true
    }
  });
}

/**
 * Get orders for a user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} - List of user orders
 */
async function getUserOrders(userId) {
  return prisma.order.findMany({
    where: {
      userId: BigInt(userId)
    },
    include: {
      items: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

/**
 * Update order status
 * @param {number} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise<Object>} - Updated order
 */
async function updateOrderStatus(orderId, status) {
  return prisma.order.update({
    where: {
      id: parseInt(orderId)
    },
    data: {
      status
    }
  });
}

export default {
  createOrder,
  getUserOrders,
  updateOrderStatus
};