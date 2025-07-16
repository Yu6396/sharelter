const axios = require("axios");


const initializePayment = async (email, amount) =>{
    return  await axios ({
        method: 'POST',
        url: "https://api.paystack.co/transaction/initialize",
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
        },
        data: {
            email: email,
            amount: amount * 100,
            currency: "NGN",
        },
        });
        };

// const verifyPayment = async (reference) => {
//     return await axios ({
//         method: 'GET',
//         url: `https://api.paystack.co/transaction/verify/${reference}`,
//         headers: {
//             Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//             "Content-Type": "application/json",
//             },
//             });
// }

const verifyPayment = async (reference) => {
  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (err) {
    console.error("Paystack error:", err.message || err);
    throw err;
  }
};

module.exports = {initializePayment, verifyPayment};