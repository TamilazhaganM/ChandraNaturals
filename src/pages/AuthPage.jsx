import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import {
  User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle2,
  Sparkles, ArrowRight, ShieldCheck, LogOut, Package, Heart,
  Award, KeyRound, Clock, ArrowLeft, ShoppingBag
} from 'lucide-react';

export const AuthPage = () => {
  const { user, isAuthenticated, login, register, verifyOTP, resendOTP, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect target after successful authentication (e.g. /checkout)
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect') || '/shop';

  // Active view: 'login' | 'register'
  const [activeTab, setActiveTab] = useState(
    location.pathname === '/register' ? 'register' : 'login'
  );

  // OTP Verification view state
  const [otpFlow, setOtpFlow] = useState(null); // { identifier, purpose }
  const [otpCode, setOtpCode] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Forgot password flow state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetData, setResetData] = useState({ identifier: '', newPassword: '' });

  // Form states
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resend OTP Cooldown timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginData.identifier.trim()) {
      setErrorMsg('Please enter your email address or mobile number.');
      return;
    }
    if (!loginData.password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(loginData);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg(`Welcome back, ${result.user.name}!`);
      setTimeout(() => {
        navigate(redirectUrl);
      }, 700);
    } else {
      if (result.errorCode === 'ACCOUNT_NOT_VERIFIED' && result.data?.identifier) {
        setOtpFlow({ identifier: result.data.identifier, purpose: 'registration' });
        setCooldown(60);
        setErrorMsg('Please enter the 6-digit verification code sent to your account.');
      } else {
        setErrorMsg(result.message || 'Login failed. Please verify your credentials.');
      }
    }
  };

  // Handle Register submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!registerData.name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!registerData.email.trim() || !registerData.email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!registerData.phone.trim() || registerData.phone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!registerData.password || registerData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please check again.');
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      name: registerData.name,
      email: registerData.email,
      phone: registerData.phone,
      password: registerData.password
    });
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg('Account created! Please enter the 6-digit verification code sent to your mobile/email.');
      setOtpFlow({
        identifier: registerData.email,
        phone: registerData.phone,
        purpose: 'registration'
      });
      setCooldown(60);
    } else {
      setErrorMsg(result.message || 'Registration failed. Please check your information.');
    }
  };

  // Handle OTP Verification submission
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);

    if (otpFlow.purpose === 'forgot_password') {
      try {
        const res = await authAPI.resetPassword({
          identifier: otpFlow.identifier,
          otp: otpCode.trim(),
          newPassword: resetData.newPassword
        });
        setIsSubmitting(false);
        setSuccessMsg(res.message || 'Password reset successfully! You can now sign in.');
        setOtpFlow(null);
        setIsForgotPassword(false);
        setActiveTab('login');
      } catch (err) {
        setIsSubmitting(false);
        setErrorMsg(err.message || 'Invalid or expired OTP code.');
      }
      return;
    }

    const result = await verifyOTP({
      identifier: otpFlow.identifier,
      otp: otpCode.trim(),
      purpose: otpFlow.purpose
    });
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg('Account successfully verified! Redirecting...');
      setTimeout(() => {
        navigate(redirectUrl);
      }, 800);
    } else {
      setErrorMsg(result.message || 'Verification failed. Please try again.');
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    const result = await resendOTP({
      identifier: otpFlow.identifier,
      purpose: otpFlow.purpose
    });
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg('A new verification code has been dispatched!');
      setCooldown(60);
    } else {
      setErrorMsg(result.message || 'Unable to resend OTP right now.');
    }
  };

  // Handle Forgot Password Request
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!resetData.identifier.trim()) {
      setErrorMsg('Please enter your email or mobile number.');
      return;
    }
    if (!resetData.newPassword || resetData.newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authAPI.forgotPassword({ identifier: resetData.identifier });
      setIsSubmitting(false);
      setSuccessMsg('A 6-digit reset code has been sent to your registered contact.');
      setOtpFlow({ identifier: resetData.identifier, purpose: 'forgot_password' });
      setCooldown(60);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to request password reset code.');
    }
  };

  // If user is already logged in, show their account dashboard
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen pt-28 pb-24 bg-botanical-mesh">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-antique font-sans">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span className="text-cream-warm">My Account</span>
          </div>

          {/* Account Profile Card */}
          <div className="rounded-3xl bg-forest-deep border-2 border-gold-antique/40 p-6 sm:p-10 shadow-2xl space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-gold-antique/20 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gold-antique text-forest-ink font-fraunces text-2xl font-bold flex items-center justify-center shadow-gold-glow">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="space-y-1 font-sans">
                  <div className="flex items-center gap-2">
                    <h1 className="font-fraunces text-2xl sm:text-3xl font-bold text-cream-warm">
                      {user.name}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-gold-antique/15 text-gold-antique text-[10px] font-bold uppercase tracking-wider border border-gold-antique/30">
                      {user.role === 'admin' ? 'Administrator' : 'Heritage Member'}
                    </span>
                  </div>
                  <p className="text-xs text-cream-warm/75">
                    {user.role === 'admin' ? 'Store & Kitchen Admin' : 'Traditional Pantry Enthusiast'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="px-5 py-2.5 rounded-xl bg-forest-ink hover:bg-forest-moss text-red-400 border border-red-400/30 hover:border-red-400 text-xs font-semibold uppercase tracking-wider font-sans transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* User Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-xs">
              <div className="p-4 rounded-2xl bg-forest-ink/60 border border-gold-antique/20 space-y-1">
                <span className="text-cream-warm/60 uppercase tracking-widest text-[10px] block">
                  Email Address
                </span>
                <span className="font-semibold text-cream-warm text-sm break-all">
                  {user.email}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-forest-ink/60 border border-gold-antique/20 space-y-1">
                <span className="text-cream-warm/60 uppercase tracking-widest text-[10px] block">
                  Mobile Number
                </span>
                <span className="font-semibold text-cream-warm text-sm font-mono">
                  +91 {user.phone}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-forest-ink/60 border border-gold-antique/20 space-y-1">
                <span className="text-cream-warm/60 uppercase tracking-widest text-[10px] block">
                  Verification Status
                </span>
                <span className="font-semibold text-emerald-400 text-sm flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Verified
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans pt-2">
              <Link
                to="/shop"
                className="p-5 rounded-2xl bg-gold-antique hover:bg-gold-champagne text-forest-ink transition-all shadow-gold-glow flex items-center justify-between group"
              >
                <div>
                  <h3 className="font-fraunces text-lg font-bold">Browse Fresh Batches</h3>
                  <p className="text-xs text-forest-ink/80">Explore signature thokkus & A2 ghee</p>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/cart"
                className="p-5 rounded-2xl bg-forest-ink/70 hover:bg-forest-moss text-cream-warm border border-gold-antique/30 hover:border-gold-antique transition-all flex items-center justify-between group"
              >
                <div>
                  <h3 className="font-fraunces text-lg font-bold">View Shopping Basket</h3>
                  <p className="text-xs text-cream-warm/70">Check saved items and checkout</p>
                </div>
                <ShoppingBag className="w-5 h-5 text-gold-antique group-hover:scale-110 transition-transform" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // View: OTP Verification Card
  if (otpFlow) {
    return (
      <div className="min-h-screen pt-28 pb-24 bg-botanical-mesh">
        <div className="max-w-md mx-auto px-4 sm:px-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-antique/15 text-gold-antique text-xs font-semibold uppercase tracking-wider font-sans">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Two-Step Verification</span>
            </div>
            <h1 className="font-fraunces text-3xl font-bold text-cream-warm">
              Enter 6-Digit Code
            </h1>
            <p className="font-sans text-xs sm:text-sm text-cream-warm/75 max-w-sm mx-auto">
              We've dispatched a 6-digit verification code to{' '}
              <strong className="text-gold-antique">{otpFlow.identifier}</strong>
              {otpFlow.identifier.includes('@') && (
                <span className="block mt-1 text-[11px] text-cream-warm/60">
                  Please check your inbox (and promotions/spam tab).
                </span>
              )}
            </p>
          </div>

          <div className="rounded-3xl bg-forest-deep border-2 border-gold-antique/40 p-6 sm:p-8 shadow-2xl space-y-6">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-400 text-red-300 text-xs font-sans flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-400 text-emerald-300 text-xs font-sans flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div className="space-y-2 text-center">
                <label className="text-xs font-semibold text-cream-warm/85 uppercase tracking-wider block font-sans">
                  Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-center text-3xl tracking-[12px] font-mono py-3 rounded-2xl bg-forest-ink border-2 border-gold-antique/40 focus:border-gold-antique text-gold-antique focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otpCode.length !== 6}
                className="w-full py-3.5 rounded-xl bg-gold-antique hover:bg-gold-champagne text-forest-ink font-bold text-xs uppercase tracking-wider transition-all shadow-gold-glow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-cream-warm/70 font-sans pt-2 border-t border-gold-antique/20">
                <button
                  type="button"
                  onClick={() => {
                    setOtpFlow(null);
                    setErrorMsg('');
                  }}
                  className="hover:text-gold-antique flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </button>

                {cooldown > 0 ? (
                  <span className="flex items-center gap-1 text-cream-warm/50 font-mono text-[11px]">
                    <Clock className="w-3 h-3" /> Resend in {cooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-gold-antique font-semibold hover:underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // View: Forgot Password Card
  if (isForgotPassword) {
    return (
      <div className="min-h-screen pt-28 pb-24 bg-botanical-mesh">
        <div className="max-w-md mx-auto px-4 sm:px-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-antique/15 text-gold-antique text-xs font-semibold uppercase tracking-wider font-sans">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Account Recovery</span>
            </div>
            <h1 className="font-fraunces text-3xl font-bold text-cream-warm">
              Reset Password
            </h1>
            <p className="font-sans text-xs sm:text-sm text-cream-warm/75 max-w-sm mx-auto">
              Enter your registered email or mobile and choose a new secure password.
            </p>
          </div>

          <div className="rounded-3xl bg-forest-deep border-2 border-gold-antique/40 p-6 sm:p-8 shadow-2xl space-y-6">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-400 text-red-300 text-xs font-sans flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 font-sans text-xs">
              <div className="space-y-1.5">
                <label className="text-cream-warm/85 font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gold-antique" />
                  <span>Email or Mobile Number *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. priya@example.com or 9876543210"
                  value={resetData.identifier}
                  onChange={(e) => setResetData(prev => ({ ...prev, identifier: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique text-cream-warm focus:outline-none font-sans text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-cream-warm/85 font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-gold-antique" />
                  <span>New Password (Min. 6 characters) *</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={resetData.newPassword}
                  onChange={(e) => setResetData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique text-cream-warm focus:outline-none font-sans text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gold-antique hover:bg-gold-champagne text-forest-ink font-bold text-xs uppercase tracking-wider transition-all shadow-gold-glow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? <span>Sending Code...</span> : <span>Send Verification Code</span>}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setErrorMsg('');
                  }}
                  className="text-xs text-gold-antique hover:underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Standard Login / Register View
  return (
    <div className="min-h-screen pt-28 pb-24 bg-botanical-mesh">
      <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-antique font-sans justify-center">
          <Link to="/" className="hover:underline">Home</Link>
          <span>/</span>
          <span className="text-cream-warm">
            {activeTab === 'register' ? 'Register Account' : 'Customer Sign In'}
          </span>
        </div>

        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-antique/15 text-gold-antique text-xs font-semibold uppercase tracking-wider font-sans">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chandra Naturals Family Club</span>
          </div>
          <h1 className="font-fraunces text-3xl sm:text-4xl font-bold text-cream-warm">
            {activeTab === 'register' ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="font-sans text-xs sm:text-sm text-cream-warm/75 max-w-sm mx-auto">
            {activeTab === 'register'
              ? 'Join to track orders, save shipping addresses, and enjoy traditional small-batch offers.'
              : 'Sign in to access your saved details and order small-batch pantry favourites.'}
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl bg-forest-deep border-2 border-gold-antique/40 p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-forest-ink border border-gold-antique/30 font-sans text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-gold-antique text-forest-ink shadow-gold-glow'
                  : 'text-cream-warm/70 hover:text-gold-antique'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-gold-antique text-forest-ink shadow-gold-glow'
                  : 'text-cream-warm/70 hover:text-gold-antique'
              }`}
            >
              Register
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-400 text-red-300 text-xs font-sans animate-fade-in flex items-center gap-2">
              <span className="font-bold">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-400 text-emerald-300 text-xs font-sans animate-fade-in flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Tab 1: Sign In Form */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 font-sans text-xs">
              <div className="space-y-1.5">
                <label className="text-cream-warm/85 font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gold-antique" />
                  <span>Email or Mobile Number *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. priya@example.com or 9876543210"
                  value={loginData.identifier}
                  onChange={(e) => setLoginData(prev => ({ ...prev, identifier: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique text-cream-warm focus:outline-none font-sans text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-cream-warm/85 font-semibold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-gold-antique" />
                    <span>Password *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setErrorMsg('');
                    }}
                    className="text-[11px] text-gold-antique hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique text-cream-warm focus:outline-none font-sans text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-2.5 text-cream-warm/50 hover:text-gold-antique cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gold-antique hover:bg-gold-champagne text-forest-ink font-bold text-xs uppercase tracking-wider transition-all shadow-gold-glow flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-60 pt-3"
              >
                {isSubmitting ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-cream-warm/70">
                <span>Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-gold-antique font-bold hover:underline cursor-pointer"
                >
                  Register now
                </button>
              </div>
            </form>
          ) : (
            /* Tab 2: Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 font-sans text-xs">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-cream-warm/85 font-semibold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gold-antique" />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Priya Raman"
                  value={registerData.name}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique text-cream-warm focus:outline-none font-sans text-sm"
                  required
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-cream-warm/85 font-semibold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gold-antique" />
                  <span>Email Address *</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. priya@example.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique text-cream-warm focus:outline-none font-sans text-sm"
                  required
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label className="text-cream-warm/85 font-semibold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gold-antique" />
                  <span>Mobile Number *</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs text-gold-antique font-mono font-bold">+91</span>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    maxLength={10}
                    value={registerData.phone}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique text-cream-warm focus:outline-none font-sans text-sm"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-cream-warm/85 font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-gold-antique" />
                  <span>Password (Min. 6 characters) *</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a secure password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-forest-ink border border-gold-antique/30 focus:border-gold-antique text-cream-warm focus:outline-none font-sans text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-2.5 text-cream-warm/50 hover:text-gold-antique cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-cream-warm/85 font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-gold-antique" />
                  <span>Confirm Password *</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`w-full pl-4 pr-10 py-2.5 rounded-xl bg-forest-ink border ${
                      registerData.confirmPassword && registerData.confirmPassword !== registerData.password
                        ? 'border-red-400'
                        : 'border-gold-antique/30 focus:border-gold-antique'
                    } text-cream-warm focus:outline-none font-sans text-sm`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    className="absolute right-3 top-2.5 text-cream-warm/50 hover:text-gold-antique cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gold-antique hover:bg-gold-champagne text-forest-ink font-bold text-xs uppercase tracking-wider transition-all shadow-gold-glow flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-60 pt-3"
              >
                {isSubmitting ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create My Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-cream-warm/70">
                <span>Already registered? </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-gold-antique font-bold hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};

export default AuthPage;
