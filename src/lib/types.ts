export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Measurement {
  id: string;
  customer_id: string;
  label: string;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  shoulder: number | null;
  sleeve_length: number | null;
  inseam: number | null;
  outseam: number | null;
  neck: number | null;
  back_length: number | null;
  front_length: number | null;
  notes: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  customer_id: string;
  measurement_id: string | null;
  garment_type: string;
  description: string | null;
  fabric: string | null;
  price: number;
  advance_paid: number;
  status: OrderStatus;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  measurement?: Measurement;
}

export type OrderStatus =
  | "pending"
  | "cutting"
  | "stitching"
  | "finishing"
  | "ready"
  | "delivered"
  | "cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  cutting: "Cutting",
  stitching: "Stitching",
  finishing: "Finishing",
  ready: "Ready for Pickup",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  cutting: "bg-blue-100 text-blue-800",
  stitching: "bg-indigo-100 text-indigo-800",
  finishing: "bg-purple-100 text-purple-800",
  ready: "bg-green-100 text-green-800",
  delivered: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export const GARMENT_TYPES = [
  "Shalwar Kameez",
  "Kurta",
  "Waistcoat",
  "Sherwani",
  "Pant Shirt",
  "Suit (2-piece)",
  "Suit (3-piece)",
  "Trouser",
  "Shirt",
  "Blouse",
  "Dress",
  "Abaya",
  "Other",
] as const;
