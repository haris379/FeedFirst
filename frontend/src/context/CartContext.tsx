import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";
import type { Product } from "../types";

export interface CartLine {
  product: Product;
  quantity: number;
}

interface CartContextType {
  birdType: string;
  setBirdType: (v: string) => void;
  lines: CartLine[];
  specialInstructions: string;
  setSpecialInstructions: (v: string) => void;
  addOrUpdateIngredient: (product: Product, quantity: number) => void;
  removeIngredient: (productId: string) => void;
  clearCart: () => void;
  totalWeightKg: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "bf_cart";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [birdType, setBirdType] = useState("");
  const [lines, setLines] = useState<CartLine[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Load from localStorage on mount (guest persistence)
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setBirdType(parsed.birdType || "");
        setLines(parsed.lines || []);
        setSpecialInstructions(parsed.specialInstructions || "");
      } catch {
        /* ignore corrupt cart */
      }
    }
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ birdType, lines, specialInstructions }));
  }, [birdType, lines, specialInstructions]);

  // When a user logs in, push the current cart to the backend so it's tied to their account.
  useEffect(() => {
    if (user && lines.length > 0) {
      api
        .post("/cart", {
          birdType,
          ingredients: lines.map((l) => ({ product: l.product._id, quantity: l.quantity })),
          specialInstructions,
        })
        .catch(() => {
          /* non-blocking */
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addOrUpdateIngredient = (product: Product, quantity: number) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.product._id === product._id);
      if (quantity <= 0) {
        return prev.filter((l) => l.product._id !== product._id);
      }
      if (existing) {
        return prev.map((l) => (l.product._id === product._id ? { ...l, quantity } : l));
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeIngredient = (productId: string) => {
    setLines((prev) => prev.filter((l) => l.product._id !== productId));
  };

  const clearCart = () => {
    setBirdType("");
    setLines([]);
    setSpecialInstructions("");
    localStorage.removeItem(STORAGE_KEY);
  };

  const totalWeightKg = lines.reduce((sum, l) => {
    let kg = l.quantity;
    if (l.product.unit === "g") kg = l.quantity / 1000;
    if (l.product.unit === "lb") kg = l.quantity * 0.4536;
    if (l.product.unit === "pack") kg = 0;
    return sum + kg;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        birdType,
        setBirdType,
        lines,
        specialInstructions,
        setSpecialInstructions,
        addOrUpdateIngredient,
        removeIngredient,
        clearCart,
        totalWeightKg,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
