import type { PaymentBrand } from "@/lib/payment-gateway-config";

const BRAND_LABELS: Record<PaymentBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  paypal: "PayPal",
};

function BrandIcon({ brand }: { brand: PaymentBrand }) {
  switch (brand) {
    case "visa":
      return (
        <svg viewBox="0 0 48 32" aria-hidden="true" className="h-full w-full">
          <rect width="48" height="32" rx="4" fill="#1A1F71" />
          <path
            fill="#fff"
            d="M20.1 21.2h-2.7l1.7-10.4h2.7L20.1 21.2zm9.8-10.1c-.5-.2-1.3-.4-2.3-.4-2.5 0-4.3 1.3-4.3 3.2 0 1.4 1.3 2.2 2.3 2.6 1 .5 1.3.8 1.3 1.2 0 .7-.8 1-1.5 1-1 0-1.6-.1-2.4-.5l-.3-.2-.4 2.2c.6.3 1.7.5 2.8.5 2.7 0 4.4-1.3 4.4-3.3 0-1.1-.7-1.9-2.2-2.6-1-.4-1.5-.7-1.5-1.1 0-.4.4-.8 1.3-.8.7 0 1.3.2 1.7.3l.2.1.4-2.1zm6.9-.3h-2.1c-.7 0-1.2.2-1.5.9l-4.2 9.5h2.8l.6-1.6h3.4l.3 1.6h2.5l-2.8-10.4zm-3.3 6.7c.2-.6 1.1-2.8 1.1-2.8l.6-1.6.3 1.5.9 3h-2.9zM17 10.8l-2.6 10.4h-2.8l2.6-10.4H17z"
          />
        </svg>
      );
    case "mastercard":
      return (
        <svg viewBox="0 0 48 32" aria-hidden="true" className="h-full w-full">
          <rect width="48" height="32" rx="4" fill="#252525" />
          <circle cx="19" cy="16" r="8" fill="#EB001B" />
          <circle cx="29" cy="16" r="8" fill="#F79E1B" />
          <path
            fill="#FF5F00"
            d="M24 10.3a8 8 0 0 0-2.9 10.7A8 8 0 0 0 29 21.7a8 8 0 0 1-5-11.4z"
          />
        </svg>
      );
    case "amex":
      return (
        <svg viewBox="0 0 48 32" aria-hidden="true" className="h-full w-full">
          <rect width="48" height="32" rx="4" fill="#006FCF" />
          <path
            fill="#fff"
            d="M8.5 18.2l1.3-3.1 1.3 3.1H8.5zm27.8-5.4h-3.5l-2.2 5.4-2.2-5.4h-6.8v.6l-1.2-1.2h-4.1l-1.2 1.2v-.6H8.1l-.8 1.9-.8-1.9H4.5v5.4h2l.8-1.9.8 1.9h2.4l1.2-1.2v1.2h3.6l.9-2.1.9 2.1h3.5v-1.3l1.1 1.3h2.8l1.1-1.3v1.3h6.8l2.1-2.1 2.1 2.1h4.1v-5.4zm-8.9 4.5l-2.1-2.1v4.2l2.1-2.1zm5.2 0h-3.3v-3.3l3.3 3.3zm-12.1 0l-1.5-1.5-1.5 1.5h3zm-5.8-3.3h2.2l1.5 1.5 1.5-1.5h2.2v3.3h-2.2l-1.5-1.5-1.5 1.5h-2.2v-3.3z"
          />
        </svg>
      );
    case "paypal":
      return (
        <svg viewBox="0 0 48 32" aria-hidden="true" className="h-full w-full">
          <rect width="48" height="32" rx="4" fill="#fff" stroke="#E5E7EB" />
          <path
            fill="#003087"
            d="M18.2 8.5h6.8c2.8 0 4.9 1.9 4.5 4.8-.4 2.7-2.7 4.7-5.5 4.7h-2.4l-.9 4.5h-3.1l2.6-14z"
          />
          <path
            fill="#0070E0"
            d="M19.1 13.1h5.7c1.9 0 3.2 1.2 2.9 3-.3 1.6-1.9 2.8-3.8 2.8h-2.1l-.7 3.6h-2.8l2.8-14h3.8l-2.8 14z"
          />
          <path
            fill="#003087"
            d="M27.6 8.5H34c2.8 0 4.9 1.9 4.5 4.8-.4 2.7-2.7 4.7-5.5 4.7H30l-.9 4.5h-3.1l2.6-14z"
          />
        </svg>
      );
    default:
      return null;
  }
}

interface Props {
  brands?: PaymentBrand[];
  className?: string;
  size?: "default" | "compact";
}

export default function PaymentBrandIcons({
  brands = ["visa", "mastercard", "amex", "paypal"],
  className = "",
  size = "default",
}: Props) {
  const iconClass = size === "compact" ? "h-6 w-9" : "h-8 w-12";

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {brands.map((brand) => (
        <div
          key={brand}
          title={BRAND_LABELS[brand]}
          className={`${iconClass} overflow-hidden rounded border border-gray-200 bg-white shadow-sm`}
        >
          <BrandIcon brand={brand} />
        </div>
      ))}
    </div>
  );
}
