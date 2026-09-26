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

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Signup form
  const [signupName, setSignupName] = useState('');
  const [signupBusinessName, setSignupBusinessName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [signupTouched, setSignupTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [mode]);

  const switchMode = (newMode: 'login' | 'signup') => {
    if (newMode === mode || isAnimating) return;
    setIsAnimating(true);
    setLoginError('');
    setAuthSuccessMessage(null);
    setTimeout(() => {
      setMode(newMode);
      setIsAnimating(false);
    }, 280);
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
  const isConfirmPasswordValid = signupConfirmPassword.length > 0 && signupConfirmPassword === signupPassword;

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
    setSignupTouched({ name: true, businessName: true, email: true, password: true, confirmPassword: true });
    if (!isNameValid || !isBusinessNameValid || !isEmailValid(signupEmail) || !isPasswordValid || !isConfirmPasswordValid || !agreedTerms) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthSuccessMessage('Workspace created — launching dashboard!');
      setTimeout(() => onSuccess?.({ email: signupEmail, name: signupName, businessName: signupBusinessName }), 900);
    }, 1200);
  };

  const isDark = theme === 'dark';
  // Colour tokens
  const rpBg       = isDark ? '#111c35' : '#f8fafc';    // right-panel background
  const textMain   = isDark ? 'text-white' : 'text-[#274c77]';
  const textSub    = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputBase  = isDark
    ? 'bg-slate-900/60 border-slate-700 focus-within:border-[#6096ba]'
    : 'bg-white border-slate-200 focus-within:border-[#274c77] shadow-xs focus-within:shadow-sm';
  const inputText  = isDark ? 'text-white placeholder:text-slate-500' : 'text-[#274c77] placeholder:text-slate-400';

  // Active-tab CSS classes  (defined in index.css)
  const tabActiveCls = `auth-tab-active ${isDark ? 'auth-tab-active-dark' : 'auth-tab-active-light'}`;

  return (
    <div
      className={`fixed inset-0 w-full h-full flex overflow-hidden font-sans transition-colors duration-500 ${
        isDark ? 'bg-[#0b1329]' : 'bg-[#e7ecef]'
      }`}
    >
      {/* ═══════════════════════════════════════════
          LEFT PANEL — brand + merged tab buttons
          ═══════════════════════════════════════════ */}
      <div
        className="relative hidden md:flex flex-col justify-between overflow-visible shrink-0 transition-all duration-500"
        style={{
          width: '36%',
          background: 'linear-gradient(160deg, #274c77 0%, #1e3b5e 55%, #14263e 100%)',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#6096ba]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#a3cef1]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        {/* Subtle diagonal stripe texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,1) 0px, rgba(255,255,255,1) 1px, transparent 1px, transparent 36px)`,
          }}
        />

        {/* ── Brand header ── */}
        <div className="relative z-10 px-10 pt-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/30 shadow-lg shrink-0">
              <div className="w-7 h-7 rounded-full border-2 border-white/90 flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-white/30 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>
            </div>
            <span className="text-2xl text-white font-heading tracking-wide">Bookify</span>
          </div>

          <h1 className="text-[2.4rem] leading-[1.15] text-white mb-3">
            Scheduling<br />
            <span className="text-[#a3cef1]">reimagined.</span>
          </h1>
          <p className="text-sm text-white/55 leading-relaxed max-w-xs">
            Your all-in-one SaaS booking platform. Manage appointments, services and clients — all in one place.
          </p>
        </div>

        {/* ════════════════════════════════════════════
            TAB NAV  —  sidebar-style merged cutout
            Each button is FULL-WIDTH (no right padding)
            so its right edge sits exactly at the panel
            boundary, letting the ::before/::after curves
            appear correctly against the panel gradient.
            ════════════════════════════════════════════ */}
        <div className="relative z-10 flex flex-col gap-1 mb-20 pr-0">
          {/* ── Sign In Tab ── */}
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={[
              'relative flex items-center gap-3 w-full pl-10 pr-6 py-5 cursor-pointer',
              'transition-all duration-300 ease-in-out group',
              mode === 'login'
                ? `${tabActiveCls} ${textMain}`
                : 'text-white/55 hover:text-white/90',
            ].join(' ')}
            style={mode === 'login' ? { backgroundColor: rpBg } : {}}
          >
            {/* Icon pill */}
            <div
              className={[
                'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300',
                mode === 'login'
                  ? 'bg-[#274c77] text-white shadow-lg shadow-[#274c77]/30'
                  : 'bg-white/10 text-white/55 group-hover:bg-white/20',
              ].join(' ')}
            >
              <User className="w-4 h-4" />
            </div>

            <div className="text-left">
              <span className={`text-sm font-semibold block tracking-wide ${mode === 'login' ? textMain : 'text-white/70 group-hover:text-white/90'}`}>
                Sign In
              </span>
              <span className={`text-[10px] ${mode === 'login' ? textSub : 'text-white/35'}`}>
                Access your dashboard
              </span>
            </div>

            {mode === 'login' && (
              <ArrowRight className={`w-4 h-4 ml-auto ${isDark ? 'text-slate-500' : 'text-[#6096ba]'}`} />
            )}
          </button>

          {/* ── Create Account Tab ── */}
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={[
              'relative flex items-center gap-3 w-full pl-10 pr-6 py-5 cursor-pointer',
              'transition-all duration-300 ease-in-out group',
              mode === 'signup'
                ? `${tabActiveCls} ${textMain}`
                : 'text-white/55 hover:text-white/90',
            ].join(' ')}
            style={mode === 'signup' ? { backgroundColor: rpBg } : {}}
          >
            <div
              className={[
                'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300',
                mode === 'signup'
                  ? 'bg-[#274c77] text-white shadow-lg shadow-[#274c77]/30'
                  : 'bg-white/10 text-white/55 group-hover:bg-white/20',
              ].join(' ')}
            >
              <Building2 className="w-4 h-4" />
            </div>

            <div className="text-left">
              <span className={`text-sm font-semibold block tracking-wide ${mode === 'signup' ? textMain : 'text-white/70 group-hover:text-white/90'}`}>
                Create Account
              </span>
              <span className={`text-[10px] ${mode === 'signup' ? textSub : 'text-white/35'}`}>
                Start your free workspace
              </span>
            </div>

            {mode === 'signup' && (
              <ArrowRight className={`w-4 h-4 ml-auto ${isDark ? 'text-slate-500' : 'text-[#6096ba]'}`} />
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="relative z-10 px-10 pb-8 text-[10px] text-white/25">
          © 2026 Bookify Inc. · Multi-tenant SaaS Platform
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          RIGHT PANEL — form area
          ═══════════════════════════════════════════ */}
      <div
        className="flex-1 flex flex-col h-full overflow-y-auto"
        style={{ backgroundColor: rpBg }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 pt-7 shrink-0">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-8 h-8 rounded-xl bg-[#274c77] flex items-center justify-center">
              <div className="w-5 h-5 rounded-full border-2 border-white/80 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>
            <span className={`text-sm font-semibold ${textMain}`}>Bookify</span>
          </div>
          <div className="hidden md:block" />

          {/* Theme toggle */}
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

        {/* Mobile tab switcher */}
        <div className="md:hidden px-8 pt-4">
          <div className={`flex p-1 rounded-2xl border gap-1 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  mode === m ? 'bg-[#274c77] text-white shadow-sm' : textSub
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Form Content ── */}
        <div
          className={`flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-8 transition-all duration-280 ${
            isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
          style={{ maxWidth: 520, width: '100%', margin: '0 auto' }}
        >
          {/* Success state */}
          {authSuccessMessage ? (
            <div className="text-center space-y-5 py-16">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className={`text-2xl ${textMain}`}>{authSuccessMessage}</h2>
              <p className={`text-sm ${textSub}`}>Opening your dashboard…</p>
              <div className={`w-48 h-1.5 mx-auto rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div
                  className="h-full bg-[#274c77] rounded-full"
                  style={{ animation: 'loading-bar 1.2s ease-in-out forwards' }}
                />
              </div>
            </div>

          ) : mode === 'login' ? (
            /* ─────────────── LOGIN FORM ─────────────── */
            <div>
              <div className="mb-8">
                <h2 className={`text-3xl mb-1.5 ${textMain}`}>Welcome back</h2>
                <p className={`text-sm ${textSub}`}>Sign in to your Bookify workspace.</p>
              </div>

              {/* Demo credentials hint */}
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
                  <label className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${textSub}`}>
                    Email Address
                  </label>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${inputBase}`}>
                    <Mail className={`w-4 h-4 shrink-0 ${textSub}`} />
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
                    <label className={`text-xs font-semibold uppercase tracking-wider ${textSub}`}>Password</label>
                    <button
                      type="button"
                      onClick={() => alert('Demo: reset email sent!')}
                      className="text-[11px] font-semibold text-[#6096ba] hover:text-[#274c77] hover:underline transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${inputBase}`}>
                    <Lock className={`w-4 h-4 shrink-0 ${textSub}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`flex-1 bg-transparent text-sm focus:outline-none ${inputText}`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className={`${textSub} hover:text-current transition-colors cursor-pointer`}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#274c77] hover:bg-[#1e3b5e] active:bg-[#14263e] text-white text-sm font-semibold rounded-2xl shadow-lg shadow-[#274c77]/25 hover:shadow-xl hover:shadow-[#274c77]/30 transition-all duration-200 cursor-pointer disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Signing in…</span></>
                  ) : (
                    <><span>Sign In to Dashboard</span><ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              {/* Social row */}
              <div className="mt-6 flex items-center gap-3">
                <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <span className={`text-[11px] font-medium ${textSub}`}>or continue with</span>
                <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {[{ name: 'Google', letter: 'G', color: 'text-red-500' }, { name: 'Facebook', letter: 'f', color: 'text-blue-600' }].map(({ name, letter, color }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={handleFillDemoCredentials}
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

              <p className={`text-center mt-6 text-xs ${textSub}`}>
                Don't have an account?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="text-[#274c77] font-semibold hover:underline cursor-pointer">
                  Create one
                </button>
              </p>
            </div>

          ) : (
            /* ─────────────── SIGN UP FORM ─────────────── */
            <div>
              <div className="mb-7">
                <h2 className={`text-3xl mb-1.5 ${textMain}`}>Create workspace</h2>
                <p className={`text-sm ${textSub}`}>Start your Bookify SaaS journey in minutes.</p>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                {/* Full Name */}
                <Field label="Full Name" required error={signupTouched.name && !isNameValid ? 'Min 2 characters required' : ''}>
                  <InputRow
                    icon={<User className="w-4 h-4 shrink-0" />}
                    valid={signupName ? isNameValid : undefined}
                    touched={signupTouched.name}
                    inputBase={inputBase}
                  >
                    <input
                      type="text"
                      value={signupName}
                      onBlur={() => setSignupTouched((p) => ({ ...p, name: true }))}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Aayan Qureshi"
                      className={`flex-1 bg-transparent text-sm focus:outline-none ${inputText}`}
                    />
                  </InputRow>
                </Field>

                {/* Business Name */}
                <Field label="Business Name" required error={signupTouched.businessName && !isBusinessNameValid ? 'Min 2 characters required' : ''}>
                  <InputRow
                    icon={<Building2 className="w-4 h-4 shrink-0" />}
                    valid={signupBusinessName ? isBusinessNameValid : undefined}
                    touched={signupTouched.businessName}
                    inputBase={inputBase}
                  >
                    <input
                      type="text"
                      value={signupBusinessName}
                      onBlur={() => setSignupTouched((p) => ({ ...p, businessName: true }))}
                      onChange={(e) => setSignupBusinessName(e.target.value)}
                      placeholder="Arc Company"
                      className={`flex-1 bg-transparent text-sm focus:outline-none ${inputText}`}
                    />
                  </InputRow>
                </Field>

                {/* Email */}
                <Field label="Work Email" required error={signupTouched.email && !isEmailValid(signupEmail) ? 'Invalid email address' : ''}>
                  <InputRow
                    icon={<Mail className="w-4 h-4 shrink-0" />}
                    valid={signupEmail ? isEmailValid(signupEmail) : undefined}
                    touched={signupTouched.email}
                    inputBase={inputBase}
                  >
                    <input
                      type="email"
                      value={signupEmail}
                      onBlur={() => setSignupTouched((p) => ({ ...p, email: true }))}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="aqureshi.1020@gmail.com"
                      className={`flex-1 bg-transparent text-sm focus:outline-none ${inputText}`}
                    />
                  </InputRow>
                </Field>

                {/* Password */}
                <Field label="Password" required error={signupTouched.password && !isPasswordValid ? 'Min 6 characters' : ''}>
                  <InputRow
                    icon={<Lock className="w-4 h-4 shrink-0" />}
                    valid={signupPassword ? isPasswordValid : undefined}
                    touched={signupTouched.password}
                    inputBase={inputBase}
                    suffix={
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className={`${textSub} transition-colors cursor-pointer`}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  >
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onBlur={() => setSignupTouched((p) => ({ ...p, password: true }))}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className={`flex-1 bg-transparent text-sm focus:outline-none ${inputText}`}
                    />
                  </InputRow>
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
                </Field>

                {/* Confirm Password */}
                <Field label="Confirm Password" required error={signupTouched.confirmPassword && !isConfirmPasswordValid ? "Passwords don't match" : ''}>
                  <InputRow
                    icon={<ShieldCheck className="w-4 h-4 shrink-0" />}
                    valid={signupConfirmPassword ? isConfirmPasswordValid : undefined}
                    touched={signupTouched.confirmPassword}
                    inputBase={inputBase}
                    suffix={
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={`${textSub} transition-colors cursor-pointer`}>
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  >
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={signupConfirmPassword}
                      onBlur={() => setSignupTouched((p) => ({ ...p, confirmPassword: true }))}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className={`flex-1 bg-transparent text-sm focus:outline-none ${inputText}`}
                    />
                  </InputRow>
                </Field>

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-[#274c77] cursor-pointer accent-[#274c77]"
                  />
                  <label htmlFor="terms" className={`text-xs cursor-pointer leading-relaxed ${textSub}`}>
                    I agree to the{' '}
                    <span className="font-semibold underline text-[#274c77]">Terms of Service</span>
                    {' '}and{' '}
                    <span className="font-semibold underline text-[#274c77]">Privacy Policy</span>.
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#274c77] hover:bg-[#1e3b5e] active:bg-[#14263e] text-white text-sm font-semibold rounded-2xl shadow-lg shadow-[#274c77]/25 hover:shadow-xl hover:shadow-[#274c77]/30 transition-all duration-200 cursor-pointer disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Creating workspace…</span></>
                  ) : (
                    <><span>Create SaaS Account</span><ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <p className={`text-center mt-5 text-xs ${textSub}`}>
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('login')} className="text-[#274c77] font-semibold hover:underline cursor-pointer">
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Right panel footer */}
        <div className={`px-8 py-4 text-center text-[10px] shrink-0 ${textSub}`}>
          Fast · Reliable · Branded Booking Engine
        </div>
      </div>
    </div>
  );
};

/* ─── Small reusable sub-components ─── */

const Field: React.FC<{ label: string; required?: boolean; error?: string | false; children: React.ReactNode }> = ({
  label, required, error, children,
}) => (
  <div>
    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider text-slate-500">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
    {error && <p className="text-[10px] text-rose-500 mt-1 pl-1">{error}</p>}
  </div>
);

const InputRow: React.FC<{
  icon: React.ReactNode;
  valid?: boolean;
  touched?: boolean;
  inputBase: string;
  suffix?: React.ReactNode;
  children: React.ReactNode;
}> = ({ icon, valid, touched, inputBase, suffix, children }) => {
  const borderOverride =
    touched && valid === false
      ? 'border-rose-400 bg-rose-50/40'
      : valid === true
      ? 'border-emerald-400'
      : '';

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${inputBase} ${borderOverride}`}>
      <span className="text-slate-400">{icon}</span>
      {children}
      {valid === true && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      {touched && valid === false && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
      {suffix}
    </div>
  );
};
