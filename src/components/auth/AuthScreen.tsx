import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  User,
  Building2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Key,
  ShieldCheck,
  Sun,
  Moon,
  ArrowRight,
  Calendar,
  BarChart3,
  Users,
  Zap,
} from 'lucide-react';

interface AuthScreenProps {
  initialMode?: 'login' | 'signup';
  onSuccess?: (userData: { email: string; name?: string; businessName?: string }) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'login',
  onSuccess,
  theme = 'light',
  onToggleTheme,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // --- Login Form State ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- Signup Form State ---
  const [signupName, setSignupName] = useState('');
  const [signupBusinessName, setSignupBusinessName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [signupTouched, setSignupTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const switchMode = (newMode: 'login' | 'signup') => {
    if (newMode === mode || isAnimating) return;
    setIsAnimating(true);
    setLoginError('');
    setAuthSuccessMessage(null);
    setTimeout(() => {
      setMode(newMode);
      setIsAnimating(false);
    }, 300);
  };

  const handleFillDemoCredentials = () => {
    setLoginEmail('aqureshi.1020@gmail.com');
    setLoginPassword('password123');
    setLoginError('');
  };

  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isNameValid = signupName.trim().length >= 2;
  const isBusinessNameValid = signupBusinessName.trim().length >= 2;
  const isPasswordValid = signupPassword.length >= 6;
  const isConfirmPasswordValid =
    signupConfirmPassword.length > 0 && signupConfirmPassword === signupPassword;

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-transparent' };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    const hasNum = /\d/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);
    if (pass.length >= 8 && hasNum && hasSpecial) return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
    return { score: 2, label: 'Medium', color: 'bg-amber-500' };
  };
  const pwStrength = getPasswordStrength(signupPassword);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthSuccessMessage('Welcome back, Aayan!');
      setTimeout(() => onSuccess?.({ email: loginEmail, name: 'Aayan Qureshi' }), 900);
    }, 1100);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const touched = { name: true, businessName: true, email: true, password: true, confirmPassword: true };
    setSignupTouched(touched);
    if (!isNameValid || !isBusinessNameValid || !isEmailValid(signupEmail) || !isPasswordValid || !isConfirmPasswordValid || !agreedTerms) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthSuccessMessage('Account created — launching dashboard!');
      setTimeout(() => onSuccess?.({ email: signupEmail, name: signupName, businessName: signupBusinessName }), 900);
    }, 1200);
  };

  const isDark = theme === 'dark';
  const curveCls = isDark ? 'auth-nav-active auth-nav-active-dark' : 'auth-nav-active auth-nav-active-light';
  const formBg = isDark ? '#111c35' : '#f8fafc';
  const tabActiveBg = isDark ? 'bg-[#111c35]' : 'bg-[#f8fafc]';
  const textPrimary = isDark ? 'text-white' : 'text-[#274c77]';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderB = isDark ? 'border-slate-700' : 'border-slate-300';
  const inputText = isDark ? 'text-white placeholder:text-slate-500' : 'text-[#274c77] placeholder:text-slate-400';

  // Feature bullets displayed in left panel
  const features = [
    { icon: Calendar, label: 'Smart booking engine' },
    { icon: BarChart3, label: 'Real-time analytics' },
    { icon: Users, label: 'Multi-tenant support' },
    { icon: Zap, label: 'Instant deployment' },
  ];

  return (
    <div
      className={`fixed inset-0 w-full h-full flex overflow-hidden transition-colors duration-500 font-sans ${
        isDark ? 'bg-[#0b1329]' : 'bg-[#e7ecef]'
      }`}
    >
      {/* ═══════════════════ LEFT PANEL ═══════════════════ */}
      <div
        className="relative hidden md:flex flex-col justify-between overflow-hidden shrink-0 transition-all duration-500"
        style={{ width: '38%', background: 'linear-gradient(160deg, #274c77 0%, #1e3b5e 55%, #14263e 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-[#6096ba]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#a3cef1]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
        {/* Subtle diagonal pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,1) 0px, rgba(255,255,255,1) 1px, transparent 1px, transparent 40px)`,
          }}
        />

        {/* Brand Header */}
        <div className="relative z-10 px-10 pt-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/30 shadow-lg">
              <div className="w-7 h-7 rounded-full border-2 border-white/90 flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-white/30 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>
            </div>
            <span className="text-2xl text-white font-heading tracking-wide">Bookify</span>
          </div>

          <h1 className="text-4xl text-white leading-tight mb-3">
            Scheduling<br />
            <span className="text-[#a3cef1]">reimagined.</span>
          </h1>
          <p className="text-sm text-white/60 leading-relaxed max-w-xs">
            Your all-in-one SaaS booking platform. Manage appointments, services and clients — all in one place.
          </p>

          {/* Feature bullets */}
          <div className="mt-8 space-y-3">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-xs text-white/70">
                <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-[#a3cef1]" />
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── NAV TABS (sidebar-style merged cutout) ── */}
        <div className="relative z-10 px-0 pb-0 flex flex-col gap-0 mb-16">
          {/* LOGIN Tab */}
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`relative flex items-center gap-3 px-10 py-4 w-full text-left cursor-pointer transition-all duration-300 group ${
              mode === 'login'
                ? `${curveCls} ${tabActiveBg} ${textPrimary}`
                : 'text-white/60 hover:text-white'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                mode === 'login'
                  ? 'bg-[#274c77] text-white shadow-lg shadow-[#274c77]/30'
                  : 'bg-white/10 text-white/60 group-hover:bg-white/20'
              }`}
            >
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className={`text-sm font-semibold tracking-wide block ${mode === 'login' ? textPrimary : 'text-white/70'}`}>
                Sign In
              </span>
              <span className={`text-[10px] ${mode === 'login' ? textMuted : 'text-white/40'}`}>
                Access your dashboard
              </span>
            </div>
            {mode === 'login' && (
              <ArrowRight className={`w-4 h-4 ml-auto ${isDark ? 'text-slate-400' : 'text-[#6096ba]'}`} />
            )}
          </button>

          {/* SIGN UP Tab */}
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`relative flex items-center gap-3 px-10 py-4 w-full text-left cursor-pointer transition-all duration-300 group ${
              mode === 'signup'
                ? `${curveCls} ${tabActiveBg} ${textPrimary}`
                : 'text-white/60 hover:text-white'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                mode === 'signup'
                  ? 'bg-[#274c77] text-white shadow-lg shadow-[#274c77]/30'
                  : 'bg-white/10 text-white/60 group-hover:bg-white/20'
              }`}
            >
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className={`text-sm font-semibold tracking-wide block ${mode === 'signup' ? textPrimary : 'text-white/70'}`}>
                Create Account
              </span>
              <span className={`text-[10px] ${mode === 'signup' ? textMuted : 'text-white/40'}`}>
                Start your free workspace
              </span>
            </div>
            {mode === 'signup' && (
              <ArrowRight className={`w-4 h-4 ml-auto ${isDark ? 'text-slate-400' : 'text-[#6096ba]'}`} />
            )}
          </button>
        </div>

        {/* Left panel footer */}
        <div className="relative z-10 px-10 pb-8 text-[10px] text-white/30">
          © 2026 Bookify Inc. · Multi-tenant SaaS Platform
        </div>
      </div>

      {/* ═══════════════════ RIGHT PANEL ═══════════════════ */}
      <div
        className="flex-1 flex flex-col h-full overflow-y-auto"
        style={{ backgroundColor: formBg }}
      >
        {/* Top Right Controls */}
        <div className="flex items-center justify-between px-8 pt-7 pb-0 shrink-0">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-8 h-8 rounded-xl bg-[#274c77] flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-white/80 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>
            <span className={`text-sm font-semibold ${textPrimary}`}>Bookify</span>
          </div>

          <div className="hidden md:block" />

          {/* Theme Toggle */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className={`p-2 rounded-xl flex items-center gap-2 text-xs font-semibold cursor-pointer transition-all border ${
                isDark
                  ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700'
                  : 'bg-white text-[#274c77] border-slate-200 hover:bg-slate-50 shadow-xs'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
            </button>
          )}
        </div>

        {/* Mobile Mode Switcher */}
        <div className="md:hidden px-8 pt-4">
          <div className={`flex p-1 rounded-2xl border gap-1 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${mode === 'login' ? 'bg-[#274c77] text-white shadow-sm' : textMuted}`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${mode === 'signup' ? 'bg-[#274c77] text-white shadow-sm' : textMuted}`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div
          className={`flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-8 transition-all duration-300 ${
            isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
          style={{ maxWidth: 540, width: '100%', margin: '0 auto' }}
        >
          {authSuccessMessage ? (
            <div className="text-center space-y-4 py-16 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className={`text-2xl ${textPrimary}`}>{authSuccessMessage}</h2>
              <p className={`text-sm ${textMuted}`}>Opening your dashboard...</p>
              <div className="w-48 h-1.5 mx-auto rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-[#274c77] rounded-full animate-[loading_1.2s_ease-in-out_forwards]" style={{width: '100%', animation: 'loading 1.2s ease-in-out forwards'}} />
              </div>
            </div>
          ) : mode === 'login' ? (
            /* ────────────────────── LOGIN ────────────────────── */
            <div>
              <div className="mb-8">
                <h2 className={`text-3xl mb-1.5 ${textPrimary}`}>Welcome back</h2>
                <p className={`text-sm ${textMuted}`}>Sign in to your Bookify workspace.</p>
              </div>

              {/* Demo credentials box */}
              <div
                className={`mb-6 p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${
                  isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-blue-50/70 border-blue-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className={`text-[11px] font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span className="font-semibold">aqureshi.1020@gmail.com</span> / password123
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemoCredentials}
                  className={`self-start sm:self-auto text-[10px] font-semibold px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                    isDark
                      ? 'bg-slate-800 text-blue-400 border border-slate-700 hover:bg-slate-700'
                      : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 shadow-2xs'
                  }`}
                >
                  Auto-fill
                </button>
              </div>

              {loginError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-xs text-rose-600">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Email Address
                  </label>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                    isDark
                      ? 'bg-slate-900/60 border-slate-700 focus-within:border-[#6096ba]'
                      : 'bg-white border-slate-200 focus-within:border-[#274c77] shadow-xs focus-within:shadow-sm'
                  }`}>
                    <Mail className={`w-4 h-4 shrink-0 ${textMuted}`} />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="aqureshi.1020@gmail.com"
                      className={`flex-1 bg-transparent text-sm focus:outline-none ${inputText}`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Password
                    </label>
                    <a
                      href="#forgot"
                      onClick={(e) => { e.preventDefault(); alert('Demo: reset link sent!'); }}
                      className="text-[11px] font-semibold text-[#6096ba] hover:text-[#274c77] hover:underline transition-colors"
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                    isDark
                      ? 'bg-slate-900/60 border-slate-700 focus-within:border-[#6096ba]'
                      : 'bg-white border-slate-200 focus-within:border-[#274c77] shadow-xs focus-within:shadow-sm'
                  }`}>
                    <Lock className={`w-4 h-4 shrink-0 ${textMuted}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`flex-1 bg-transparent text-sm focus:outline-none ${inputText}`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className={`${textMuted} hover:text-current transition-colors`}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#274c77] hover:bg-[#1e3b5e] active:bg-[#14263e] text-white text-sm font-semibold rounded-2xl shadow-lg shadow-[#274c77]/25 hover:shadow-xl hover:shadow-[#274c77]/30 transition-all duration-200 cursor-pointer disabled:opacity-60 transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in…</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Social Divider */}
              <div className="mt-6 flex items-center gap-3">
                <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <span className={`text-[11px] font-medium ${textMuted}`}>or continue with</span>
                <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { name: 'Google', letter: 'G', color: 'text-red-500', handler: handleFillDemoCredentials },
                  { name: 'Facebook', letter: 'f', color: 'text-blue-600', handler: handleFillDemoCredentials },
                ].map(({ name, letter, color, handler }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={handler}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-2xl border text-xs font-semibold cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${
                      isDark
                        ? 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
                    }`}
                  >
                    <span className={`text-base font-black ${color}`}>{letter}</span>
                    <span>{name}</span>
                  </button>
                ))}
              </div>

              {/* Mobile switch */}
              <p className={`text-center mt-6 text-xs ${textMuted}`}>
                Don't have an account?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="text-[#274c77] font-semibold hover:underline cursor-pointer dark:text-[#6096ba]">
                  Create one
                </button>
              </p>
            </div>

          ) : (
            /* ────────────────────── SIGN UP ────────────────────── */
            <div>
              <div className="mb-8">
                <h2 className={`text-3xl mb-1.5 ${textPrimary}`}>Create workspace</h2>
                <p className={`text-sm ${textMuted}`}>Start your Bookify SaaS journey in minutes.</p>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                    signupTouched.name && !isNameValid
                      ? 'border-rose-400 bg-rose-50/40'
                      : signupName && isNameValid
                      ? isDark ? 'border-emerald-600 bg-slate-900/60' : 'border-emerald-400 bg-white'
                      : isDark ? 'bg-slate-900/60 border-slate-700 focus-within:border-[#6096ba]' : 'bg-white border-slate-200 focus-within:border-[#274c77] shadow-xs'
                  }`}>
                    <User className={`w-4 h-4 shrink-0 ${textMuted}`} />
                    <input
                      type="text"
                      value={signupName}
                      onBlur={() => setSignupTouched((p) => ({ ...p, name: true }))}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Aayan Qureshi"
                      className={`flex-1 bg-transparent text-sm focus:outline-none ${inputText}`}
                    />
                    {signupName && isNameValid && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                    {signupTouched.name && !isNameValid && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                  </div>
                  {signupTouched.name && !isNameValid && (
                    <p className="text-[10px] text-rose-500 mt-1 pl-1">Min 2 characters required</p>
                  )}
                </div>

                {/* Business Name */}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Business Name <span className="text-rose-500">*</span>
                  </label>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                    signupTouched.businessName && !isBusinessNameValid
                      ? 'border-rose-400 bg-rose-50/40'
                      : signupBusinessName && isBusinessNameValid
                      ? isDark ? 'border-emerald-600 bg-slate-900/60' : 'border-emerald-400 bg-white'
                      : isDark ? 'bg-slate-900/60 border-slate-700 focus-within:border-[#6096ba]' : 'bg-white border-slate-200 focus-within:border-[#274c77] shadow-xs'
                  }`}>
                    <Building2 className={`w-4 h-4 shrink-0 ${textMuted}`} />
                    <input
                      type="text"
                      value={signupBusinessName}
                      onBlur={() => setSignupTouched((p) => ({ ...p, businessName: true }))}
                      onChange={(e) => setSignupBusinessName(e.target.value)}
                      placeholder="Arc Company"
                      className={`flex-1 bg-transparent text-sm focus:outline-none ${inputText}`}
                    />
                    {signupBusinessName && isBusinessNameValid && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                    {signupTouched.businessName && !isBusinessNameValid && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Work Email <span className="text-rose-500">*</span>
                  </label>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                    signupTouched.email && !isEmailValid(signupEmail)
                      ? 'border-rose-400 bg-rose-50/40'
                      : signupEmail && isEmailValid(signupEmail)
                      ? isDark ? 'border-emerald-600 bg-slate-900/60' : 'border-emerald-400 bg-white'
                      : isDark ? 'bg-slate-900/60 border-slate-700 focus-within:border-[#6096ba]' : 'bg-white border-slate-200 focus-within:border-[#274c77] shadow-xs'
                  }`}>
                    <Mail className={`w-4 h-4 shrink-0 ${textMuted}`} />
                    <input
                      type="email"
                      value={signupEmail}
                      onBlur={() => setSignupTouched((p) => ({ ...p, email: true }))}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="aqureshi.1020@gmail.com"
                      className={`flex-1 bg-transparent text-sm focus:outline-none ${inputText}`}
                    />
                    {signupEmail && isEmailValid(signupEmail) && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                    {signupTouched.email && !isEmailValid(signupEmail) && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                    signupTouched.password && !isPasswordValid
                      ? 'border-rose-400 bg-rose-50/40'
                      : signupPassword && isPasswordValid
                      ? isDark ? 'border-emerald-600 bg-slate-900/60' : 'border-emerald-400 bg-white'
                      : isDark ? 'bg-slate-900/60 border-slate-700 focus-within:border-[#6096ba]' : 'bg-white border-slate-200 focus-within:border-[#274c77] shadow-xs'
                  }`}>
                    <Lock className={`w-4 h-4 shrink-0 ${textMuted}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onBlur={() => setSignupTouched((p) => ({ ...p, password: true }))}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className={`flex-1 bg-transparent text-sm focus:outline-none ${inputText}`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className={`${textMuted} transition-colors`}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength meter */}
                  {signupPassword.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1 h-1">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              pwStrength.score >= i ? pwStrength.color : isDark ? 'bg-slate-800' : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      {pwStrength.label && (
                        <p className={`text-[10px] font-semibold ${
                          pwStrength.score === 1 ? 'text-rose-500' : pwStrength.score === 2 ? 'text-amber-500' : 'text-emerald-500'
                        }`}>{pwStrength.label}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                    signupTouched.confirmPassword && !isConfirmPasswordValid
                      ? 'border-rose-400 bg-rose-50/40'
                      : signupConfirmPassword && isConfirmPasswordValid
                      ? isDark ? 'border-emerald-600 bg-slate-900/60' : 'border-emerald-400 bg-white'
                      : isDark ? 'bg-slate-900/60 border-slate-700 focus-within:border-[#6096ba]' : 'bg-white border-slate-200 focus-within:border-[#274c77] shadow-xs'
                  }`}>
                    <ShieldCheck className={`w-4 h-4 shrink-0 ${textMuted}`} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={signupConfirmPassword}
                      onBlur={() => setSignupTouched((p) => ({ ...p, confirmPassword: true }))}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className={`flex-1 bg-transparent text-sm focus:outline-none ${inputText}`}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={`${textMuted} transition-colors`}>
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {signupTouched.confirmPassword && !isConfirmPasswordValid && (
                    <p className="text-[10px] text-rose-500 mt-1 pl-1">Passwords don't match</p>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-[#274c77] cursor-pointer"
                  />
                  <label htmlFor="terms" className={`text-xs cursor-pointer leading-relaxed ${textMuted}`}>
                    I agree to the{' '}
                    <span className={`font-semibold underline ${isDark ? 'text-blue-400' : 'text-[#274c77]'}`}>Terms of Service</span>
                    {' '}and{' '}
                    <span className={`font-semibold underline ${isDark ? 'text-blue-400' : 'text-[#274c77]'}`}>Privacy Policy</span>.
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#274c77] hover:bg-[#1e3b5e] active:bg-[#14263e] text-white text-sm font-semibold rounded-2xl shadow-lg shadow-[#274c77]/25 hover:shadow-xl hover:shadow-[#274c77]/30 transition-all duration-200 cursor-pointer disabled:opacity-60 transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating workspace…</span>
                    </>
                  ) : (
                    <>
                      <span>Create SaaS Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Switch to login */}
              <p className={`text-center mt-6 text-xs ${textMuted}`}>
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('login')} className="text-[#274c77] font-semibold hover:underline cursor-pointer dark:text-[#6096ba]">
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Right panel footer */}
        <div className={`px-8 py-4 text-center text-[10px] shrink-0 ${textMuted}`}>
          Fast · Reliable · Branded Booking Engine
        </div>
      </div>
    </div>
  );
};
