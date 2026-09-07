import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { ScrollToTop } from './components/common/ScrollToTop';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AuthPage } from './pages/AuthPage';
import { AccountPage } from './pages/AccountPage';
import { ProductModal } from './components/modal/ProductModal';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { PrivacyPolicyPage } from './pages/policies/PrivacyPolicyPage';
import { TermsPage } from './pages/policies/TermsPage';
import { ShippingPolicyPage } from './pages/policies/ShippingPolicyPage';
import { RefundPolicyPage } from './pages/policies/RefundPolicyPage';
import { AdminGuard } from './components/admin/AdminGuard';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { RazorpayCheckoutModal } from './components/modal/RazorpayCheckoutModal';
import { FloatingCartBar } from './components/cart/FloatingCartBar';
import { OrderSummaryDrawer } from './components/cart/OrderSummaryDrawer';
import { WishlistDrawer } from './components/wishlist/WishlistDrawer';
import { BackToTop } from './components/common/BackToTop';
import { CheckCircle2 } from 'lucide-react';

const ToastNotification = () => {
  const { toastMessage } = useCart();
  if (!toastMessage) return null;

  return (
    <div className="fixed top-20 right-5 z-50 animate-fade-in">
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-forest-deep text-cream-warm border border-gold-antique shadow-2xl text-xs font-semibold font-sans">
        <CheckCircle2 className="w-4 h-4 text-gold-antique" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <ScrollToTop />
              <div className="min-h-screen flex flex-col relative bg-forest-ink text-cream-warm">
                {/* Sticky Navigation Header */}
                <Navbar />
                
                {/* Main Multi-Page Routed Content */}
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/shop/:categoryId" element={<ShopPage />} />
                    <Route path="/product/:slug" element={<ProductDetailPage />} />
                    <Route path="/combos" element={<ShopPage />} />
                    <Route path="/special-combo" element={<ShopPage />} />
                    <Route path="/special-combos" element={<ShopPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/register" element={<AuthPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/my-account" element={<AccountPage />} />
                    <Route path="/orders" element={<AccountPage defaultTab="orders" />} />
                    <Route path="/profile" element={<AccountPage defaultTab="personal" />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />

                    {/* Legal, Shipping, and Return Policies */}
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/terms-conditions" element={<TermsPage />} />
                    <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                    <Route path="/refund-policy" element={<RefundPolicyPage />} />
                    <Route path="/cancellation-policy" element={<RefundPolicyPage />} />

                    {/* Admin Kitchen & Dispatch Operations (Protected by AdminGuard) */}
                    <Route
                      path="/admin"
                      element={
                        <AdminGuard>
                          <AdminLayout />
                        </AdminGuard>
                      }
                    >
                      <Route index element={<Navigate to="/admin/orders" replace />} />
                      <Route path="orders" element={<AdminOrdersPage />} />
                      <Route path="inventory" element={<AdminInventoryPage />} />
                      <Route path="dashboard" element={<AdminDashboardPage />} />
                    </Route>

                    {/* Fallback route */}
                    <Route path="*" element={<HomePage />} />
                  </Routes>
                </main>

              {/* Global Footer */}
              <Footer />

              {/* Interactive Global Overlays, Floating Buttons & Drawers */}
              <ProductModal />
              <OrderSummaryDrawer />
              <RazorpayCheckoutModal />
              <WishlistDrawer />
              <FloatingCartBar />
              <BackToTop />
              <ToastNotification />
            </div>
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </ThemeProvider>
  );
}

export default App;
