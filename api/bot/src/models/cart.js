import prisma from '../config/db';

/**
 * Add medicine to cart
 * @param {number} userId - User ID
 * @param {number} medicineId - Medicine ID
 * @param {string} name - Medicine name
 * @param {number} price - Medicine price
 * @returns {Promise<Object>} - Added cart item
 */
async function addToCart(userId, medicineId, name, price) {
  // Check if the item already exists in the cart
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      userId: BigInt(userId),
      medicineId: parseInt(medicineId)
    }
  });

  if (existingItem) {
    // Update quantity if item exists
    return prisma.cartItem.update({
      where: {
        id: existingItem.id
      },
      data: {
        quantity: existingItem.quantity + 1
      }
    });
  } else {
    // Create new item if it doesn't exist
    return prisma.cartItem.create({
      data: {
        userId: BigInt(userId),
        medicineId: parseInt(medicineId),
        name,
        price,
        quantity: 1
      }
    });
  }
}

/**
 * Remove item from cart
 * @param {number} itemId - Cart item ID
 * @returns {Promise<Object>} - Removed cart item
 */
async function removeFromCart(itemId) {
  return prisma.cartItem.delete({
    where: {
      id: parseInt(itemId)
    }
  });
}

/**
 * Decrease item quantity in cart
 * @param {number} userId - User ID
 * @param {number} itemId - Cart item ID
 * @returns {Promise<Object>} - Updated cart item or null if removed
 */
async function decreaseQuantity(userId, itemId) {
  const item = await prisma.cartItem.findUnique({
    where: {
      id: parseInt(itemId)
    }
  });

  if (!item) {
    return null;
  }

  if (item.quantity > 1) {
    // Decrease quantity if more than 1
    return prisma.cartItem.update({
      where: {
        id: parseInt(itemId)
      },
      data: {
        quantity: item.quantity - 1
      }
    });
  } else {
    // Remove item if quantity is 1
    await prisma.cartItem.delete({
      where: {
        id: parseInt(itemId)
      }
    });
    return null;
  }
}

/**
 * Get cart items for a user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} - List of cart items
 */
async function getCartItems(userId) {
  return prisma.cartItem.findMany({
    where: {
      userId: BigInt(userId)
    },
    include: {
      medicine: true
    }
  });
}

/**
 * Clear cart for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - Delete result
 */
async function clearCart(userId) {
  return prisma.cartItem.deleteMany({
    where: {
      userId: BigInt(userId)
    }
  });
}

export default {
  addToCart,
  removeFromCart,
  decreaseQuantity,
  getCartItems,
  clearCart
};