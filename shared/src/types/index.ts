export enum Role {
  CUSTOMER = 'CUSTOMER',
  VENDOR = 'VENDOR',
  DELIVERY_BOY = 'DELIVERY_BOY',
  ADMIN = 'ADMIN',
}

export enum OrderStatus {
  PLACED = 'PLACED',
  ACCEPTED = 'ACCEPTED',
  PICKED_UP = 'PICKED_UP',
  AT_VENDOR = 'AT_VENDOR',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  UPI = 'UPI',
  CARD = 'CARD',
  WALLET = 'WALLET',
  COD = 'COD',
}

export enum UnitType {
  KG = 'KG',
  PIECE = 'PIECE',
}

export enum VehicleType {
  BIKE = 'BIKE',
  SCOOTER = 'SCOOTER',
  CYCLE = 'CYCLE',
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FLAT = 'FLAT',
}

export enum NotificationType {
  ORDER = 'ORDER',
  DELIVERY = 'DELIVERY',
  PROMO = 'PROMO',
  SYSTEM = 'SYSTEM',
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  fullAddress: string;
  geoLat: number;
  geoLng: number;
  isDefault: boolean;
}

export interface Vendor {
  id: string;
  userId: string;
  shopName: string;
  address: string;
  geoLat: number;
  geoLng: number;
  rating: number;
  isOpen: boolean;
  serviceRadiusKm: number;
  photos: string[];
  isApproved: boolean;
  isActive: boolean;
  maxDailyOrders: number;
  commissionRate?: number;
  workingHours?: WorkingHours;
  createdAt: Date;
}

export interface WorkingHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  isClosed?: boolean;
}

export interface DeliveryBoy {
  id: string;
  userId: string;
  vendorId: string;
  isAvailable: boolean;
  currentLat?: number;
  currentLng?: number;
  vehicleType: VehicleType;
  isApproved: boolean;
  createdAt: Date;
}

export interface Service {
  id: string;
  vendorId: string;
  name: string;
  pricePerUnit: number;
  unitType: UnitType;
  isActive: boolean;
}

export interface Order {
  id: string;
  customerId: string;
  vendorId: string;
  deliveryBoyId?: string;
  status: OrderStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  pickupSlot: string;
  deliverySlot: string;
  notes?: string;
  promoCodeId?: string;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
  statusLogs?: OrderStatusLog[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  serviceId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderStatusLog {
  id: string;
  orderId: string;
  status: OrderStatus;
  timestamp: Date;
  updatedByRole: Role;
  notes?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  gateway: string;
  gatewayTxnId?: string;
  gatewayOrderId?: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  refundId?: string;
  createdAt: Date;
}

export interface Review {
  id: string;
  orderId: string;
  customerId: string;
  vendorId: string;
  rating: number;
  comment?: string;
  isFlagged: boolean;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  expiresAt?: Date;
  isActive: boolean;
  vendorId?: string;
}

export interface Zone {
  id: string;
  name: string;
  polygon: GeoJsonPolygon;
  isActive: boolean;
}

export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface JwtPayload {
  sub: string;
  role: Role;
  phone: string;
  iat?: number;
  exp?: number;
}

export interface SocketLocationUpdate {
  orderId: string;
  lat: number;
  lng: number;
  deliveryBoyId: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VendorWithDistance extends Vendor {
  distanceKm: number;
  etaMinutes: number;
  services?: Service[];
  reviewCount?: number;
}

export interface CartItem {
  service: Service;
  quantity: number;
}

export interface OrderSummary {
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  promoCode?: string;
}

export interface DashboardStats {
  gmvToday: number;
  gmvWeek: number;
  gmvMonth: number;
  ordersToday: number;
  activeOrders: number;
  cancelledToday: number;
  vendorCount: number;
  activeVendors: number;
  deliveryBoyCount: number;
  onDutyDeliveryBoys: number;
  newUsersThisWeek: number;
}
