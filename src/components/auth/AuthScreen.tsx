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
  ShieldCheck,
  Sun,
  Moon,
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
      }, 800);
    }, 1000);
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
      }, 900);
    }, 1100);
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 transition-colors duration-300 relative overflow-hidden font-sans ${
        isDark
          ? 'bg-[#0b1329] text-slate-100'
          : 'bg-gradient-to-br from-[#1e3b5e] via-[#274c77] to-[#14263e] text-[#274c77]'
      }`}
    >
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#6096ba]/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#274c77]/30 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Top Header Bar */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-2 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-md border border-white/30">
            <Sparkles className="w-5 h-5 text-[#a3cef1]" />
          </div>
          <span className="text-xl font-bold tracking-tight font-heading text-white">
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
                ? 'bg-slate-800/90 text-amber-400 border-slate-700 hover:bg-slate-700'
                : 'bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-md'
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
                <Moon className="w-4 h-4 text-white" />
                <span className="hidden xs:inline text-white">Dark Mode</span>
              </>
            )}
          </button>
        )}
      </header>

      {/* MAIN CARD CONTAINER (Reference Image Geometry & Layout) */}
      <main className="w-full max-w-4xl mx-auto my-auto z-10 p-2 sm:p-0">
        <div
          className={`w-full rounded-3xl shadow-2xl overflow-hidden border grid grid-cols-1 md:grid-cols-12 min-h-[520px] transition-all duration-300 ${
            isDark
              ? 'bg-[#111c35] border-slate-800 shadow-slate-950/80'
              : 'bg-white border-white/60 shadow-2xl'
          }`}
        >
          {/* ================= LEFT SIDE PANEL (GEOMETRIC SHAPES & TAB PILL CUTOUT) ================= */}
          <div className="md:col-span-5 relative bg-gradient-to-br from-[#274c77] via-[#1e3b5e] to-[#14263e] p-8 flex flex-col justify-between overflow-hidden min-h-[220px] md:min-h-full select-none">
            {/* Layered Geometric Shapes (Reference Image Diagonal Pattern) */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <div className="absolute -top-16 -left-16 w-80 h-80 bg-[#6096ba]/30 rotate-45 transform origin-bottom-right rounded-3xl" />
              <div className="absolute top-24 -left-20 w-72 h-72 bg-[#a3cef1]/20 -rotate-12 transform rounded-3xl" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#274c77]/40 rotate-12 transform rounded-3xl" />
            </div>

            {/* Left Top Brand Section */}
            <div className="relative z-10 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-md">
                <Sparkles className="w-6 h-6 text-[#a3cef1]" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight font-heading">
                Bookify SaaS
              </h2>
              <p className="text-xs text-[#a3cef1] font-medium leading-relaxed max-w-xs">
                Smart multi-tenant scheduling & booking platform.
              </p>
            </div>

            {/* OVERLAPPING TAB CONTROLS (Reference Image Style) */}
            <div className="relative z-20 my-6 md:my-auto space-y-4 text-center md:text-left">
              {mode === 'login' ? (
                <div className="flex flex-col items-center md:items-start gap-4">
                  {/* Active LOGIN Pill Tab extending to right */}
                  <div className="relative inline-flex items-center">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setLoginError('');
                      }}
                      className="px-8 py-3 bg-white text-[#274c77] font-black text-xs uppercase tracking-widest rounded-full md:rounded-r-full md:rounded-l-full shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
                    >
                      LOGIN
                    </button>
                  </div>
                  {/* Inactive SIGN IN / REGISTER text */}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setAuthSuccessMessage(null);
                    }}
                    className="text-xs font-bold text-white/70 hover:text-white uppercase tracking-wider transition-colors cursor-pointer pl-3"
                  >
                    SIGN UP
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center md:items-start gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setLoginError('');
                    }}
                    className="text-xs font-bold text-white/70 hover:text-white uppercase tracking-wider transition-colors cursor-pointer pl-3"
                  >
                    LOGIN
                  </button>
                  {/* Active SIGN UP Pill Tab */}
                  <div className="relative inline-flex items-center">
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="px-8 py-3 bg-white text-[#274c77] font-black text-xs uppercase tracking-widest rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105"
                    >
                      SIGN UP
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Left Bottom Footer */}
            <div className="relative z-10 text-[10px] text-[#a3cef1]/80 font-medium hidden md:block">
              Fast • Reliable • Branded Booking Engine
            </div>
          </div>

          {/* ================= RIGHT SIDE FORM CONTAINER (Reference Image Design) ================= */}
          <div
            className={`md:col-span-7 p-6 sm:p-10 flex flex-col justify-between ${
              isDark ? 'bg-[#111c35] text-slate-100' : 'bg-white text-[#274c77]'
            }`}
          >
            <div>
              {/* TOP CIRCLE AVATAR ICON (Reference Image Style) */}
              <div className="text-center space-y-2 mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-tr from-[#274c77] via-[#1e3b5e] to-[#6096ba] text-white flex items-center justify-center shadow-xl border-4 border-white/30 dark:border-slate-800 transform hover:scale-105 transition-transform">
                  <User className="w-8 h-8 sm:w-10 sm:h-10 text-[#a3cef1]" />
                </div>
                <h3
                  className={`text-xl font-black uppercase tracking-widest font-heading ${
                    isDark ? 'text-white' : 'text-[#274c77]'
                  }`}
                >
                  {mode === 'login' ? 'LOGIN' : 'SIGN UP'}
                </h3>
              </div>

              {authSuccessMessage ? (
                <div className="py-12 text-center space-y-3 animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/40 shadow-inner">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#274c77]'}`}>
                    {authSuccessMessage}
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#6096ba]'}`}>
                    Opening SaaS Dashboard...
                  </p>
                </div>
              ) : mode === 'login' ? (
                /* --- LOGIN FORM (Underlined Minimalist Style) --- */
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  {/* Test Credentials Box */}
                  <div
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs backdrop-blur-md ${
                      isDark
                        ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                        : 'bg-blue-50/80 border-blue-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-500 shrink-0" />
                      <div className="text-[11px] font-mono">
                        <span className="font-semibold">aqureshi.1020@gmail.com</span> / password123
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleFillDemoCredentials}
                      className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-800 hover:opacity-90 px-2 py-1 rounded-lg border border-blue-200 dark:border-slate-700 shadow-2xs cursor-pointer shrink-0"
                    >
                      Fill Demo
                    </button>
                  </div>

                  {loginError && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {/* Underlined Email Field */}
                  <div className="space-y-1">
                    <div className="relative border-b border-slate-300 dark:border-slate-700 focus-within:border-[#274c77] dark:focus-within:border-[#6096ba] transition-colors py-1">
                      <User className={`w-5 h-5 absolute left-0 top-2.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="Email"
                        className={`w-full pl-8 pr-4 py-2 bg-transparent text-xs sm:text-sm font-medium focus:outline-none placeholder:text-slate-400 ${
                          isDark ? 'text-white' : 'text-[#274c77]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Underlined Password Field */}
                  <div className="space-y-1">
                    <div className="relative border-b border-slate-300 dark:border-slate-700 focus-within:border-[#274c77] dark:focus-within:border-[#6096ba] transition-colors py-1">
                      <Lock className={`w-5 h-5 absolute left-0 top-2.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Password"
                        className={`w-full pl-8 pr-10 py-2 bg-transparent text-xs sm:text-sm font-medium focus:outline-none placeholder:text-slate-400 ${
                          isDark ? 'text-white' : 'text-[#274c77]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-1 top-2.5 ${
                          isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Action Row: Forgot Password & Pill Submit Button (Reference Image) */}
                  <div className="flex items-center justify-between pt-2">
                    <a
                      href="#forgot"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Password reset link sent to demo email!');
                      }}
                      className="text-xs font-semibold text-[#6096ba] hover:underline"
                    >
                      Forgot Password?
                    </a>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-8 py-2.5 bg-[#274c77] hover:bg-[#1e3b5e] text-white font-black text-xs uppercase tracking-widest rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 disabled:opacity-50"
                    >
                      {isLoading ? 'LOGIN...' : 'LOGIN'}
                    </button>
                  </div>
                </form>
              ) : (
                /* --- SIGNUP FORM (Underlined Minimalist Style with Validation) --- */
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  {/* Underlined Full Name Field */}
                  <div className="relative border-b border-slate-300 dark:border-slate-700 focus-within:border-[#274c77] transition-colors py-1">
                    <User className={`w-4 h-4 absolute left-0 top-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    <input
                      type="text"
                      value={signupName}
                      onBlur={() => setSignupTouched((prev) => ({ ...prev, name: true }))}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Full Name"
                      className={`w-full pl-7 pr-8 py-2 bg-transparent text-xs sm:text-sm font-medium focus:outline-none placeholder:text-slate-400 ${
                        isDark ? 'text-white' : 'text-[#274c77]'
                      }`}
                    />
                    {signupName && isNameValid && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-1 top-3" />
                    )}
                    {signupTouched.name && !isNameValid && (
                      <AlertCircle className="w-4 h-4 text-rose-500 absolute right-1 top-3" />
                    )}
                  </div>

                  {/* Underlined Business Name Field */}
                  <div className="relative border-b border-slate-300 dark:border-slate-700 focus-within:border-[#274c77] transition-colors py-1">
                    <Building2 className={`w-4 h-4 absolute left-0 top-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    <input
                      type="text"
                      value={signupBusinessName}
                      onBlur={() => setSignupTouched((prev) => ({ ...prev, businessName: true }))}
                      onChange={(e) => setSignupBusinessName(e.target.value)}
                      placeholder="Business Name"
                      className={`w-full pl-7 pr-8 py-2 bg-transparent text-xs sm:text-sm font-medium focus:outline-none placeholder:text-slate-400 ${
                        isDark ? 'text-white' : 'text-[#274c77]'
                      }`}
                    />
                    {signupBusinessName && isBusinessNameValid && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-1 top-3" />
                    )}
                    {signupTouched.businessName && !isBusinessNameValid && (
                      <AlertCircle className="w-4 h-4 text-rose-500 absolute right-1 top-3" />
                    )}
                  </div>

                  {/* Underlined Email Field */}
                  <div className="relative border-b border-slate-300 dark:border-slate-700 focus-within:border-[#274c77] transition-colors py-1">
                    <Mail className={`w-4 h-4 absolute left-0 top-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    <input
                      type="email"
                      value={signupEmail}
                      onBlur={() => setSignupTouched((prev) => ({ ...prev, email: true }))}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="Email Address"
                      className={`w-full pl-7 pr-8 py-2 bg-transparent text-xs sm:text-sm font-medium focus:outline-none placeholder:text-slate-400 ${
                        isDark ? 'text-white' : 'text-[#274c77]'
                      }`}
                    />
                    {signupEmail && isEmailValid(signupEmail) && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-1 top-3" />
                    )}
                    {signupTouched.email && !isEmailValid(signupEmail) && (
                      <AlertCircle className="w-4 h-4 text-rose-500 absolute right-1 top-3" />
                    )}
                  </div>

                  {/* Underlined Password Field */}
                  <div className="relative border-b border-slate-300 dark:border-slate-700 focus-within:border-[#274c77] transition-colors py-1">
                    <Lock className={`w-4 h-4 absolute left-0 top-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onBlur={() => setSignupTouched((prev) => ({ ...prev, password: true }))}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Password (min 6 characters)"
                      className={`w-full pl-7 pr-10 py-2 bg-transparent text-xs sm:text-sm font-medium focus:outline-none placeholder:text-slate-400 ${
                        isDark ? 'text-white' : 'text-[#274c77]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Underlined Confirm Password Field */}
                  <div className="relative border-b border-slate-300 dark:border-slate-700 focus-within:border-[#274c77] transition-colors py-1">
                    <ShieldCheck className={`w-4 h-4 absolute left-0 top-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={signupConfirmPassword}
                      onBlur={() => setSignupTouched((prev) => ({ ...prev, confirmPassword: true }))}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className={`w-full pl-7 pr-10 py-2 bg-transparent text-xs sm:text-sm font-medium focus:outline-none placeholder:text-slate-400 ${
                        isDark ? 'text-white' : 'text-[#274c77]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-1 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Submit Button Row */}
                  <div className="flex items-center justify-between pt-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="w-4 h-4 text-[#274c77] rounded cursor-pointer"
                      />
                      <label htmlFor="terms" className="text-[11px] text-slate-500 cursor-pointer">
                        I agree to Terms
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-8 py-2.5 bg-[#274c77] hover:bg-[#1e3b5e] text-white font-black text-xs uppercase tracking-widest rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 disabled:opacity-50"
                    >
                      {isLoading ? 'CREATING...' : 'SIGN UP'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ================= BOTTOM SOCIAL LOGIN BAR (Reference Image Style) ================= */}
            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-[11px]">Or Login With</span>

              <div className="flex items-center gap-3">
                {/* Google Button */}
                <button
                  type="button"
                  onClick={handleFillDemoCredentials}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] shadow-2xs transition-all cursor-pointer"
                >
                  <span className="text-red-500 font-black">G</span>
                  <span>Google</span>
                </button>

                {/* Facebook Button */}
                <button
                  type="button"
                  onClick={handleFillDemoCredentials}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] shadow-2xs transition-all cursor-pointer"
                >
                  <span className="text-blue-600 font-black">f</span>
                  <span>Facebook</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto text-center py-2 text-[11px] font-medium text-white/60 z-10">
        © 2026 Bookify Inc. All rights reserved.
      </footer>
    </div>
  );
};
