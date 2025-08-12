import { translate } from '../i18n/translations';
import { cartKeyboard, cartItemsKeyboard, locationKeyboard, paymentMethodKeyboard, mainMenuKeyboard } from '../utils/keyboard';
import CartModel from '../models/cart';
import OrderModel from '../models/order';

/**
 * Handle cart menu
 * @param {Object} bot - Telegram bot instance
 * @param {Object} msg - Message object
 * @param {Object} user - User object
 */
async function handleCart(bot, msg, user) {
  const chatId = msg.chat.id;
  
  try {
    // Get cart items
    const cartItems = await CartModel.getCartItems(user.id);
    
    if (cartItems.length === 0) {
      // Empty cart
      bot.sendMessage(
        chatId,
        translate('cartEmpty', user.language),
        cartKeyboard(user.language, true)
      );
    } else {
      // Calculate total
      let totalPrice = 0;
      let itemsList = '';
      
      cartItems.forEach((item, index) => {
        const itemPrice = item.price * item.quantity;
        totalPrice += itemPrice;
        itemsList += translate('itemList', user.language, {
          name: item.name,
          quantity: item.quantity,
          price: itemPrice
        });
        
        if (index < cartItems.length - 1) {
          itemsList += '\n';
        }
      });
      
      // Show cart items
      bot.sendMessage(
        chatId,
        `${translate('cartItems', user.language)}\n\n${itemsList}\n\n${translate('orderDetails', user.language, { 
          total: totalPrice,
          delivery: 0,
          totalWithDelivery: totalPrice
        })}`,
        cartKeyboard(user.language, false)
      );
      
      // Show cart items with remove buttons
      bot.sendMessage(
        chatId,
        translate('cart', user.language),
        cartItemsKeyboard(cartItems, user.language)
      );
    }
  } catch (error) {
    console.error('Error in handleCart:', error);
    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
}

/**
 * Handle remove from cart
 * @param {Object} bot - Telegram bot instance
 * @param {Object} query - Callback query object
 * @param {Object} user - User object
 */
async function handleRemoveFromCart(bot, query, user) {
  const chatId = query.message.chat.id;
  const itemId = query.data.split(':')[1];
  
  try {
    // Remove from cart
    await CartModel.removeFromCart(itemId);
    
    // Answer callback query
    bot.answerCallbackQuery(query.id, {
      text: translate('removed', user.language)
    });
    
    // Update cart message
    handleCart(bot, query.message, user);
  } catch (error) {
    console.error('Error in handleRemoveFromCart:', error);
    bot.answerCallbackQuery(query.id, { text: 'An error occurred' });
  }
}

/**
 * Handle place order
 * @param {Object} bot - Telegram bot instance
 * @param {Object} msg - Message object
 * @param {Object} userStates - User states object
 * @param {Object} user - User object
 */
async function handlePlaceOrder(bot, msg, userStates, user) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  try {
    // Get cart items
    const cartItems = await CartModel.getCartItems(user.id);
    
    if (cartItems.length === 0) {
      bot.sendMessage(
        chatId,
        translate('cartEmpty', user.language),
        cartKeyboard(user.language, true)
      );
      return;
    }
    
    // Set order state
    userStates[userId] = {
      ...userStates[userId],
      orderStep: 'location',
      orderItems: cartItems,
    };
    
    // Ask for location
    bot.sendMessage(
      chatId,
      translate('askLocation', user.language),
      locationKeyboard(user.language)
    );
  } catch (error) {
    console.error('Error in handlePlaceOrder:', error);
    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
}

/**
 * Handle location input
 * @param {Object} bot - Telegram bot instance
 * @param {Object} msg - Message object
 * @param {Object} userStates - User states object
 * @param {Object} user - User object
 */
async function handleLocationInput(bot, msg, userStates, user) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  try {
    let location;
    
    if (msg.location) {
      // Location shared
      location = `${msg.location.latitude},${msg.location.longitude}`;
    } else if (msg.text === translate('deliveryLocation', user.language)) {
      // Delivery location option
      userStates[userId] = {
        ...userStates[userId],
        locationInputType: 'text'
      };
      
      bot.sendMessage(
        chatId,
        'Please enter the delivery address:',
        { reply_markup: { force_reply: true } }
      );
      return;
    } else {
      // Text location
      location = msg.text;
    }
    
    // Update order state
    userStates[userId] = {
      ...userStates[userId],
      orderStep: 'payment',
      orderLocation: location
    };
    
    // Calculate total price
    let totalPrice = 0;
    userStates[userId].orderItems.forEach(item => {
      totalPrice += item.price * item.quantity;
    });
    
    // Add delivery fee (can be calculated based on location)
    const deliveryFee = 15000; // Example delivery fee
    const totalWithDelivery = totalPrice + deliveryFee;
    
    userStates[userId].totalPrice = totalWithDelivery;
    
    // Ask for payment method
    bot.sendMessage(
      chatId,
      translate('orderDetails', user.language, {
        total: totalPrice,
        delivery: deliveryFee,
        totalWithDelivery: totalWithDelivery
      }) + '\n\n' + translate('paymentMethod', user.language),
      paymentMethodKeyboard(user.language)
    );
  } catch (error) {
    console.error('Error in handleLocationInput:', error);
    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
}

/**
 * Handle payment method selection
 * @param {Object} bot - Telegram bot instance
 * @param {Object} msg - Message object
 * @param {Object} userStates - User states object
 * @param {Object} user - User object
 */
async function handlePaymentMethod(bot, msg, userStates, user) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const paymentMethod = msg.text.toLowerCase();
  
  try {
    // Check if cancel
    if (paymentMethod === translate('cancel', user.language).toLowerCase()) {
      // Cancel order
      delete userStates[userId].orderStep;
      
      bot.sendMessage(
        chatId,
        translate('orderCancelled', user.language),
        mainMenuKeyboard(user.language)
      );
      return;
    }
    
    // Get order details from state
    const { orderItems, orderLocation, totalPrice } = userStates[userId];
    
    // Create order
    const order = await OrderModel.createOrder(
      user.id,
      orderItems,
      totalPrice,
      'N/A', // Current location
      orderLocation,
      paymentMethod
    );
    
    // Clear cart
    await CartModel.clearCart(user.id);
    
    // Send order to admin channel
    const adminChannelId = process.env.ADMIN_CHANNEL_ID;
    if (adminChannelId) {
      // Format items for admin
      let itemsList = '';
      orderItems.forEach((item, index) => {
        itemsList += `${index + 1}. ${item.name} - ${item.quantity} pcs - ${item.price * item.quantity} sum\n`;
      });
      
      bot.sendMessage(
        adminChannelId,
        `🆕 NEW ORDER #${order.id}\n\n` +
        `👤 Customer: ${user.name}\n` +
        `📱 Phone: ${user.phone}\n` +
        `📍 Delivery: ${orderLocation}\n` +
        `💰 Payment: ${paymentMethod}\n` +
        `💲 Total: ${totalPrice} sum\n\n` +
        `📋 Items:\n${itemsList}`
      );
    }
    
    // Send confirmation to user
    bot.sendMessage(
      chatId,
      translate('orderSuccess', user.language),
      mainMenuKeyboard(user.language)
    );
    
    // Clear order state
    delete userStates[userId].orderStep;
  } catch (error) {
    console.error('Error in handlePaymentMethod:', error);
    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
}

export {
  handleCart,
  handleRemoveFromCart,
  handlePlaceOrder,
  handleLocationInput,
  handlePaymentMethod
};