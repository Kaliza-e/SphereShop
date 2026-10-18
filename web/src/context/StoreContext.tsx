import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Cart, Product } from "../types";
import { apiRequest } from "../services/api";

export interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface StoreContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  authLoading: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  register: (payload: any) => Promise<User>;
  logout: () => Promise<void>;
  cart: Cart | null;
  cartCount: number;
  cartLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (skuOrId: string, quantity?: number) => Promise<void>;
  updateCartQty: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  wishlist: string[];
  toggleWishlist: (sku: string) => void;
  isInWishlist: (sku: string) => boolean;
  toasts: ToastItem[];
  showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
  removeToast: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("sphereshop_wishlist");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleWishlist = (sku: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(sku);
      const next = exists ? prev.filter((s) => s !== sku) : [...prev, sku];
      try {
        localStorage.setItem("sphereshop_wishlist", JSON.stringify(next));
      } catch {}
      showToast(exists ? "Removed from wishlist" : "Added to your wishlist", "info");
      return next;
    });
  };

  const isInWishlist = (sku: string) => wishlist.includes(sku);

  // Load active user session on startup
  useEffect(() => {
    async function loadUser() {
      setAuthLoading(true);
      try {
        const data = await apiRequest("/auth/me");
        if (data?.user) {
          setUser(data.user);
        }
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }
    loadUser();
  }, []);

  // Fetch cart
  const refreshCart = async () => {
    setCartLoading(true);
    try {
      const data = await apiRequest("/cart");
      if (data) {
        setCart(data);
        const count = data.lines?.reduce((acc: number, line: any) => acc + (line.quantity || 0), 0) || 0;
        setCartCount(count);
      }
    } catch (err) {
      console.error("Failed to load cart:", err);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const login = async (identifier: string, password: string): Promise<User> => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });
    setUser(data.user);
    showToast(`Welcome back, ${data.user.name}!`, "success");
    await refreshCart();
    return data.user;
  };

  const register = async (payload: any): Promise<User> => {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setUser(data.user);
    showToast("Account created successfully! Welcome to SphereShop Kigali.", "success");
    await refreshCart();
    return data.user;
  };

  const logout = async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
    showToast("You have been signed out.", "info");
    await refreshCart();
  };

  const addToCart = async (skuOrId: string, quantity = 1) => {
    try {
      await apiRequest("/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId: skuOrId, quantity }),
      });
      await refreshCart();
      showToast("Added item to your cart!", "success");
    } catch (err: any) {
      showToast(err.message || "Could not add item to cart", "error");
      throw err;
    }
  };

  const updateCartQty = async (productId: string, quantity: number) => {
    try {
      await apiRequest(`/cart/items/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });
      await refreshCart();
    } catch (err: any) {
      showToast(err.message || "Failed to update quantity", "error");
      throw err;
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      await apiRequest(`/cart/items/${productId}`, {
        method: "DELETE",
      });
      await refreshCart();
      showToast("Item removed from cart", "info");
    } catch (err: any) {
      showToast(err.message || "Failed to remove item", "error");
      throw err;
    }
  };

  const applyCoupon = async (code: string) => {
    try {
      const data = await apiRequest("/cart/coupon", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      await refreshCart();
      showToast(`Coupon applied! Discount: ${data.coupon?.percent}% off`, "success");
    } catch (err: any) {
      showToast(err.message || "Coupon is invalid or cannot be applied", "error");
      throw err;
    }
  };

  const removeCoupon = async () => {
    try {
      await apiRequest("/cart/coupon", {
        method: "DELETE",
      });
      await refreshCart();
      showToast("Coupon removed", "info");
    } catch (err: any) {
      showToast(err.message || "Failed to remove coupon", "error");
      throw err;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        setUser,
        authLoading,
        login,
        register,
        logout,
        cart,
        cartCount,
        cartLoading,
        refreshCart,
        addToCart,
        updateCartQty,
        removeFromCart,
        applyCoupon,
        removeCoupon,
        wishlist,
        toggleWishlist,
        isInWishlist,
        toasts,
        showToast,
        removeToast,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return ctx;
}
