export type UserRole = "USER" | "ADMIN";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type DeliveryArea = "INSIDE_DHAKA" | "OUTSIDE_DHAKA";

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "CONFIRMED"
  | "PACKING"
  | "PACKED"
  | "DELIVERING"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  gender: Gender | null;
  dateOfBirth: string | null;
  role: UserRole;
  firstOrderFreeDeliveryUsed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubcategoryItem {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  description?: string | null;
  subcategories: SubcategoryItem[];
  createdAt?: string;
}

export interface ProductReviewItem {
  id: string;
  rating: number;
  comment: string;
  user: {
    name: string;
    avatar: string | null;
  };
  createdAt: string;
  status?: string;
  productId?: string;
  productName?: string;
  orderId?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** Effective selling price (finalPrice from API). */
  price: number;
  /** Original/base price before discount when discounted. */
  originalPrice?: number;
  discountPercent?: number;
  category: string;
  categoryId?: string;
  categorySlug?: string;
  subcategory?: string;
  subcategoryId?: string;
  subcategorySlug?: string;
  brand?: string | null;
  rating: number;
  reviewCount: number;
  images: string[];
  stock: number;
  isOutOfStockManual?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  tags?: string[];
  discountType?: "ribbon" | "lightning";
  deliveryTime?: string;
  unit?: string;
  reviews?: ProductReviewItem[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  productCount?: number;
}

export interface CartItem {
  /** Backend cart item ID when synced with /cart. */
  itemId?: string;
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export interface SavedAddress {
  id: string;
  customerName: string;
  phone: string;
  streetAddress: string;
  city: string;
  deliveryArea: DeliveryArea;
  isDefault: boolean;
  createdAt?: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    finalPrice: number;
    stock: number;
    image: string;
  };
  createdAt: string;
}

export interface StockAlertItem {
  id: string;
  productId: string;
  status: string;
  product: {
    id?: string;
    name: string;
    price?: number;
    finalPrice?: number;
    stock?: number;
    image?: string;
    images?: Array<{ url: string; isPrimary?: boolean } | string>;
  };
}

export interface CheckoutSummary {
  totalProductPrice: number;
  discountAmount: number;
  subtotal: number;
  regularDeliveryCharge: number;
  deliveryDiscount: number;
  finalDeliveryCharge: number;
  isFirstOrderFreeDelivery: boolean;
  finalOrderAmount: number;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: "COD" | string;
  paymentStatus: "UNPAID" | "PAID" | string;
  finalOrderAmount: number;
  itemsCount?: number;
  createdAt: string;
  customerName?: string;
  shippingAddress?: {
    customerName: string;
    phone: string;
    streetAddress: string;
    city: string;
    deliveryArea: DeliveryArea;
  };
}

export interface OrderDetailItem {
  id: string;
  productId?: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  finalUnitPrice: number;
  totalPrice: number;
}

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  note?: string;
  createdAt: string;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: "COD" | string;
  paymentStatus: "UNPAID" | "PAID" | string;
  totalProductPrice?: number;
  discountAmount?: number;
  regularDeliveryCharge?: number;
  deliveryDiscount?: number;
  finalDeliveryCharge?: number;
  isFirstOrderFreeDelivery?: boolean;
  finalOrderAmount: number;
  shippingAddress: {
    customerName: string;
    phone: string;
    streetAddress: string;
    city: string;
    deliveryArea: DeliveryArea;
  };
  items: OrderDetailItem[];
  statusHistory: OrderStatusHistoryEntry[];
  createdAt?: string;
  deliveredAt?: string | null;
  returnRequest?: ReturnRequestSummary | null;
}

export type ReturnRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ReturnRequestSummary {
  id: string;
  orderId: string;
  userId: string;
  reason: string;
  status: ReturnRequestStatus;
  adminNote?: string | null;
  refundAmount?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminReturnRequest extends ReturnRequestSummary {
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  order?: {
    id: string;
    orderNumber: string;
    finalOrderAmount: number;
    status: OrderStatus;
    deliveredAt?: string | null;
    items?: Array<{
      id: string;
      productId?: string;
      productName: string;
      quantity: number;
      unitPrice: number;
    }>;
  };
}

export interface SupportTicketPayload {
  name: string;
  email: string;
  phone?: string;
  orderId?: string;
  type: "SUPPORT" | "COMPLAINT";
  subject: string;
  message: string;
}

export interface SupportTicketItem {
  id: string;
  ticketNumber?: string;
  type: string;
  name: string;
  email: string;
  phone?: string;
  orderId?: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  status?: string;
  createdAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  entityId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  totalOrders: number;
  lifetimeSpend: number;
  lastOrderDate: string | null;
  firstOrderFreeDeliveryUsed: boolean;
  createdAt: string;
}

export interface AdminCustomerDossier {
  profile: UserProfile;
  addresses: SavedAddress[];
  orders: OrderSummary[];
  totalSpent: number;
  totalOrders: number;
}

export interface AdminAnalyticsOverview {
  kpis: {
    totalDeliveredSales: number;
    deliveredOrdersCount: number;
    totalNetRevenue: number;
    totalCustomers: number;
    returnedOrdersCount: number;
  };
  recentOrders: OrderSummary[];
  recentReturnRequests: OrderSummary[];
}

export interface AdminChartPoint {
  date: string;
  sales: number;
  orders: number;
}

export interface AdminAnalyticsReports {
  statusCounts: Record<OrderStatus, number>;
  averageOrderValue: number;
  cancellationRate: string;
  returnRate: string;
  topProducts: Array<{
    productId: string;
    name: string;
    unitsSold: number;
    revenue: number;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  token?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages?: number;
  };
}
