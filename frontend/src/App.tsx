import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import BasketContainer from './pages/Basket/BasketContainer';
import ProductPage from './pages/ProductPage/ProductPage';
import CheckoutPage from './pages/CheckoutPage/CheckoutPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import CatalogPage from './pages/CatalogPage/CatalogPage';
import PasswordRecoveryPage from './pages/PasswordRecoveryPage/PasswordRecoveryPage';
import ConfirmationCodePage from './pages/ConfirmationCodePage/ConfirmationCodePage';
import NewPasswordPage from './pages/NewPasswordPage/NewPasswordPage';
import ConfirmNewPasswordPage from './pages/ConfirmNewPasswordPage/ConfirmNewPasswordPage';
import { CategoryCatalogPage } from './pages/CategoryCatalogPage/CategoryCatalogPage';
import { AllProductsPage } from './pages/AllProductsPage/AllProductsPage';
import Delivery from './pages/Delivery/Delivery';
import Payment from './pages/Payment/Payment';
import { OrderVerification } from './pages/OrderVerification/OrderVerification';
import SellerRegisterPage  from './pages/SellerRegisterPage/SellerRegisterPage'
import SellerDashboardPage from './pages/SellerDashboardPage/SellerDashboardPage';
import SellerVerificationPage from './pages/Sellerverificationpage/Sellerverificationpage';
import SellerProductsPage from './pages/Sellerproductspage/Sellerproductspage';
import SellerOrdersPage from './pages/Sellerorderspage/Sellerorderspage';
import SellerReturnsPage from './pages/Sellerreturnspage/Sellerreturnspage';
import SellerStockPage from './pages/Sellerstockpage/Sellerstockpage';
import SellerCrmPage from './pages/Sellercrmpage/Sellercrmpage';
import SellerAnalyticsPage from './pages/Selleranalyticspage/Selleranalyticspage';
import SellerFinancePage from './pages/SellerFinancePage/SellerFinancePage';
import SellerAdsPage from './pages/SellerAdsPage/SellerAdsPage';
import SellerApiIntegrationsPage from './pages/SellerApiIntegrationsPage/SellerApiIntegrationsPage';
import SellerReviewsPage from './pages/SellerReviewsPage/SellerReviewsPage';
import AdminDashboardPage from './pages/Admindashboardpage/Admindashboardpage';
import AdminUsersPage from './pages/Adminuserspage/Adminuserspage';
import AdminSellersPage from './pages/Adminsellerspage/Adminsellerspage';
import AdminModerationPage from './pages/Adminmoderationpage/Adminmoderationpag';
 import AdminCategoriesPage from './pages/AdminCategoriesPage/AdminCategoriesPage';
 import AdminAdsPage from './pages/AdminAdsPage/AdminAdsPage';
import AdminFinancePage from './pages/AdminFinancePage/AdminFinancePage';
import AdminDisputesPage from './pages/AdminDisputesPage/AdminDisputesPage';
import AdminIntegrationsPage from './pages/AdminIntegrationsPage/AdminIntegrationsPage';
import AdminSecurityPage from './pages/AdminSecurityPage/AdminSecurityPage';


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/"                      element={<HomePage />} />
            <Route path="/login"                 element={<LoginPage />} />
            <Route path="/register"              element={<RegisterPage />} />
            <Route path="/cart"                  element={<BasketContainer />} />
            <Route path="/checkout"              element={<CheckoutPage />} />
            <Route path="/profile"               element={<ProfilePage />} />
            <Route path="/catalog"               element={<CatalogPage />} />
            <Route path="/product/:id"           element={<ProductPage />} />
            <Route path="/password-recovery"     element={<PasswordRecoveryPage />} />
            <Route path="/confirmation-code"     element={<ConfirmationCodePage />} />
            <Route path="/new-password"          element={<NewPasswordPage />} />
            <Route path="/confirm-new-password"  element={<ConfirmNewPasswordPage />} />
            <Route path="/categories"            element={<CategoryCatalogPage />} />
            <Route path="/all-products"          element={<AllProductsPage />} />
            <Route path="/delivery"              element={<Delivery />} />
            <Route path="/payment"               element={<Payment />} />
            <Route path="/order-verification"    element={<OrderVerification />} />
            <Route path="*"                      element={<Navigate to="/" replace />} />
            <Route path="/register-seller" element={<SellerRegisterPage />} />
            <Route path="/seller" element={<SellerDashboardPage />} />
            <Route path="/seller/verification" element={<SellerVerificationPage />} />
            <Route path="/seller/products" element={<SellerProductsPage />} />
            <Route path="/seller/orders" element={<SellerOrdersPage />} />
            <Route path="/seller/returns" element={<SellerReturnsPage />} />
            <Route path="/seller/stock" element={<SellerStockPage />} />
            <Route path="/seller/crm" element={<SellerCrmPage />} />
            <Route path="/seller/analytics" element={<SellerAnalyticsPage />} />
            <Route path="/seller/finance" element={<SellerFinancePage />} />
            <Route path="/seller/ads" element={<SellerAdsPage />} />
            <Route path="/seller/reviews" element={<SellerReviewsPage />} />
            <Route path="/seller/api" element={<SellerApiIntegrationsPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/sellers" element={<AdminSellersPage />} />
             <Route path="/admin/moderation" element={<AdminModerationPage />} />
             <Route path="/admin/categories" element={<AdminCategoriesPage />} />
             <Route path="/admin/ads" element={<AdminAdsPage />} />
             <Route path="/admin/finance" element={<AdminFinancePage />} />
             <Route path="/admin/disputes" element={<AdminDisputesPage />} />
             <Route path="/admin/integrations" element={<AdminIntegrationsPage />} />
             <Route path="/admin/security" element={<AdminSecurityPage />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
