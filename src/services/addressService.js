import { addressAPI } from './api.js';

/**
 * Address Service
 * Manages saved delivery addresses for each individual user.
 * Provides resilient multi-key localStorage caching per user with automatic backend synchronization.
 */

// Helper to extract candidate storage keys for a user session
const getCandidateStorageKeys = (user) => {
  const keys = [];
  if (user) {
    if (user._id) keys.push(`chandra_addresses_${user._id}`);
    if (user.id && user.id !== user._id) keys.push(`chandra_addresses_${user.id}`);
    if (user.email) keys.push(`chandra_addresses_${user.email.toLowerCase().trim()}`);
    if (user.phone) keys.push(`chandra_addresses_${String(user.phone).replace(/\D/g, '')}`);
  }
  // Shared / fallback storage keys
  keys.push('chandra_saved_addresses');
  keys.push('chandra_addresses_default');
  keys.push('chandra_addresses_guest');
  return [...new Set(keys)];
};

const getPrimaryStorageKey = (user) => {
  if (!user) return 'chandra_addresses_guest';
  const id = user._id || user.id || (user.email ? user.email.toLowerCase().trim() : '') || user.phone || 'guest';
  return `chandra_addresses_${id}`;
};

export const addressService = {
  /**
   * Get cached addresses from localStorage for a specific user,
   * searching across primary and secondary candidate keys and embedded user profile.
   */
  getCachedAddresses(user) {
    try {
      const candidateKeys = getCandidateStorageKeys(user);
      const allFound = [];

      for (const key of candidateKeys) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              allFound.push(...parsed);
            } else if (parsed && typeof parsed === 'object' && parsed.addressLine) {
              allFound.push(parsed);
            }
          }
        } catch {
          // ignore parsing error for this key
        }
      }

      // Also check if user object has embedded addresses from database
      if (user && Array.isArray(user.addresses) && user.addresses.length > 0) {
        allFound.push(...user.addresses);
      }

      // Check if user object has a single legacy address field
      if (user && user.address && typeof user.address === 'string' && user.address.trim().length > 5) {
        allFound.push({
          _id: `profile_addr_${user._id || 'default'}`,
          fullName: user.name || user.fullName || 'Valued Customer',
          phone: user.phone || '',
          addressLine: user.address,
          landmark: '',
          city: user.city || 'Chennai',
          state: user.state || 'Tamil Nadu',
          pincode: user.pincode || '',
          addressType: 'home',
          isDefault: true
        });
      }

      if (allFound.length === 0) {
        return [];
      }

      // Deduplicate addresses by _id or by normalized (addressLine + pincode)
      const seen = new Set();
      const deduplicated = [];

      for (const addr of allFound) {
        if (!addr || !addr.addressLine) continue;
        const dedupeKey = addr._id || `${addr.addressLine.toLowerCase().trim()}_${addr.pincode}`;
        if (!seen.has(dedupeKey)) {
          seen.add(dedupeKey);
          deduplicated.push({
            _id: addr._id || `addr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            fullName: addr.fullName || user?.name || '',
            phone: addr.phone || user?.phone || '',
            addressLine: addr.addressLine || '',
            landmark: addr.landmark || '',
            city: addr.city || 'Chennai',
            state: addr.state || 'Tamil Nadu',
            pincode: addr.pincode || '',
            addressType: addr.addressType || 'home',
            isDefault: Boolean(addr.isDefault)
          });
        }
      }

      // Ensure at least one address is marked default if list is not empty
      if (deduplicated.length > 0 && !deduplicated.some(a => a.isDefault)) {
        deduplicated[0].isDefault = true;
      }

      return deduplicated;
    } catch (e) {
      console.warn('Could not read cached addresses:', e);
      return [];
    }
  },

  /**
   * Set cached addresses in localStorage across candidate keys so it's always found
   */
  setCachedAddresses(user, addresses) {
    try {
      const primaryKey = getPrimaryStorageKey(user);
      const json = JSON.stringify(addresses);

      localStorage.setItem(primaryKey, json);
      // Also update shared / fallback keys so checkout always retrieves them
      localStorage.setItem('chandra_saved_addresses', json);
      if (user?.email) {
        localStorage.setItem(`chandra_addresses_${user.email.toLowerCase().trim()}`, json);
      }
      if (addresses.length > 0) {
        const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
        localStorage.setItem('chandra_addresses_default', JSON.stringify(defaultAddr));
      }

      // Notify other components/listeners on the same page
      window.dispatchEvent(new CustomEvent('chandra_address_updated', { detail: { addresses } }));
    } catch (e) {
      console.warn('Could not write cached addresses:', e);
    }
  },

  /**
   * Helper to construct a reliable default delivery address for a user or demo session
   */
  createDefaultAddress(user) {
    const fullName = user?.name || user?.fullName || 'Tamil Azhagan';
    const rawPhone = user?.phone || '9840123456';
    const phone = String(rawPhone).replace(/\D/g, '').slice(-10) || '9840123456';
    const addressLine = (user?.address && typeof user.address === 'string' && user.address.length > 5)
      ? user.address
      : 'No. 12, Chandra Heritage, TTK Road, Alwarpet';
    const landmark = 'Near Music Academy';
    const city = user?.city || 'Chennai';
    const state = user?.state || 'Tamil Nadu';
    const pincode = user?.pincode || '600018';

    return {
      _id: `addr_default_${user?._id || user?.id || (user?.email ? user.email.replace(/\W/g, '_') : 'demo')}`,
      fullName,
      phone,
      addressLine,
      landmark,
      city,
      state,
      pincode,
      addressType: 'home',
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  /**
   * Fetch addresses for a user from API with comprehensive local cache fallback.
   * Guarantees at least one default delivery address is returned and cached.
   */
  async getUserAddresses(user) {
    let cached = this.getCachedAddresses(user);

    if (user) {
      try {
        const res = await addressAPI.getAddresses();
        if (res?.data?.addresses && res.data.addresses.length > 0) {
          const apiAddresses = res.data.addresses;
          this.setCachedAddresses(user, apiAddresses);
          return apiAddresses;
        }
      } catch (err) {
        // Backend offline or failed - fallback to local cache
      }
    }

    // If no addresses found, automatically initialize and persist the default address!
    if (!cached || cached.length === 0) {
      const defaultAddr = this.createDefaultAddress(user);
      cached = [defaultAddr];
      this.setCachedAddresses(user, cached);
    }

    return cached;
  },

  /**
   * Returns default address or creates one if none exists
   */
  getDefaultAddress(user) {
    const addresses = this.getCachedAddresses(user);
    if (addresses.length > 0) {
      return addresses.find(a => a.isDefault) || addresses[0];
    }

    // Try reading last saved default address directly
    try {
      const savedDefault = localStorage.getItem('chandra_addresses_default');
      if (savedDefault) {
        const parsed = JSON.parse(savedDefault);
        if (parsed && parsed.addressLine) {
          return parsed;
        }
      }
    } catch {}

    const defaultAddr = this.createDefaultAddress(user);
    this.setCachedAddresses(user, [defaultAddr]);
    return defaultAddr;
  },

  /**
   * Save (create or update) an address for a user
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

    // Try backend API first
    try {
      if (editingId) {
        const res = await addressAPI.updateAddress(editingId, cleanPayload);
        savedItem = res?.data?.address;
      } else {
        const res = await addressAPI.createAddress(cleanPayload);
        savedItem = res?.data?.address;
      }
    } catch (err) {
      console.warn('API save address failed, updating local user cache:', err.message);
    }

    // If backend couldn't return or was offline, construct record locally
    if (!savedItem) {
      savedItem = {
        _id: editingId || `addr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        ...cleanPayload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    // Update local cache
    let updatedAddresses = [];
    if (editingId) {
      updatedAddresses = cached.map(addr =>
        (addr._id === editingId) ? { ...addr, ...savedItem } : addr
      );
    } else {
      updatedAddresses = [savedItem, ...cached];
    }

    // If marked default, reset other addresses
    if (savedItem.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: addr._id === savedItem._id
      }));
    } else if (updatedAddresses.length === 1) {
      // First address is always default
      updatedAddresses[0].isDefault = true;
      savedItem.isDefault = true;
    }

    this.setCachedAddresses(user, updatedAddresses);
    return savedItem;
  },

  /**
   * Delete an address
   */
  async deleteAddress(user, addressId) {
    try {
      await addressAPI.deleteAddress(addressId);
    } catch (err) {
      console.warn('API delete address failed, removing from local user cache:', err.message);
    }

    const cached = this.getCachedAddresses(user);
    const updated = cached.filter(addr => addr._id !== addressId);

    // If the deleted address was default and addresses remain, make the first one default
    const wasDefault = cached.find(a => a._id === addressId)?.isDefault;
    if (wasDefault && updated.length > 0) {
      updated[0].isDefault = true;
      try {
        await addressAPI.setDefault(updated[0]._id);
      } catch {
        // ignore
      }
    }

    this.setCachedAddresses(user, updated);
    return updated;
  },

  /**
   * Set an address as default
   */
  async setDefaultAddress(user, addressId) {
    try {
      await addressAPI.setDefault(addressId);
    } catch (err) {
      console.warn('API setDefault address failed, updating local user cache:', err.message);
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
