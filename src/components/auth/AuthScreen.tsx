import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Building2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Key,
  ArrowRight,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '../ui';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);

  // --- Login Form State ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');

  // --- Signup Form State ---
  const [signupName, setSignupName] = useState('');
  const [signupBusinessName, setSignupBusinessName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [signupTouched, setSignupTouched] = useState<Record<string, boolean>>({});

  // Fill test credentials helper
  const handleFillDemoCredentials = () => {
    setLoginEmail('aqureshi.1020@gmail.com');
    setLoginPassword('password123');
    setLoginError('');
  };

  // --- Signup Validations ---
  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isNameValid = signupName.trim().length >= 2;
  const isBusinessNameValid = signupBusinessName.trim().length >= 2;
  const isPasswordValid = signupPassword.length >= 6;
  const isConfirmPasswordValid =
    signupConfirmPassword.length > 0 && signupConfirmPassword === signupPassword;

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { score: 0, label: '', color: '' };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    const hasNum = /\d/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);
    if (pass.length >= 8 && hasNum && hasSpecial) {
      return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
    }
    return { score: 2, label: 'Medium', color: 'bg-amber-500' };
  };

  const passwordStrength = getPasswordStrength(signupPassword);

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
      setAuthSuccessMessage('Successfully logged in!');
      setTimeout(() => {
        if (onSuccess) {
          onSuccess({ email: loginEmail, name: 'Aayan Qureshi' });
        }
      }, 900);
    }, 1100);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupTouched({
      name: true,
      businessName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (
      !isNameValid ||
      !isBusinessNameValid ||
      !isEmailValid(signupEmail) ||
      !isPasswordValid ||
      !isConfirmPasswordValid ||
      !agreedTerms
    ) {
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthSuccessMessage('Account created successfully!');
      setTimeout(() => {
        if (onSuccess) {
          onSuccess({
            email: signupEmail,
            name: signupName,
            businessName: signupBusinessName,
          });
        }
      }, 1000);
    }, 1200);
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 transition-colors duration-300 relative overflow-hidden ${
        isDark
          ? 'bg-[#0b1329] text-slate-100'
          : 'bg-gradient-to-br from-[#e7ecef] via-[#a3cef1]/40 to-[#e7ecef] text-[#274c77]'
      }`}
    >
      {/* Decorative Floating Glowing Orbs */}
      <div
        className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none animate-pulse ${
          isDark ? 'bg-blue-600/15' : 'bg-[#274c77]/15'
        }`}
      />
      <div
        className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none animate-pulse ${
          isDark ? 'bg-indigo-500/15' : 'bg-[#6096ba]/25'
        }`}
      />

      {/* Top Header Bar for Standalone Page */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-2 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#274c77] text-white flex items-center justify-center shadow-md border border-white/20">
            <Sparkles className="w-5 h-5 text-[#a3cef1]" />
          </div>
          <span className={`text-xl font-bold tracking-tight font-heading ${isDark ? 'text-white' : 'text-[#274c77]'}`}>
            Bookify
          </span>
        </div>

        {/* Theme Toggle Button */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className={`p-2 rounded-2xl transition-all cursor-pointer border flex items-center gap-2 text-xs font-semibold shadow-xs ${
              isDark
                ? 'bg-slate-800/80 text-amber-400 border-slate-700 hover:bg-slate-700'
                : 'bg-white/80 text-[#274c77] border-white/80 hover:bg-white'
            }`}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden xs:inline text-slate-200">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#274c77]" />
                <span className="hidden xs:inline text-[#274c77]">Dark Mode</span>
              </>
            )}
          </button>
        )}
      </header>

      {/* Main Glass Panel */}
      <main className="w-full max-w-md mx-auto my-auto z-10">
        <div
          className={`w-full rounded-3xl shadow-2xl overflow-hidden border transition-all duration-300 ${
            isDark
              ? 'bg-[#131f3a]/80 backdrop-blur-2xl border-slate-700/80 shadow-slate-950/50'
              : 'bg-white/70 backdrop-blur-2xl border-white/90 shadow-xl'
          }`}
        >
          {/* Top Header / Branding */}
          <div className="px-6 pt-8 pb-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#274c77] text-white flex items-center justify-center shadow-lg shadow-[#274c77]/30 mb-3 border border-white/40">
              <Sparkles className="w-6 h-6 text-[#a3cef1]" />
            </div>
            <h2 className={`text-2xl font-black tracking-tight font-heading ${isDark ? 'text-white' : 'text-[#274c77]'}`}>
              Welcome to Bookify
            </h2>
            <p className={`text-xs font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-[#6096ba]'}`}>
              Multi-Tenant SaaS Scheduling & Booking Platform
            </p>

            {/* Mode Switcher Tabs */}
            <div
              className={`mt-6 flex p-1.5 rounded-2xl border shadow-inner ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/40 border-white/60'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setLoginError('');
                  setAuthSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#274c77] text-white shadow-md'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-[#274c77] hover:bg-white/40'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setAuthSuccessMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-[#274c77] text-white shadow-md'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-[#274c77] hover:bg-white/40'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="px-6 pb-8 pt-2">
            {authSuccessMessage ? (
              <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/40 shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#274c77]'}`}>
                  {authSuccessMessage}
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#6096ba]'}`}>
                  Launching SaaS Dashboard...
                </p>
              </div>
            ) : mode === 'login' ? (
              /* --- LOGIN FORM --- */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Test Credentials Note Box */}
                <div
                  className={`p-3.5 border rounded-2xl space-y-2 backdrop-blur-md shadow-xs ${
                    isDark
                      ? 'bg-slate-900/80 border-slate-700/80 text-slate-200'
                      : 'bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-200/80 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${isDark ? 'text-slate-200' : 'text-[#274c77]'}`}>
                      <Key className="w-4 h-4 text-amber-500" />
                      <span>Demo Test Credentials:</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleFillDemoCredentials}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-colors shadow-2xs cursor-pointer ${
                        isDark
                          ? 'bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border-blue-500/40'
                          : 'bg-white/80 hover:bg-white text-blue-700 border-blue-200'
                      }`}
                    >
                      1-Click Auto-fill
                    </button>
                  </div>
                  <div className="text-[11px] font-mono space-y-0.5 pl-5">
                    <div>
                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Email:</span>{' '}
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        aqureshi.1020@gmail.com
                      </span>
                    </div>
                    <div>
                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Password:</span>{' '}
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        password123
                      </span>
                    </div>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Email Input */}
                <div className="space-y-1">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-[#274c77]'}`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className={`w-4 h-4 absolute left-3.5 top-3 ${isDark ? 'text-slate-400' : 'text-[#6096ba]'}`} />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="aqureshi.1020@gmail.com"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all ${
                        isDark
                          ? 'bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-500 focus:ring-blue-500/40 focus:border-blue-400'
                          : 'bg-white/70 border-white/80 text-[#274c77] placeholder:text-slate-400 focus:ring-[#6096ba]/40 focus:border-[#274c77]'
                      }`}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-[#274c77]'}`}>
                      Password
                    </label>
                    <a
                      href="#forgot"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Password reset link sent to demo account!');
                      }}
                      className={`text-[11px] font-semibold transition-colors ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-[#6096ba] hover:text-[#274c77]'}`}
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className={`w-4 h-4 absolute left-3.5 top-3 ${isDark ? 'text-slate-400' : 'text-[#6096ba]'}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all ${
                        isDark
                          ? 'bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-500 focus:ring-blue-500/40 focus:border-blue-400'
                          : 'bg-white/70 border-white/80 text-[#274c77] placeholder:text-slate-400 focus:ring-[#6096ba]/40 focus:border-[#274c77]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3.5 top-3 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#274c77] focus:ring-[#6096ba] border-slate-600 cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className={`text-xs font-medium cursor-pointer ${isDark ? 'text-slate-300' : 'text-[#274c77]'}`}>
                    Keep me signed in for 30 days
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  className="w-full py-3 bg-[#274c77] hover:bg-[#1d3859] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              /* --- SIGNUP FORM WITH REALTIME INPUT VALIDATION --- */
              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                {/* Full Name Input */}
                <div className="space-y-1">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-[#274c77]'}`}>
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className={`w-4 h-4 absolute left-3.5 top-3 ${isDark ? 'text-slate-400' : 'text-[#6096ba]'}`} />
                    <input
                      type="text"
                      value={signupName}
                      onBlur={() => setSignupTouched((prev) => ({ ...prev, name: true }))}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="e.g. Aayan Qureshi"
                      className={`w-full pl-10 pr-9 py-2.5 border rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 ${
                        isDark
                          ? 'bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-500'
                          : 'bg-white/70 border-white/80 text-[#274c77] placeholder:text-slate-400'
                      } ${
                        signupTouched.name && !isNameValid
                          ? 'border-rose-400 focus:ring-rose-300'
                          : signupName && isNameValid
                          ? 'border-emerald-400 focus:ring-emerald-300'
                          : 'focus:ring-[#6096ba]/40 focus:border-[#274c77]'
                      }`}
                    />
                    {signupName && isNameValid && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-3" />
                    )}
                    {signupTouched.name && !isNameValid && (
                      <AlertCircle className="w-4 h-4 text-rose-500 absolute right-3 top-3" />
                    )}
                  </div>
                  {signupTouched.name && !isNameValid && (
                    <p className="text-[10px] text-rose-500 font-semibold pl-1">
                      Please enter your full name (minimum 2 characters).
                    </p>
                  )}
                </div>

                {/* Business Name Input */}
                <div className="space-y-1">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-[#274c77]'}`}>
                    Business Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className={`w-4 h-4 absolute left-3.5 top-3 ${isDark ? 'text-slate-400' : 'text-[#6096ba]'}`} />
                    <input
                      type="text"
                      value={signupBusinessName}
                      onBlur={() => setSignupTouched((prev) => ({ ...prev, businessName: true }))}
                      onChange={(e) => setSignupBusinessName(e.target.value)}
                      placeholder="e.g. Arc Company"
                      className={`w-full pl-10 pr-9 py-2.5 border rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 ${
                        isDark
                          ? 'bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-500'
                          : 'bg-white/70 border-white/80 text-[#274c77] placeholder:text-slate-400'
                      } ${
                        signupTouched.businessName && !isBusinessNameValid
                          ? 'border-rose-400 focus:ring-rose-300'
                          : signupBusinessName && isBusinessNameValid
                          ? 'border-emerald-400 focus:ring-emerald-300'
                          : 'focus:ring-[#6096ba]/40 focus:border-[#274c77]'
                      }`}
                    />
                    {signupBusinessName && isBusinessNameValid && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-3" />
                    )}
                    {signupTouched.businessName && !isBusinessNameValid && (
                      <AlertCircle className="w-4 h-4 text-rose-500 absolute right-3 top-3" />
                    )}
                  </div>
                  {signupTouched.businessName && !isBusinessNameValid && (
                    <p className="text-[10px] text-rose-500 font-semibold pl-1">
                      Business name is required for tenant workspace.
                    </p>
                  )}
                </div>

                {/* Work Email Input */}
                <div className="space-y-1">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-[#274c77]'}`}>
                    Work Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className={`w-4 h-4 absolute left-3.5 top-3 ${isDark ? 'text-slate-400' : 'text-[#6096ba]'}`} />
                    <input
                      type="email"
                      value={signupEmail}
                      onBlur={() => setSignupTouched((prev) => ({ ...prev, email: true }))}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="aqureshi.1020@gmail.com"
                      className={`w-full pl-10 pr-9 py-2.5 border rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 ${
                        isDark
                          ? 'bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-500'
                          : 'bg-white/70 border-white/80 text-[#274c77] placeholder:text-slate-400'
                      } ${
                        signupTouched.email && !isEmailValid(signupEmail)
                          ? 'border-rose-400 focus:ring-rose-300'
                          : signupEmail && isEmailValid(signupEmail)
                          ? 'border-emerald-400 focus:ring-emerald-300'
                          : 'focus:ring-[#6096ba]/40 focus:border-[#274c77]'
                      }`}
                    />
                    {signupEmail && isEmailValid(signupEmail) && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-3" />
                    )}
                    {signupTouched.email && !isEmailValid(signupEmail) && (
                      <AlertCircle className="w-4 h-4 text-rose-500 absolute right-3 top-3" />
                    )}
                  </div>
                  {signupTouched.email && !isEmailValid(signupEmail) && (
                    <p className="text-[10px] text-rose-500 font-semibold pl-1">
                      Please enter a valid email address.
                    </p>
                  )}
                </div>

                {/* Password Input with Strength Meter */}
                <div className="space-y-1">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-[#274c77]'}`}>
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className={`w-4 h-4 absolute left-3.5 top-3 ${isDark ? 'text-slate-400' : 'text-[#6096ba]'}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onBlur={() => setSignupTouched((prev) => ({ ...prev, password: true }))}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 ${
                        isDark
                          ? 'bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-500'
                          : 'bg-white/70 border-white/80 text-[#274c77] placeholder:text-slate-400'
                      } ${
                        signupTouched.password && !isPasswordValid
                          ? 'border-rose-400 focus:ring-rose-300'
                          : signupPassword && isPasswordValid
                          ? 'border-emerald-400 focus:ring-emerald-300'
                          : 'focus:ring-[#6096ba]/40 focus:border-[#274c77]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3.5 top-3 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {signupPassword.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Password strength:</span>
                        <span
                          className={
                            passwordStrength.score === 1
                              ? 'text-rose-500'
                              : passwordStrength.score === 2
                              ? 'text-amber-500'
                              : 'text-emerald-500'
                          }
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-700/40 rounded-full overflow-hidden flex gap-1">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'
                          } flex-1`}
                        />
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'
                          } flex-1`}
                        />
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'
                          } flex-1`}
                        />
                      </div>
                    </div>
                  )}
                  {signupTouched.password && !isPasswordValid && (
                    <p className="text-[10px] text-rose-500 font-semibold pl-1">
                      Password must be at least 6 characters.
                    </p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-1">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-[#274c77]'}`}>
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <ShieldCheck className={`w-4 h-4 absolute left-3.5 top-3 ${isDark ? 'text-slate-400' : 'text-[#6096ba]'}`} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={signupConfirmPassword}
                      onBlur={() => setSignupTouched((prev) => ({ ...prev, confirmPassword: true }))}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 ${
                        isDark
                          ? 'bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-500'
                          : 'bg-white/70 border-white/80 text-[#274c77] placeholder:text-slate-400'
                      } ${
                        signupTouched.confirmPassword && !isConfirmPasswordValid
                          ? 'border-rose-400 focus:ring-rose-300'
                          : signupConfirmPassword && isConfirmPasswordValid
                          ? 'border-emerald-400 focus:ring-emerald-300'
                          : 'focus:ring-[#6096ba]/40 focus:border-[#274c77]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-3.5 top-3 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {signupTouched.confirmPassword && !isConfirmPasswordValid && (
                    <p className="text-[10px] text-rose-500 font-semibold pl-1">
                      Passwords do not match.
                    </p>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="agreedTerms"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-[#274c77] focus:ring-[#6096ba] border-slate-600 cursor-pointer"
                  />
                  <label htmlFor="agreedTerms" className={`text-xs cursor-pointer leading-tight ${isDark ? 'text-slate-300' : 'text-[#274c77]'}`}>
                    I agree to the{' '}
                    <span className="font-bold underline">Terms of Service</span> and{' '}
                    <span className="font-bold underline">Privacy Policy</span>.
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  className="w-full py-3 bg-[#274c77] hover:bg-[#1d3859] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>Create SaaS Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto text-center py-2 text-[11px] font-medium opacity-60 z-10">
        © 2026 Bookify Inc. All rights reserved.
      </footer>
    </div>
  );
};
