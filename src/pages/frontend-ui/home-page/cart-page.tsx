import { motion } from "framer-motion";
import { useCart } from "@/contexts/cart-context";
import { useNavigate } from "react-router";
import { Trash2, ShoppingBag, ArrowLeft, Plus, Minus } from "lucide-react";
import { useState } from "react";

const CartPage = () => {
  const { items, removeFromCart, getTotalPrice, purchaseBooks, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState("");

  const handleCheckout = () => {
    purchaseBooks();
    navigate("/library");
  };

  const handleApplyCoupon = () => {
    if (coupon.trim() !== "") alert(`Coupon "${coupon}" applied!`);
  };
  

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative inline-block mb-8"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 rounded-full blur-3xl opacity-25 animate-pulse" />
              <div className="relative bg-white dark:bg-gray-900 rounded-full p-10 shadow-2xl">
                <ShoppingBag className="h-20 w-20 text-pink-500 dark:text-purple-400" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent"
            >
              Your cart is empty
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 dark:text-gray-400 mb-10 text-lg"
            >
              Start your reading journey and discover amazing books today!
            </motion.p>

            <motion.button
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/catalog")}
              className="px-10 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-300 shadow-xl hover:shadow-2xl font-semibold text-lg flex items-center justify-center gap-3 mx-auto"
            >
              Browse Books
              <ShoppingBag className="h-5 w-5 animate-bounce" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center mb-4 text-gray-500 hover:text-foreground transition"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </button>

          <h1 className="text-4xl font-bold text-foreground mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">{items.length} items in your cart</p>
        </motion.div>

        {/* Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl transition-all"
              >
                <div className="flex gap-6 items-center">
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-24 h-32 object-cover rounded-lg shadow-md"
                  />

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">{item.title}</h3>
                    <p className="text-muted-foreground mb-4">{item.author}</p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-pink-500 dark:text-purple-400">
                        ${item.price}
                      </span>

                      {/* Quantity Selector */}
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <button type="button"
                          onClick={() =>
                            updateQuantity(item.id, Math.max((item.quantity || 1) - 1, 1))
                          }
                          className="px-3 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 py-1 text-foreground">{item.quantity || 1}</span>
                        <button type="button"
                          onClick={() =>
                            updateQuantity(item.id, (item.quantity || 1) + 1)
                          }
                          className="px-3 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <button type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="flex items-center text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1 rounded-md transition"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            

            {/* Coupon */}
            <div className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mt-4 flex gap-4 items-center">
              <input
                type="text"
                placeholder="Coupon Code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background text-foreground"
              />
              <button type="button"
                onClick={handleApplyCoupon}
                className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition shadow"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Right Side - Summary */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-foreground mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount</span>
                  <span>$0.00</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-foreground mb-6">
                <span>Total</span>
                <span className="text-pink-500 dark:text-purple-400">${getTotalPrice().toFixed(2)}</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleCheckout}
                className="w-full py-4 bg-pink-500 text-white hover:bg-pink-600 transition shadow-lg hover:shadow-2xl text-lg font-semibold rounded-2xl"
              >
                Checkout
              </motion.button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Secure checkout • Instant access
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
