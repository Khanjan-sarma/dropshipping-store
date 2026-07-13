import { z } from "zod";

// Indian mobile: exactly 10 digits, starting 6-9.
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

// Indian pincode: exactly 6 digits, first digit 1-9.
export const pincodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit pincode");

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

export const addressSchema = z.object({
  customerName: z.string().trim().min(2, "Name is required").max(120),
  phone: phoneSchema,
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  address1: z.string().trim().min(3, "Address is required").max(200),
  address2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(2, "City is required").max(80),
  state: z.string().trim().min(2, "State is required").max(80),
  pincode: pincodeSchema,
});

export const createOrderSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Cart is empty"),
  couponCode: z.string().trim().max(40).optional().or(z.literal("")),
  paymentMethod: z.enum(["prepaid", "cod"]),
  refSource: z.string().trim().max(120).optional().or(z.literal("")),
  address: addressSchema,
});

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1, "Enter a coupon code").max(40),
  items: z.array(cartItemSchema).min(1, "Cart is empty"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
