import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Saved active user session
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('chandra_active_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Registered user accounts database in localStorage
  const [usersList, setUsersList] = useState(() => {
    try {
      const saved = localStorage.getItem('chandra_users_db');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('chandra_active_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('chandra_active_user');
      }
    } catch (e) {
      console.warn('Could not save user session', e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('chandra_users_db', JSON.stringify(usersList));
    } catch (e) {
      console.warn('Could not save users list', e);
    }
  }, [usersList]);

  // Register function
  const register = ({ name, email, phone, password }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Check if user already exists
    const existing = usersList.find(
      u => u.email.toLowerCase() === cleanEmail || u.phone === cleanPhone
    );

    if (existing) {
      return {
        success: false,
        message: existing.email.toLowerCase() === cleanEmail
          ? 'An account with this email already exists.'
          : 'An account with this mobile number already exists.'
      };
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password,
      createdAt: new Date().toISOString()
    };

    setUsersList(prev => [...prev, newUser]);

    // Automatically log in newly registered user
    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      createdAt: newUser.createdAt
    };

    setUser(sessionUser);
    return { success: true, user: sessionUser };
  };

  // Login function
  const login = ({ identifier, password }) => {
    const cleanIdentifier = identifier.trim().toLowerCase();

    const matchedUser = usersList.find(
      u => (u.email.toLowerCase() === cleanIdentifier || u.phone === identifier.trim()) && u.password === password
    );

    if (!matchedUser) {
      // Demo login shortcut
      if (cleanIdentifier === 'demo@chandranaturals.com' && password === 'demo123') {
        const demoUser = {
          id: 'usr_demo',
          name: 'Demo Customer',
          email: 'demo@chandranaturals.com',
          phone: '9876543210',
          createdAt: new Date().toISOString()
        };
        setUser(demoUser);
        return { success: true, user: demoUser };
      }

      return {
        success: false,
        message: 'Invalid email/mobile or password. Please try again or create an account.'
      };
    }

    const sessionUser = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      phone: matchedUser.phone,
      createdAt: matchedUser.createdAt
    };

    setUser(sessionUser);
    return { success: true, user: sessionUser };
  };

  // Logout function
  const logout = () => {
    setUser(null);
  };

  // Update profile
  const updateProfile = (updatedData) => {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    setUser(updated);
    setUsersList(prev =>
      prev.map(u => (u.id === user.id ? { ...u, ...updatedData } : u))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
