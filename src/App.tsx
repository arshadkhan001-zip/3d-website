import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/navigation/Navbar";
import AnnouncementBar from "./components/navigation/AnnouncementBar";
import ScrollManager from "./components/navigation/ScrollManager";
import Footer from "./components/navigation/Footer";
import MobileNav from "./components/navigation/MobileNav";
import SearchOverlay from "./components/search/SearchOverlay";
import CartDrawer from "./components/cart/CartDrawer";
import Home from "./pages/Home";
import ShopPage from "./pages/ShopPage";
import { CollectionDetail, CollectionsPage } from "./pages/Collections";
import ProductPage from "./components/products/ProductPage";
import WishlistPage from "./pages/WishlistPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AccountPage from "./pages/AccountPage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";
import { OrderPage, TrackPage } from "./pages/OrderPages";
import CartToast from "./components/cart/CartToast";
import { CartProvider } from "./lib/cart/cart";
import { WishlistProvider } from "./lib/wishlist/wishlist";
import { ThemeProvider } from "./lib/theme/theme";
import { AuthProvider } from "./lib/auth";
import RequireAdmin from "./pages/admin/RequireAdmin";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import { AdminOrders, AdminOrderDetail } from "./pages/admin/Orders";
import { AdminProducts, AdminProductEdit } from "./pages/admin/Products";
import Inventory from "./pages/admin/Inventory";
import Coupons from "./pages/admin/Coupons";
import { AdminCustomers, AdminCustomerDetail } from "./pages/admin/Customers";
import Notifications from "./pages/admin/Notifications";
import Settings from "./pages/admin/Settings";

/** Full storefront + admin: cinematic home, catalog, checkout, /admin. */
export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = () => setSearchOpen(true);

  return (
    <ThemeProvider>
      <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <ScrollManager />
            <div id="top" className="min-h-screen bg-abyss font-body text-snow">
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-snow focus:px-4 focus:py-2 focus:text-ink"
              >
                Skip to content
              </a>
              <AnnouncementBar />
              <Navbar onSearch={openSearch} />
              <main id="main" className="pb-16 md:pb-0">
                <Routes>
                  <Route index element={<Home />} />
                  <Route path="shop" element={<ShopPage />} />
                  <Route path="collections" element={<CollectionsPage />} />
                  <Route path="collection/:id" element={<CollectionDetail />} />
                  <Route path="product/:slug" element={<ProductPage />} />
                  <Route path="wishlist" element={<WishlistPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="order/:id" element={<OrderPage />} />
                  <Route path="track" element={<TrackPage />} />
                  <Route path="account" element={<AccountPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
                    <Route index element={<Dashboard />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="orders/:id" element={<AdminOrderDetail />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<AdminProductEdit />} />
                    <Route path="products/:id" element={<AdminProductEdit />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="coupons" element={<Coupons />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="customers/:id" element={<AdminCustomerDetail />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
              <MobileNav onSearch={openSearch} />
            </div>
            <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
            <CartDrawer />
            <CartToast />
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
