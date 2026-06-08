export type PaymentBrand = "visa" | "mastercard" | "amex" | "paypal";

export type PaymentGatewayPublicConfig = {
  stripeEnabled: boolean;
  paypalEnabled: boolean;
  stripePublishableKey: string;
  paypalClientId: string;
  paypalMode: "sandbox" | "live";
  brands: PaymentBrand[];
};

export function getPaymentGatewayPublicConfig(): PaymentGatewayPublicConfig {
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? "";
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() ?? "";
  const paypalSecret = process.env.PAYPAL_CLIENT_SECRET?.trim() ?? "";
  const paypalMode =
    process.env.PAYPAL_MODE?.trim().toLowerCase() === "live" ? "live" : "sandbox";

  const stripeEnabled = Boolean(stripePublishableKey && stripeSecretKey);
  const paypalEnabled = Boolean(paypalClientId && paypalSecret);

  return {
    stripeEnabled,
    paypalEnabled,
    stripePublishableKey: stripeEnabled ? stripePublishableKey : "",
    paypalClientId: paypalEnabled ? paypalClientId : "",
    paypalMode,
    brands: ["visa", "mastercard", "amex", "paypal"],
  };
}

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() &&
      process.env.STRIPE_SECRET_KEY?.trim()
  );
}

export function isPayPalConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() &&
      process.env.PAYPAL_CLIENT_SECRET?.trim()
  );
}
