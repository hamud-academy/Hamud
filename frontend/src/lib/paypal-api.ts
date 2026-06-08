function paypalApiBase(): string {
  const mode = process.env.PAYPAL_MODE?.trim().toLowerCase() === "live" ? "live" : "sandbox";
  return mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim();
  const secret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  if (!clientId || !secret) {
    throw new Error("PayPal is not configured.");
  }

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const res = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  const data = (await res.json()) as { access_token?: string; error_description?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description ?? "Failed to authenticate with PayPal.");
  }

  return data.access_token;
}

export async function paypalApiRequest<T>(
  path: string,
  init: RequestInit & { accessToken: string }
): Promise<T> {
  const { accessToken, ...rest } = init;
  const res = await fetch(`${paypalApiBase()}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(rest.headers ?? {}),
    },
    cache: "no-store",
  });

  const data = (await res.json()) as T & { message?: string; details?: Array<{ issue?: string }> };
  if (!res.ok) {
    const detail = data.details?.[0]?.issue ?? data.message ?? "PayPal request failed.";
    throw new Error(detail);
  }

  return data;
}
