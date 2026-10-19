export interface User {
  id?: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  status?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  oldPrice?: number;
  imageUrl?: string;
  imgUrls?: string[];
  rating?: number;
  reviewCount?: number;
  brandId?: number;
  brandName?: string;
  categoryId?: number;
  categoryName?: string;
  sellerId?: number;
  sellerName?: string;
  quantity?: number;
  badge?: string;
  isActive?: boolean;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  text?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface CreateReviewDto {
  productId: number;
  rating: number;
  text?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface OrderItemDto {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderDto {
  id: number;
  orderStatus: string;
  totalAmount: number;
  deliveryAddress: string;
  phone: string;
  comment?: string;
  createdDate?: string;
  items: OrderItemDto[];
}

export interface Category {
  id: number;
  name: string;
  parentId?: number;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
}

export interface BasketProps {
  cartItems?: CartItem[];
  products?: Product[];
  suggestions?: Product[];
  favoriteIds?: number[];
  bonuses?: number;
  cashback?: number;
  onQuantityChange?: (cartItemId: number, quantity: number) => void;
  onRemove?: (cartItemId: number) => void;
  onClear?: () => void;
  onToggleFavorite?: (productId: number) => void;
  onApplyPromo?: (code: string) => void;
  onAddToCart?: (productId: number) => void;
  onCheckout?: () => void;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  requiresCard?: boolean;
}

export interface PaymentFormData {
  paymentMethodId: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  variant: string;
  qty: number;
  brand: string;
  price: number;
  image: string;
}

export interface CheckoutPaymentProps {
  items: OrderItem[];
  itemsCount?: number;
  goodsTotal?: number;
  deliveryPrice?: number;
  deliveryLabel?: string;
  cashback?: number;
  paymentMethods?: PaymentMethod[];
  onBack?: () => void;
  onSubmit?: (data: PaymentFormData) => void;
  onApplyPromo?: (code: string) => void;
}

export interface PaymentNavState {
  paymentMethodId?: string;
  paymentMethodName?: string;
  items?: OrderItem[];
  itemsCount?: number;
  goodsTotal?: number;
  deliveryPrice?: number;
  deliveryLabel?: string;
  cashback?: number;
  total?: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  comment?: string;
}

export interface DeliveryNavState {
  items?: OrderItem[];
  itemsCount?: number;
  goodsTotal?: number;
  cashback?: number;
  deliveryPrice?: number;
  deliveryLabel?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  comment?: string;
}

export interface DeliveryMethod {
  id: string;
  name: string;
  eta: string;
  price: number;
}

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  deliveryMethodId: string;
  address: string;
  comment: string;
}

export interface CheckoutDeliveryProps {
  itemsCount?: number;
  goodsTotal?: number;
  cashback?: number;
  deliveryMethods?: DeliveryMethod[];
  onSubmit?: (data: CheckoutFormData) => void;
  onApplyPromo?: (code: string) => void;
}

export interface RegisterSellerDto {
  shopName: string;
  phone: string;
}