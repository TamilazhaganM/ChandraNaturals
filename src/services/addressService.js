import { addressAPI } from './api.js';

/**
 * Address Service
 * Manages delivery addresses with strict per-user isolation.
 * Every registered user has their own separate address book.
 */

// Generate a strictly scoped storage key per user
export const getUserAddressKey = (user) => {
  if (!user) return 'chandra_addr_guest';
  const id = user._id || user.id || (user.email ? user.email.toLowerCase().trim() : user.phone || 'guest');
  return `chandra_addr_${id}`;
};

export const addressService = {
  /**
   * Get cached addresses strictly for the active user
   */
  getCachedAddresses(user) {
    try {
      const key = getUserAddressKey(user);
      const raw = localStorage.getItem(key);
      let list = [];

      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            list = parsed;
          }
        } catch {
          list = [];
        }
      }

      // Also merge any backend-synced addresses on user object
      if (user && Array.isArray(user.addresses) && user.addresses.length > 0) {
        for (const uAddr of user.addresses) {
          if (uAddr && uAddr.addressLine && !list.some(a => a._id === uAddr._id)) {
            list.push(uAddr);
          }
        }
      }

      // Filter out any corrupt or empty entries
      const validAddresses = list.filter(
        a => a && typeof a === 'object' && a.addressLine && a.addressLine.trim().length > 0
      );

      // Ensure at least one is default if list is not empty
      if (validAddresses.length > 0 && !validAddresses.some(a => a.isDefault)) {
        validAddresses[0].isDefault = true;
      }

      return validAddresses;
    } catch (e) {
      console.warn('Could not read cached user addresses:', e);
      return [];
    }
  },

  /**
   * Set cached addresses strictly for the active user
   */
  setCachedAddresses(user, addresses) {
    try {
      const key = getUserAddressKey(user);
      localStorage.setItem(key, JSON.stringify(addresses));

      // Notify components for this user session
      window.dispatchEvent(
        new CustomEvent('chandra_address_updated', {
          detail: { userId: user?._id || user?.email || 'guest', addresses }
        })
      );
    } catch (e) {
      console.warn('Could not write cached user addresses:', e);
    }
  },

  /**
   * Fetch addresses for a user from API with local cache fallback
   */
  async getUserAddresses(user) {
    const cached = this.getCachedAddresses(user);

    if (!user) {
      return cached;
    }

    try {
      const res = await addressAPI.getAddresses();
      if (res?.data?.addresses && res.data.addresses.length > 0) {
        const apiAddresses = res.data.addresses;
        this.setCachedAddresses(user, apiAddresses);
        return apiAddresses;
      }
      return cached;
    } catch (err) {
      // Backend offline or unreachable — cleanly use local user cache
      return cached;
    }
  },

  /**
   * Get default address for active user, if one exists
   */
  getDefaultAddress(user) {
    const addresses = this.getCachedAddresses(user);
    if (addresses.length > 0) {
      return addresses.find(a => a.isDefault) || addresses[0];
    }
    return null;
  },

  /**
   * Generate clean initial form data pre-filled ONLY with active user's own profile info
   */
  getInitialAddressForm(user) {
    return {
      fullName: user?.name || user?.fullName || '',
      phone: user?.phone ? String(user.phone).replace(/\D/g, '').slice(-10) : '',
      addressLine: '',
      landmark: '',
      city: user?.city || 'Chennai',
      state: user?.state || 'Tamil Nadu',
      pincode: user?.pincode || '',
      addressType: 'home',
      isDefault: true,
      saveForFuture: true
    };
  },

  /**
   * Save (create or update) an address strictly for this user
   */
  async saveAddress(user, addressData, editingId = null) {
    const cached = this.getCachedAddresses(user);
    const cleanPayload = {
      fullName: addressData.fullName?.trim() || '',
      phone: String(addressData.phone || '').replace(/\D/g, '').slice(-10),
      addressLine: addressData.addressLine?.trim() || '',
      landmark: addressData.landmark?.trim() || '',
      city: addressData.city?.trim() || '',
      state: addressData.state?.trim() || 'Tamil Nadu',
      pincode: String(addressData.pincode || '').replace(/\D/g, '').slice(0, 6),
      addressType: addressData.addressType || 'home',
      isDefault: Boolean(addressData.isDefault)
    };

    let savedItem = null;

    // Try backend API first if online
    try {
      if (editingId) {
        const res = await addressAPI.updateAddress(editingId, cleanPayload);
        savedItem = res?.data?.address;
      } else {
        const res = await addressAPI.createAddress(cleanPayload);
        savedItem = res?.data?.address;
      }
    } catch (err) {
      // Backend offline — will persist in local user storage
    }

    if (!savedItem) {
      savedItem = {
        _id: editingId || `addr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        ...cleanPayload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    let updatedAddresses = [];
    if (editingId) {
      updatedAddresses = cached.map(addr =>
        (addr._id === editingId) ? { ...addr, ...savedItem } : addr
      );
    } else {
      updatedAddresses = [savedItem, ...cached];
    }

    // Default address logic: if marked default or first address, update flags
    if (savedItem.isDefault || updatedAddresses.length === 1) {
      savedItem.isDefault = true;
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: addr._id === savedItem._id
      }));
    }

    this.setCachedAddresses(user, updatedAddresses);
    return savedItem;
  },

  /**
   * Delete an address for active user
   */
  async deleteAddress(user, addressId) {
    try {
      await addressAPI.deleteAddress(addressId);
    } catch (err) {
      // Backend offline
    }

    const cached = this.getCachedAddresses(user);
    const updated = cached.filter(addr => addr._id !== addressId);

    const wasDefault = cached.find(a => a._id === addressId)?.isDefault;
    if (wasDefault && updated.length > 0) {
      updated[0].isDefault = true;
      try {
        await addressAPI.setDefault(updated[0]._id);
      } catch {}
    }

    this.setCachedAddresses(user, updated);
    return updated;
  },

  /**
   * Set an address as default for active user
   */
  async setDefaultAddress(user, addressId) {
    try {
      await addressAPI.setDefault(addressId);
    } catch (err) {
      // Backend offline
    }

    const cached = this.getCachedAddresses(user);
    const updated = cached.map(addr => ({
      ...addr,
      isDefault: addr._id === addressId
    }));

    this.setCachedAddresses(user, updated);
    return updated;
  }
};
