"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import SidebarCategories from "@/components/SidebarCategories";
import ProductCard, { Product } from "@/components/ProductCard";
import AiAssistantWidget from "@/components/AiAssistantWidget";
import productsMock from "@/data/products_mock.json";

function HomeContent() {
  const searchParams = useSearchParams();
  const allProducts = productsMock as Product[];
  const [selectedType, setSelectedType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get("q") || "");
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);

  // Filter products based on search and selected type tab
  const filteredProducts = allProducts.filter((product) => {
    const matchesType = selectedType === "All" || product.type === selectedType;
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.examName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.groupName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleBuyNow = (product: Product) => {
    setCheckoutProduct(product);
    setOrderSuccess(false);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail || !customerName) return;

    // Simulate order placement
    // In later steps, we will link this to Supabase orders table & Razorpay checkout
    setOrderSuccess(true);
    setTimeout(() => {
      setCheckoutProduct(null);
      setCustomerEmail("");
      setCustomerName("");
      setOrderSuccess(false);
      alert(`Order Placed Successfully!\n\nEmail Manual Delivery Setup: A Google Drive link for "${checkoutProduct?.title}" will be sent to "${customerEmail}" manually after verifying the payment.`);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-gray-50/50 font-sans pb-20">
      {/* Top Navigation */}
      <Navbar />

      {/* Hero Banner Area */}
      <HeroSlider />

      {/* Main Container Layout: Sidebar + Main Content Grid */}
      <section className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column: Categories Sidebar */}
          <div className="w-full lg:w-[300px] shrink-0">
            <SidebarCategories />
          </div>

          {/* Right Column: Products List with Search/Filters */}
          <div className="flex-1">
            {/* Search & Filter Header */}
            <div className="bg-white p-4 border border-gray-100 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
                {["All", "Notes", "MCQ", "Mock Test"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                      selectedType === type
                        ? "bg-[#e00000] text-white"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {type === "All" ? "All items" : type === "MCQ" ? "MCQs" : `${type}s`}
                  </button>
                ))}
              </div>

              {/* In-page search input */}
              <div className="relative max-w-xs w-full">
                <input
                  type="text"
                  placeholder="Filter by exam or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-8 pr-4 bg-gray-50 text-xs text-gray-700 outline-none border border-gray-200 rounded-sm focus:bg-white focus:border-[#e00000] transition-colors"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-400 absolute left-2.5 top-2.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onBuyNow={handleBuyNow}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-100 text-center py-20 px-4 rounded-sm shadow-sm">
                <span className="text-5xl block mb-4">🔍</span>
                <h3 className="text-base font-bold text-gray-800 mb-1">No products found</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Try adjusting your keywords or select another exam group from the sidebar categories.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Floating Eligibility Assistant Widget */}
      <AiAssistantWidget />

      {/* Checkout Popup Modal */}
      {checkoutProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-sm w-full max-w-md shadow-2xl overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="bg-[#e00000] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-wider">Checkout Product</h3>
              <button
                onClick={() => setCheckoutProduct(null)}
                className="text-white/80 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {orderSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
                    ✓
                  </div>
                  <h4 className="text-base font-bold text-gray-800 mb-1">Processing Order...</h4>
                  <p className="text-xs text-gray-500">Creating your secure manual delivery request...</p>
                </div>
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4">
                  {/* Product Details Box */}
                  <div className="bg-gray-50 p-4 border border-gray-100 rounded-sm">
                    <span className="text-[10px] text-[#e00000] font-extrabold uppercase tracking-wider block mb-1">
                      {checkoutProduct.examName} ({checkoutProduct.type})
                    </span>
                    <h4 className="text-xs font-semibold text-gray-800 leading-snug mb-2">
                      {checkoutProduct.title}
                    </h4>
                    <div className="flex items-center justify-between border-t border-gray-200/50 pt-2 mt-2">
                      <span className="text-xs text-gray-500 font-medium">Order Total:</span>
                      <span className="text-sm font-bold text-gray-900">₹{checkoutProduct.salePrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Customer Input */}
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter your name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full h-10 px-3 text-xs bg-gray-50 border border-gray-200 rounded-sm focus:bg-white focus:border-[#e00000] outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="Enter your email (PDF will be sent here)"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full h-10 px-3 text-xs bg-gray-50 border border-gray-200 rounded-sm focus:bg-white focus:border-[#e00000] outline-none transition-colors"
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        ⚠️ Double check your email. Your digital PDF guide link will be emailed manually within 10-20 mins.
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full h-11 bg-[#e00000] hover:bg-[#cc0000] text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-md transition-colors mt-2"
                  >
                    Proceed to Payment (₹{checkoutProduct.salePrice.toFixed(2)})
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50/50 flex items-center justify-center text-gray-500 font-sans">Loading marketplace...</div>}>
      <HomeContent />
    </Suspense>
  );
}
