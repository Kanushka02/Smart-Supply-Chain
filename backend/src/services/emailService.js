const transporter = require('../config/mail');

exports.sendOrderEmail = async (
  email,
  userName,
  productName,
  quantity,
  totalPrice
) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Order Created Successfully',
      html: `
        <h2>Hello ${userName}</h2>
        <p>Your order has been created.</p>
        <p><b>Product:</b> ${productName}</p>
        <p><b>Quantity:</b> ${quantity}</p>
        <p><b>Total:</b> Rs. ${totalPrice}</p>
      `
    });

    console.log('Order confirmation email sent');
  } catch (error) {
    console.error('Failed to send order confirmation email:', error.message);
  }
};
