import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { cartAPI } from '../services/api';
import { products } from '../data/products';

const CartContext = createContext();

const getUserCartKey = (user) => {
  if (user) {
    const id = user._id || user.id || user.email || user.phone;
    if (id) return `chandra_cart_user_${id}`;
  }
  return 'chandra_cart_guest';
};

/**
 * Normalizes a product object against local data so images and details are guaranteed
 */
const normalizeProduct = (prod) => {
  if (!prod) return null;
  const lookupKey = prod.slug || prod.id || prod._id;
  const found = products.find(p => p.id === lookupKey || p._id === lookupKey);
  if (found) {
    return { ...found, _id: prod._id || found._id || found.id };
  }
  return {
    ...prod,
    id: prod.id || prod.slug || prod._id
  };
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const currentUserId = user ? (user._id || user.id || user.email || user.phone) : null;
  const lastLoadedUserRef = useRef(currentUserId);
  const isSyncingServerRef = useRef(false);

  // Load initial cart from user-specific key
  const [cart, setCart] = useState(() => {
    try {
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

  /**
   * Fetch user cart from backend server and reconcile with local device state
   */
  const syncCartWithServer = async (activeUser, guestItemsToMerge = []) => {
    if (!activeUser) return;
    try {
      isSyncingServerRef.current = true;
      const res = await cartAPI.getCart();
      const serverData = res.data?.items || [];

      // Format server items into frontend cart shape
      const serverItems = serverData.map(sItem => ({
        product: normalizeProduct(sItem.product),
        quantity: sItem.quantity,
        _id: sItem._id
      })).filter(item => Boolean(item.product));

      // Merge server items with any guest items that were added prior to login
      const mergedCart = [...serverItems];
      for (const gItem of guestItemsToMerge) {
        const existingIndex = mergedCart.findIndex(
          m => m.product.id === gItem.product.id || (m.product.slug && m.product.slug === gItem.product.id)
        );
        if (existingIndex > -1) {
          mergedCart[existingIndex].quantity += gItem.quantity;
          // Update quantity on server
          cartAPI.updateQuantity(gItem.product.id, mergedCart[existingIndex].quantity).catch(() => {});
        } else {
          mergedCart.push(gItem);
          // Add to server
          cartAPI.addToCart(gItem.product.id, gItem.quantity).catch(() => {});
        }
      }

      const userKey = getUserCartKey(activeUser);
      localStorage.setItem(userKey, JSON.stringify(mergedCart));
      setCart(mergedCart);
    } catch (err) {
      console.warn('Backend cart sync note (using cached cart):', err.message);
    } finally {
      isSyncingServerRef.current = false;
    }
  };

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
        const guestSaved = localStorage.getItem('chandra_cart_guest');
        const guestItems = guestSaved ? JSON.parse(guestSaved) : [];
        localStorage.removeItem('chandra_cart_guest');

        // Check if device already has cached items for this user
        const userKey = getUserCartKey(user);
        const userSaved = localStorage.getItem(userKey);
        const localUserItems = userSaved ? JSON.parse(userSaved) : [];

        if (localUserItems.length > 0) {
          setCart(localUserItems);
        }

        // Cross-device sync: fetch latest cart from backend server
        syncCartWithServer(user, guestItems);
      } else if (!currentUserId && previousUserId) {
        // Transition: User logged out
        // Reset to clean empty guest cart so previous user's items are never visible
        localStorage.removeItem('chandra_cart_guest');
        setCart([]);
      } else if (currentUserId && previousUserId && currentUserId !== previousUserId) {
        // Transition: Switched between two different accounts
        const userKey = getUserCartKey(user);
        const saved = localStorage.getItem(userKey);
        setCart(saved ? JSON.parse(saved) : []);
        syncCartWithServer(user, []);
      }
    } catch (e) {
      console.warn('Error synchronizing user cart:', e);
    }
  }, [currentUserId, user]);

  // Initial cloud sync if already authenticated on initial page load
  useEffect(() => {
    if (user && !isSyncingServerRef.current) {
      syncCartWithServer(user, []);
    }
  }, []);

  // Persist cart to active user's key in localStorage
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
        const newQty = newCart[existingIndex].quantity + quantity;
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newQty
        };
        return newCart;
      } else {
        return [...prevCart, { product: normalizeProduct(product), quantity }];
      }
    });

    // Cloud sync to server for authenticated user
    if (user) {
      cartAPI.addToCart(product.id, quantity).catch(err => {
        console.warn('Cloud cart sync note:', err.message);
      });
    }

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

    // Cloud sync to server for authenticated user
    if (user) {
      cartAPI.updateQuantity(productId, quantity).catch(err => {
        console.warn('Cloud cart sync note:', err.message);
      });
    }
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));

    // Cloud sync to server for authenticated user
    if (user) {
      cartAPI.removeFromCart(productId).catch(err => {
        console.warn('Cloud cart sync note:', err.message);
      });
    }
  };

  const clearCart = () => {
    setCart([]);

    // Cloud sync to server for authenticated user
    if (user) {
      cartAPI.clearCart().catch(err => {
        console.warn('Cloud cart sync note:', err.message);
      });
    }
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
        totalOriginalPrice,
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
