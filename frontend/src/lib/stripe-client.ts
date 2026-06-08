import Stripe from "stripe";
import { isStripeConfigured } from "@/lib/payment-gateway-config";

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!.trim(), {
      apiVersion: "2026-05-27.dahlia",
    });
  }

  return stripeClient;
}
