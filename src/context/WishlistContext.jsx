import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

const getUserWishlistKey = (user) => {
  if (user) {
    const id = user._id || user.id || user.email || user.phone;
    if (id) return `chandra_wishlist_user_${id}`;
  }
  return 'chandra_wishlist_guest';
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const currentUserId = user ? (user._id || user.id || user.email || user.phone) : null;
  const lastLoadedUserRef = useRef(currentUserId);

  // Load initial wishlist from user-specific key
  const [wishlist, setWishlist] = useState(() => {
    try {
      // Clear legacy global wishlist so stale items do not leak
      localStorage.removeItem('chandra_wishlist');

      const savedUser = localStorage.getItem('chandra_active_user');
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      const initialKey = getUserWishlistKey(parsedUser);
      const saved = localStorage.getItem(initialKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Synchronize wishlist when user changes (login, logout, or user switch)
  useEffect(() => {
    if (lastLoadedUserRef.current === currentUserId) {
      return;
    }

    const previousUserId = lastLoadedUserRef.current;
    lastLoadedUserRef.current = currentUserId;

    try {
      if (currentUserId && !previousUserId) {
        // Transition: Guest -> Logged-in User
        const guestSaved = localStorage.getItem('chandra_wishlist_guest');
        const guestItems = guestSaved ? JSON.parse(guestSaved) : [];

        const userKey = getUserWishlistKey(user);
        const userSaved = localStorage.getItem(userKey);
        const userItems = userSaved ? JSON.parse(userSaved) : [];

        if (guestItems.length > 0) {
          // Merge guest wishlist into user wishlist (deduped by item id)
          const mergedWishlist = [...userItems];
          guestItems.forEach(gItem => {
            if (!mergedWishlist.some(item => item.id === gItem.id)) {
              mergedWishlist.push(gItem);
            }
          });

          localStorage.setItem(userKey, JSON.stringify(mergedWishlist));
          localStorage.removeItem('chandra_wishlist_guest');
          setWishlist(mergedWishlist);
        } else {
          setWishlist(userItems);
        }
      } else if (!currentUserId && previousUserId) {
        // Transition: User logged out
        // Reset to clean empty guest wishlist so previous user's items are never visible
        localStorage.removeItem('chandra_wishlist_guest');
        setWishlist([]);
      } else if (currentUserId && previousUserId && currentUserId !== previousUserId) {
        // Transition: Switched between two different users
        const userKey = getUserWishlistKey(user);
        const saved = localStorage.getItem(userKey);
        setWishlist(saved ? JSON.parse(saved) : []);
      }
    } catch (e) {
      console.warn('Error synchronizing user wishlist:', e);
    }
  }, [currentUserId, user]);

  // Persist wishlist to active user's key
  useEffect(() => {
    if (lastLoadedUserRef.current !== currentUserId) {
      return;
    }

    try {
      const key = getUserWishlistKey(user);
      localStorage.setItem(key, JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Could not save wishlist to localStorage', e);
    }
  }, [wishlist, currentUserId, user]);

  const addToWishlist = (product) => {
    setWishlist(prev => {
      if (prev.find(p => p.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(p => p.id !== productId));
  };

  const toggleWishlist = (product) => {
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const isWishlisted = (productId) => wishlist.some(p => p.id === productId);

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isWishlisted,
        wishlistCount,
        isWishlistOpen,
        setIsWishlistOpen
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
