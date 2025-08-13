import { PayPalButtons } from "@paypal/react-paypal-js";
import { Box } from '@chakra-ui/react';

const PaypalPayment = () => {
  return (
    <Box mt={6}>
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                description: "Upgrade to Pro Plan - Text to Speech App",
                amount: {
                  currency_code: "USD", // ✅ Changed to USD
                  value: "120.00", // Example: $120 USD
                },
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then((details) => {
            console.log("Payment Approved: ", details);
            alert("Payment successful! Thank you, " + details.payer.name.given_name);
            // 🔹 Here you can update Firestore to mark user as "Pro"
          });
        }}
        onError={(err) => {
          console.error("PayPal Checkout Error:", err);
        }}
      />
    </Box>
  );
};

export default PaypalPayment;
