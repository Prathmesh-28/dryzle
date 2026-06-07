import { OrderStatus, Role } from '../types';

export const ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PLACED,
  OrderStatus.ACCEPTED,
  OrderStatus.PICKED_UP,
  OrderStatus.AT_VENDOR,
  OrderStatus.PROCESSING,
  OrderStatus.READY,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
];

export const CANCELLABLE_STATUSES: OrderStatus[] = [
  OrderStatus.PLACED,
  OrderStatus.ACCEPTED,
];

export const SLOT_TIMES: string[] = [
  '06:00-08:00',
  '08:00-10:00',
  '10:00-12:00',
  '12:00-14:00',
  '14:00-16:00',
  '16:00-18:00',
  '18:00-20:00',
  '20:00-22:00',
];

export const ROLES = {
  CUSTOMER: Role.CUSTOMER,
  VENDOR: Role.VENDOR,
  DELIVERY_BOY: Role.DELIVERY_BOY,
  ADMIN: Role.ADMIN,
} as const;

export const PLATFORM_COMMISSION_DEFAULT = 0.18;
export const MAX_DAILY_ORDERS_DEFAULT = 50;
export const ORDER_ACCEPTANCE_TIMEOUT_MS = 60_000;
export const SERVICE_RADIUS_DEFAULT_KM = 5;
export const RAZORPAY_CURRENCY = 'INR';
export const DB_PAY_PER_DELIVERY_DEFAULT = 30;
export const OTP_EXPIRY_MINUTES = 10;
export const JWT_EXPIRES_IN = '7d';
export const REFRESH_TOKEN_EXPIRES_IN = '30d';
export const MAX_REVIEW_RATING = 5;
export const MIN_REVIEW_RATING = 1;
export const SOCKET_LOCATION_UPDATE_EVENT = 'location:update';
export const SOCKET_ORDER_STATUS_EVENT = 'order:status';
export const SOCKET_NEW_ORDER_EVENT = 'order:new';
export const SOCKET_ROOM_PREFIX = 'order:';

export const STATUS_LABELS: Record<string, string> = {
  PLACED: 'Order Placed',
  ACCEPTED: 'Accepted by Vendor',
  PICKED_UP: 'Picked Up',
  AT_VENDOR: 'At Laundry',
  PROCESSING: 'Being Processed',
  READY: 'Ready for Delivery',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};
