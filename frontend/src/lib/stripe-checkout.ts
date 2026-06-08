import { isStripeConfigured } from "@/lib/payment-gateway-config";
import { getStripeClient } from "@/lib/stripe-client";
import {
  updateCourseOrderPaymentRef,
  updateDiplomaOrderPaymentRef,
} from "@/lib/checkout-orders";

export async function confirmStripeCheckoutSession(sessionId: string) {
  if (!isStripeConfigured()) return { verified: false as const };

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return { verified: false as const, status: session.payment_status };
  }

  const orderId = session.metadata?.orderId;
  const orderType = session.metadata?.orderType;
  const paymentRef = session.payment_intent?.toString() ?? session.id;

  if (orderId && paymentRef) {
    if (orderType === "diploma") {
      await updateDiplomaOrderPaymentRef(orderId, paymentRef);
    } else {
      await updateCourseOrderPaymentRef(orderId, paymentRef);
    }
  }

  return { verified: true as const, orderId, orderType };
}
