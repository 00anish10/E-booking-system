import { createContext, useContext, useState, ReactNode } from "react";


export interface CartItem {
  id: string;
  title: string;
  author: string;
  price: number;
  cover: string;
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
  purchasedBooks: string[];
  purchaseBooks: () => void;
}

/* ================= CONTEXT ================= */

const CartContext = createContext<CartContextType | undefined>(undefined);

/* ================= PROVIDER ================= */

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [purchasedBooks, setPurchasedBooks] = useState<string[]>([]);

  /* Add to cart */
  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);

      if (existing) {
        return prev.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [...prev, { ...item, quantity: 1 }];
    });
  };

  /* Remove item */
  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  /* Update quantity */
  const updateQuantity = (id: string, quantity: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  /* Clear cart */
  const clearCart = () => {
    setItems([]);
  };

  /* Total price (FIXED) */
  const getTotalPrice = () => {
    return items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  /* Total item count (FIXED) */
  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  /* Purchase */
  const purchaseBooks = () => {
    const bookIds = items.map(item => item.id);
    setPurchasedBooks(prev => [...prev, ...bookIds]);
    clearCart();
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getItemCount,
        purchasedBooks,
        purchaseBooks,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/* ================= HOOK ================= */

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
