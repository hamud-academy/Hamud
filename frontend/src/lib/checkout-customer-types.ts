export type CheckoutCustomer = {
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  address?: string;
  region?: string;
  postcode?: string;
};

export function splitFullName(fullName: string): { firstNameMiddle: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstNameMiddle: parts[0] ?? "", lastName: "" };
  }
  const lastName = parts.pop()!;
  return { firstNameMiddle: parts.join(" "), lastName };
}
