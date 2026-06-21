"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import SidebarCategories from "@/components/SidebarCategories";
import ProductCard, { Product } from "@/components/ProductCard";
import Footer from "@/components/Footer";
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
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation */}
      <Navbar />

      {/* Hero Banner Area */}
      <HeroSlider />

      {/* Main Container Layout: Sidebar + Main Content Grid */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 flex-1 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Categories Sidebar */}
          <div className="w-full lg:w-[280px] shrink-0">
            <SidebarCategories />
          </div>

          {/* Right Column: Products List with Search/Filters */}
          <div className="flex-1">
            {/* Search & Filter Header - Shopify Minimalist Style */}
            <div className="bg-white p-4 border border-gray-100 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0">
                {["All", "Notes", "MCQ", "Mock Test"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                      selectedType === type
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {type === "All" ? "All items" : type === "MCQ" ? "MCQs" : `${type}s`}
                  </button>
                ))}
              </div>

              {/* In-page search filter input */}
              <div className="relative max-w-xs w-full">
                <input
                  type="text"
                  placeholder="Filter by exam or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-4 bg-gray-50 text-xs text-gray-700 outline-none border border-gray-200 rounded-full focus:bg-white focus:border-black transition-colors"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-2.5"
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
                <span className="text-4xl block mb-4">🔍</span>
                <h3 className="text-sm font-bold text-gray-800 mb-1">No products found</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Try adjusting your keywords or select another exam category from the sidebar.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Support Icon (AI assistant disabled as requested) */}
      <a
        href="https://wa.me/919950252138"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float shadow-lg hover:scale-105 transition-transform"
        title="Contact Support on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.453L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.859-4.42 9.863-9.864.002-2.637-1.023-5.116-2.887-6.98C16.584 1.895 14.1 1.867 12.01 1.867c-5.437 0-9.86 4.42-9.863 9.864 0 1.741.484 3.44 1.402 4.903L2.556 21.46l4.091-1.306zM17.65 14.28c-.309-.155-1.83-.903-2.115-1.006-.285-.103-.493-.155-.7.156-.207.31-.8.981-.98 1.187-.18.207-.361.233-.67.078-.309-.155-1.305-.48-2.486-1.534-.919-.819-1.54-1.83-1.72-2.139-.18-.309-.02-.477.135-.63.14-.139.31-.361.464-.542.155-.18.206-.31.309-.516.103-.207.052-.387-.026-.542-.078-.155-.7-1.688-.96-2.307-.253-.608-.51-.527-.7-.527-.18 0-.387-.008-.594-.008s-.542.078-.826.387c-.284.31-1.084 1.058-1.084 2.58 0 1.523 1.109 2.99 1.264 3.196.155.206 2.182 3.332 5.286 4.67 1.218.525 2.13.84 2.861 1.07.734.23 1.401.182 1.93.102.589-.088 1.83-.748 2.088-1.47.258-.723.258-1.343.18-1.471-.077-.129-.284-.207-.593-.362z"/>
        </svg>
      </a>

      {/* Premium Minimalist Footer */}
      <Footer />

      {/* Checkout Popup Modal */}
      {checkoutProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-sm w-full max-w-md shadow-2xl overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider font-mono">Checkout Product</h3>
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
                  <h4 className="text-sm font-bold text-gray-800 mb-1">Processing Order...</h4>
                  <p className="text-xs text-gray-500">Creating your secure manual delivery request...</p>
                </div>
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4">
                  {/* Product Details Box */}
                  <div className="bg-gray-50 p-4 border border-gray-100 rounded-sm">
                    <span className="text-[10px] text-black font-extrabold uppercase tracking-wider block mb-1">
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
                      <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter your name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full h-10 px-3 text-xs bg-gray-50 border border-gray-200 rounded-sm focus:bg-white focus:border-black outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="Enter your email (PDF will be sent here)"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full h-10 px-3 text-xs bg-gray-50 border border-gray-200 rounded-sm focus:bg-white focus:border-black outline-none transition-colors"
                      />
                      <span className="text-[9px] text-gray-400 mt-1 block">
                        ⚠️ Double check your email. Your digital PDF guide link will be emailed manually within 10-20 mins.
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full h-11 bg-black hover:bg-gray-800 text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-md transition-colors mt-2"
                  >
                    Proceed to Payment (₹{checkoutProduct.salePrice.toFixed(2)})
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50/50 flex items-center justify-center text-gray-500 font-sans">Loading marketplace...</div>}>
      <HomeContent />
    </Suspense>
  );
}
