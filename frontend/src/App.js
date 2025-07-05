import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ShopeeUI from "./ShopeeUI";
import CategoryPage from "./pages/CategoryPage";
import AllCategories from "./pages/AllCategories";
import SellerDashboard from "./pages/SellerDashboard";
import UserProfile from "./pages/UserProfile";
import { CartProvider } from "./context/CartContext";
import { SellerAuthProvider } from "./context/SellerAuthContext";
import SellerLogin from "./pages/SellerLogin";
import SellerRegister from "./pages/SellerRegister";
import ProductDetails from "./pages/ProductDetails";

function App() {
  return (
    <SellerAuthProvider>
      <CartProvider>
        <Router>
                  <Routes>
          <Route path="/" element={<ShopeeUI />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/categories" element={<AllCategories />} />
          <Route path="/seller/login" element={<SellerLogin />} />
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/register" element={<SellerRegister />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/product/:productId" element={<ProductDetails />} />
        </Routes>
        </Router>
      </CartProvider>
    </SellerAuthProvider>
  );
}

export default App;