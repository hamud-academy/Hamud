"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

interface Props {
  clientId: string;
  disabled?: boolean;
  onCreateOrder: () => Promise<{ paypalOrderId: string; orderId: string }>;
  onApprove: (payload: { paypalOrderId: string; orderId: string }) => Promise<void>;
  onError: (message: string) => void;
}

export default function PayPalCheckoutButton({
  clientId,
  disabled = false,
  onCreateOrder,
  onApprove,
  onError,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const handlersRef = useRef({ onCreateOrder, onApprove, onError });
  const pendingOrderRef = useRef<{ paypalOrderId: string; orderId: string } | null>(null);
  handlersRef.current = { onCreateOrder, onApprove, onError };

  useEffect(() => {
    if (!scriptReady || !containerRef.current || !window.paypal || disabled) return;

    containerRef.current.innerHTML = "";
    const buttons = window.paypal.Buttons({
      style: {
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "paypal",
        height: 45,
      },
      createOrder: async () => {
        try {
          const result = await handlersRef.current.onCreateOrder();
          pendingOrderRef.current = result;
          return result.paypalOrderId;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to start PayPal checkout.";
          handlersRef.current.onError(message);
          throw error;
        }
      },
      onApprove: async (data) => {
        try {
          const pending = pendingOrderRef.current;
          await handlersRef.current.onApprove({
            paypalOrderId: data.orderID,
            orderId: pending?.orderId ?? "",
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "PayPal payment failed.";
          handlersRef.current.onError(message);
        }
      },
      onError: () => {
        handlersRef.current.onError("PayPal checkout was interrupted. Please try again.");
      },
    });

    buttons.render(containerRef.current);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [scriptReady, disabled, clientId]);

  return (
    <>
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture`}
        strategy="lazyOnload"
        onLoad={() => setScriptReady(true)}
      />
      <div ref={containerRef} className={disabled ? "pointer-events-none opacity-50" : ""} />
    </>
  );
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: Record<string, string | number>;
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError?: (error: unknown) => void;
      }) => { render: (element: HTMLElement) => Promise<void> };
    };
  }
}
