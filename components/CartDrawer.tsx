"use client";

import React, { useState } from "react";
import { Product } from "./ProductCard";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Product[];
  onRemoveItem: (id: string) => void;
  onCheckoutSubmit: (name: string, email: string) => Promise<void>;
  isCheckoutLoading: boolean;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onCheckoutSubmit,
  isCheckoutLoading,
}: CartDrawerProps) {
  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const subtotal = cartItems.reduce((sum, item) => sum + item.salePrice, 0);

  const handleCheckoutClick = () => {
    if (cartItems.length === 0) return;
    setErrorMsg("");
    setStep("checkout");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!name.trim() || !email.trim()) return;
    try {
      await onCheckoutSubmit(name, email);
      setName("");
      setEmail("");
      setStep("cart");
    } catch {
      setErrorMsg("Payment failed. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Background Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div className="fixed right-0 top-0 bottom-0 h-full w-full max-w-md bg-white shadow-halo z-50 flex flex-col transition-transform duration-300 animate-slide-in font-sans">
        {/* Drawer Header */}
        <div className="bg-black text-white px-6 py-4 flex items-center justify-between border-b border-gray-800">
          <h3 className="font-bold text-xs uppercase tracking-wider font-mono">
            {step === "cart" ? "Your Cart" : "Checkout Details"}
          </h3>
          <button
            onClick={onClose}
            className="text-white/85 hover:text-white text-lg font-bold p-1 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
          {step === "cart" ? (
            /* ================= STEP 1: CART ITEMS ================= */
            <div className="flex flex-col h-full justify-between">
              <div>
                {cartItems.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 bg-gray-50/50 p-3 border border-gray-100 rounded-sm relative group"
                      >
                        {/* Mini book cover representation */}
                        <div className="w-[50px] h-[70px] bg-gradient-to-r from-gray-900 to-black rounded-r-xs flex items-center justify-center p-1.5 shrink-0 shadow-sm border-l-2 border-black/20">
                          <span className="text-[6px] text-white font-extrabold text-center leading-tight font-devanagari line-clamp-3">
                            {item.examName}
                          </span>
                        </div>

                        {/* Item metadata */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 truncate uppercase font-mono">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {item.language} • {item.pages ? `${item.pages} Pages` : "PDF Guide"}
                          </p>
                          <p className="text-xs font-extrabold text-black mt-1">
                            ₹{item.salePrice.toFixed(2)}
                          </p>
                        </div>

                        {/* Remove item button */}
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xs p-1 cursor-pointer transition-colors"
                          title="Remove item"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <span className="text-4xl block mb-3">🛒</span>
                    <h4 className="text-sm font-bold text-gray-800">Your cart is empty</h4>
                    <p className="text-xs text-gray-400 max-w-[200px] mx-auto mt-1">
                      Add Rajasthan exam preparation guides to get started.
                    </p>
                  </div>
                )}
              </div>

              {/* Subtotal & Action */}
              {cartItems.length > 0 && (
                <div className="border-t border-gray-100 pt-6 mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-gray-500">Subtotal:</span>
                    <span className="text-base font-extrabold text-gray-900">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckoutClick}
                    className="w-full h-11 bg-black hover:bg-gray-800 text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-md transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ================= STEP 2: CHECKOUT FORM ================= */
            <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between">
              <div className="flex flex-col gap-4">
                {/* Order Summary mini-card */}
                <div className="bg-gray-50 p-4 border border-gray-100 rounded-sm">
                  <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider block mb-2">
                    Order Summary
                  </span>
                  <div className="max-h-[120px] overflow-y-auto flex flex-col gap-2 pr-1">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-[11px]">
                        <span className="text-gray-700 truncate max-w-[240px]">{item.title}</span>
                        <span className="font-semibold text-gray-900">₹{item.salePrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200/50 pt-2.5 mt-2.5 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">Total:</span>
                    <span className="text-sm font-extrabold text-black">₹{subtotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Billing inputs */}
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-gray-50 border border-gray-200 rounded-sm focus:bg-white focus:border-black outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="Enter your email (PDF will be sent here)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-10 px-3 text-xs bg-gray-50 border border-gray-200 rounded-sm focus:bg-white focus:border-black outline-none transition-colors"
                    />
                    <span className="text-[9px] text-gray-400 mt-1.5 block leading-normal">
                      ⚠️ Double check your email. Your digital PDF guide link will be emailed manually within 10-20 mins.
                    </span>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-sm">
                  {errorMsg}
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-gray-100 pt-6 mt-8 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isCheckoutLoading}
                  className="w-full h-11 bg-black hover:bg-gray-800 text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-md transition-colors flex items-center justify-center disabled:bg-gray-400"
                >
                  {isCheckoutLoading ? "Creating Order..." : `Pay Now (₹${subtotal.toFixed(2)})`}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("cart")}
                  className="w-full h-10 bg-transparent text-gray-500 hover:text-black text-xs font-bold uppercase tracking-wider rounded-sm transition-colors"
                >
                  Back to Cart
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
