import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const getUserCartKey = (user) => {
  if (user) {
    const id = user._id || user.id || user.email || user.phone;
    if (id) return `chandra_cart_user_${id}`;
  }
  return 'chandra_cart_guest';
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const currentUserId = user ? (user._id || user.id || user.email || user.phone) : null;
  const lastLoadedUserRef = useRef(currentUserId);

  // Load initial cart from user-specific key
  const [cart, setCart] = useState(() => {
    try {
      // Clear legacy global cart so stale items do not leak
      localStorage.removeItem('chandra_cart');

      const savedUser = localStorage.getItem('chandra_active_user');
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      const initialKey = getUserCartKey(parsedUser);
      const saved = localStorage.getItem(initialKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI state for modals and drawer
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [activeProductModal, setActiveProductModal] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Synchronize cart when user changes (login, logout, or user switch)
  useEffect(() => {
    if (lastLoadedUserRef.current === currentUserId) {
      return;
    }

    const previousUserId = lastLoadedUserRef.current;
    lastLoadedUserRef.current = currentUserId;

    try {
      if (currentUserId && !previousUserId) {
        // Transition: Guest -> Logged-in User
        // Check if there are items added while browsing as guest
        const guestSaved = localStorage.getItem('chandra_cart_guest');
        const guestItems = guestSaved ? JSON.parse(guestSaved) : [];

        // Load existing user's cart
        const userKey = getUserCartKey(user);
        const userSaved = localStorage.getItem(userKey);
        const userItems = userSaved ? JSON.parse(userSaved) : [];

        if (guestItems.length > 0) {
          // Merge guest items into user's cart
          const mergedCart = [...userItems];
          guestItems.forEach(gItem => {
            const existingIndex = mergedCart.findIndex(item => item.product.id === gItem.product.id);
            if (existingIndex > -1) {
              mergedCart[existingIndex] = {
                ...mergedCart[existingIndex],
                quantity: mergedCart[existingIndex].quantity + gItem.quantity
              };
            } else {
              mergedCart.push(gItem);
            }
          });

          // Save merged cart to user storage and wipe guest cart to prevent leakage
          localStorage.setItem(userKey, JSON.stringify(mergedCart));
          localStorage.removeItem('chandra_cart_guest');
          setCart(mergedCart);
        } else {
          setCart(userItems);
        }
      } else if (!currentUserId && previousUserId) {
        // Transition: User logged out
        // Reset to clean empty guest cart so previous user's items are never visible
        localStorage.removeItem('chandra_cart_guest');
        setCart([]);
      } else if (currentUserId && previousUserId && currentUserId !== previousUserId) {
        // Transition: Switched between two different users
        const userKey = getUserCartKey(user);
        const saved = localStorage.getItem(userKey);
        setCart(saved ? JSON.parse(saved) : []);
      }
    } catch (e) {
      console.warn('Error synchronizing user cart:', e);
    }
  }, [currentUserId, user]);

  // Persist cart to active user's key
  useEffect(() => {
    if (lastLoadedUserRef.current !== currentUserId) {
      return;
    }

    try {
      const key = getUserCartKey(user);
      localStorage.setItem(key, JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [cart, currentUserId, user]);

  // Toast notification helper
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const addToCart = (product, quantity = 1) => {
    if (!product || quantity <= 0) return;

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + quantity
        };
        return newCart;
      } else {
        return [...prevCart, { product, quantity }];
      }
    });

    showToast(`Added ${product.name} to order`);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalOriginalPrice = cart.reduce(
    (sum, item) => sum + (item.product.compareAtPrice || item.product.price) * item.quantity,
    0
  );

  const totalSavings = Math.max(0, totalOriginalPrice - subtotal);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount,
        subtotal,
        totalSavings,
        isCartOpen,
        setIsCartOpen,
        isCustomerFormOpen,
        setIsCustomerFormOpen,
        activeProductModal,
        setActiveProductModal,
        toastMessage,
        showToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
