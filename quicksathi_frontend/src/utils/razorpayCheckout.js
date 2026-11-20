import api from "../config/api";

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadCheckoutScript() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${CHECKOUT_SRC}"]`);
    const script = existing || document.createElement("script");
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Could not load the payment window. Check your connection and try again.")), { once: true });
    if (!existing) {
      script.src = CHECKOUT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
  });
}

/**
 * Pay for an existing (unpaid, online) booking with Razorpay Checkout.
 * The amount is whatever the server stored on the booking; nothing price-related is sent from here.
 *
 * Resolves to:
 *   { status: "paid", booking }          server verified the signature
 *   { status: "dismissed", error? }      user closed the window without paying
 *   { status: "failed", error }          order creation / verification failed
 */
export async function payForBooking(booking, user) {
  let order;
  try {
    ({ data: order } = await api.post("/payments/create-order", { bookingId: booking._id }));
    await loadCheckoutScript();
  } catch (err) {
    return { status: "failed", error: err.response?.data?.message || err.message || "Could not start the payment." };
  }

  return new Promise((resolve) => {
    let lastError = "";
    const rzp = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: "TiptoBook",
      description: booking.serviceName,
      prefill: { name: user?.name, email: user?.email, contact: user?.phone },
      theme: { color: "#1a408b" },
      handler: async (response) => {
        try {
          const { data } = await api.post("/payments/verify", { bookingId: booking._id, ...response });
          resolve({ status: "paid", booking: data.booking });
        } catch (err) {
          resolve({
            status: "failed",
            error:
              err.response?.data?.message ||
              "We couldn't confirm your payment yet. If money was deducted, your booking will be confirmed automatically in a few minutes.",
          });
        }
      },
      modal: { ondismiss: () => resolve({ status: "dismissed", error: lastError }) },
    });
    // Razorpay keeps the window open so the customer can retry; remember why it failed.
    rzp.on("payment.failed", (response) => {
      lastError = response?.error?.description || "Payment failed";
    });
    rzp.open();
  });
}
