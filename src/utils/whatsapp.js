import { siteConfig } from '../config/siteConfig';

/**
 * Generates a clean, consolidated WhatsApp order message & wa.me URL
 * 
 * @param {Array} cart - Array of { product, quantity }
 * @param {Object} customerDetails - { name, phone, address, city, pincode, notes }
 * @param {number} subtotal - Calculated order subtotal
 * @returns {string} Fully formatted wa.me URL
 */
export const generateWhatsAppOrderUrl = (cart, customerDetails, subtotal) => {
  if (!cart || cart.length === 0) return '';

  const cleanNumber = siteConfig.whatsappNumber.replace(/[^0-9]/g, '');

  let message = `🌿 *Order Request — ${siteConfig.brandName}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `Hello ${siteConfig.brandName},\nI would like to place the following order:\n\n`;

  // Itemized List
  cart.forEach((item, index) => {
    const itemTotal = item.product.price * item.quantity;
    message += `${index + 1}. *${item.product.name}* (${item.product.weight})\n`;
    message += `   Qty: ${item.quantity} × ₹${item.product.price} = *₹${itemTotal}*\n`;
  });

  message += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `*Total Order Value: ₹${subtotal}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Customer Delivery Details
  message += `📍 *Delivery Details:*\n`;
  message += `• *Name:* ${customerDetails.name?.trim() || 'Not specified'}\n`;
  message += `• *Phone:* ${customerDetails.phone?.trim() || 'Not specified'}\n`;
  message += `• *Address:* ${customerDetails.address?.trim() || 'Not specified'}\n`;
  message += `• *City:* ${customerDetails.city?.trim() || 'Not specified'}\n`;
  message += `• *Pincode:* ${customerDetails.pincode?.trim() || 'Not specified'}\n`;

  if (customerDetails.notes && customerDetails.notes.trim()) {
    message += `\n📝 *Special Instructions:* ${customerDetails.notes.trim()}\n`;
  }

  message += `\nPlease confirm availability and share payment details. Thank you!`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
};
