import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Dashboard from "./Pages/Dashboard";
import Register from "./Pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginModal from "./Pages/LoginModal";
import { motion } from "framer-motion";
import Home from "./Pages/Home"
import Profile from "./Pages/Profile";
import Products from "./Pages/Products";
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="h-20" /> {/* spacer for fixed header */}
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/products" element={<Products />} />
            <Route path="/login" element={<LoginModal open={true} onClose={()=>{}} />} />
            <Route path="/" element={<Home />} />
          </Routes>

          <div className="flex-1" />
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
