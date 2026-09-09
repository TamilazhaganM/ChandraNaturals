import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { wishlistAPI } from '../services/api';
import { products } from '../data/products';

const WishlistContext = createContext();

const getUserWishlistKey = (user) => {
  if (user) {
    const id = user._id || user.id || user.email || user.phone;
    if (id) return `chandra_wishlist_user_${id}`;
  }
  return 'chandra_wishlist_guest';
};

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

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const currentUserId = user ? (user._id || user.id || user.email || user.phone) : null;
  const lastLoadedUserRef = useRef(currentUserId);
  const isSyncingServerRef = useRef(false);

  // Load initial wishlist from user-specific key
  const [wishlist, setWishlist] = useState(() => {
    try {
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

  /**
   * Fetch user wishlist from backend server and reconcile with local device state
   */
  const syncWishlistWithServer = async (activeUser, guestItemsToMerge = []) => {
    if (!activeUser) return;
    try {
      isSyncingServerRef.current = true;
      const res = await wishlistAPI.getWishlist();
      const serverData = res.data?.wishlist || [];

      // Format server products into frontend wishlist shape
      const serverProducts = serverData
        .map(prod => normalizeProduct(prod))
        .filter(Boolean);

      // Merge server items with any guest items that were added prior to login
      const mergedWishlist = [...serverProducts];
      for (const gItem of guestItemsToMerge) {
        if (!mergedWishlist.some(m => m.id === gItem.id || (m.slug && m.slug === gItem.id))) {
          mergedWishlist.push(gItem);
          wishlistAPI.addToWishlist(gItem.id).catch(() => {});
        }
      }

      const userKey = getUserWishlistKey(activeUser);
      localStorage.setItem(userKey, JSON.stringify(mergedWishlist));
      setWishlist(mergedWishlist);
    } catch (err) {
      console.warn('Backend wishlist sync note (using cached wishlist):', err.message);
    } finally {
      isSyncingServerRef.current = false;
    }
  };

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
        localStorage.removeItem('chandra_wishlist_guest');

        // Check if device already has cached items for this user
        const userKey = getUserWishlistKey(user);
        const userSaved = localStorage.getItem(userKey);
        const localUserItems = userSaved ? JSON.parse(userSaved) : [];

        if (localUserItems.length > 0) {
          setWishlist(localUserItems);
        }

        // Cross-device sync: fetch latest wishlist from backend server
        syncWishlistWithServer(user, guestItems);
      } else if (!currentUserId && previousUserId) {
        // Transition: User logged out
        // Reset to clean empty guest wishlist so previous user's items are never visible
        localStorage.removeItem('chandra_wishlist_guest');
        setWishlist([]);
      } else if (currentUserId && previousUserId && currentUserId !== previousUserId) {
        // Transition: Switched between two different accounts
        const userKey = getUserWishlistKey(user);
        const saved = localStorage.getItem(userKey);
        setWishlist(saved ? JSON.parse(saved) : []);
        syncWishlistWithServer(user, []);
      }
    } catch (e) {
      console.warn('Error synchronizing user wishlist:', e);
    }
  }, [currentUserId, user]);

  // Initial cloud sync if already authenticated on initial page load
  useEffect(() => {
    if (user && !isSyncingServerRef.current) {
      syncWishlistWithServer(user, []);
    }
  }, []);

  // Persist wishlist to active user's key in localStorage
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
      return [...prev, normalizeProduct(product)];
    });

    if (user) {
      wishlistAPI.addToWishlist(product.id).catch(err => {
        console.warn('Cloud wishlist sync note:', err.message);
      });
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(p => p.id !== productId));

    if (user) {
      wishlistAPI.removeFromWishlist(productId).catch(err => {
        console.warn('Cloud wishlist sync note:', err.message);
      });
    }
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
