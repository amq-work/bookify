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
  X,
} from 'lucide-react';
import { Button } from '../ui';

interface AuthScreenProps {
  initialMode?: 'login' | 'signup';
  onSuccess?: (userData: { email: string; name?: string; businessName?: string }) => void;
  onClose?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'login',
  onSuccess,
  onClose,
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
      }, 1000);
    }, 1200);
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
      }, 1200);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-[#e7ecef] via-[#a3cef1]/40 to-[#e7ecef] backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Decorative Floating Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#274c77]/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#6096ba]/25 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Main Glass Panel */}
      <div className="relative w-full max-w-md bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Close Button if applicable */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/40 hover:bg-white/70 text-[#274c77] transition-all cursor-pointer z-10"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Top Header / Branding */}
        <div className="px-6 pt-8 pb-4 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#274c77] text-white flex items-center justify-center shadow-lg shadow-[#274c77]/30 mb-3 border border-white/40 transform hover:scale-105 transition-transform">
            <Sparkles className="w-7 h-7 text-[#a3cef1]" />
          </div>
          <h2 className="text-2xl font-black text-[#274c77] tracking-tight font-heading">
            Bookify
          </h2>
          <p className="text-xs text-[#6096ba] font-medium mt-1">
            SaaS Booking & Scheduling Platform
          </p>

          {/* Mode Switcher Tabs */}
          <div className="mt-6 flex bg-white/40 p-1.5 rounded-2xl border border-white/60 shadow-inner">
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
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-300 shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-lg font-bold text-[#274c77]">
                {authSuccessMessage}
              </h3>
              <p className="text-xs text-[#6096ba]">Redirecting to dashboard...</p>
            </div>
          ) : mode === 'login' ? (
            /* --- LOGIN FORM --- */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Test Credentials Note Box (Explicitly requested by user) */}
              <div className="p-3.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/80 rounded-2xl space-y-2 backdrop-blur-md shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#274c77]">
                    <Key className="w-4 h-4 text-amber-500" />
                    <span>Demo Test Credentials:</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillDemoCredentials}
                    className="text-[10px] font-bold text-blue-700 bg-white/80 hover:bg-white px-2 py-0.5 rounded-lg border border-blue-200 transition-colors shadow-2xs cursor-pointer"
                  >
                    1-Click Auto-fill
                  </button>
                </div>
                <div className="text-[11px] text-slate-600 font-mono space-y-0.5 pl-5">
                  <div>
                    <span className="text-slate-400 font-sans">Email:</span>{' '}
                    <span className="font-semibold text-slate-800">aqureshi.1020@gmail.com</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans">Password:</span>{' '}
                    <span className="font-semibold text-slate-800">password123</span>
                  </div>
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#274c77] uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#6096ba]" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="aqureshi.1020@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-white/80 rounded-xl text-xs sm:text-sm text-[#274c77] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6096ba]/40 focus:border-[#274c77] transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#274c77] uppercase tracking-wider">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Password reset link sent to demo account!');
                    }}
                    className="text-[11px] font-semibold text-[#6096ba] hover:text-[#274c77] transition-colors"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#6096ba]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-white/70 border border-white/80 rounded-xl text-xs sm:text-sm text-[#274c77] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6096ba]/40 focus:border-[#274c77] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
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
                  className="w-4 h-4 rounded text-[#274c77] focus:ring-[#6096ba] border-white/80 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs font-medium text-[#274c77] cursor-pointer">
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
                <label className="block text-xs font-bold text-[#274c77] uppercase tracking-wider">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-[#6096ba]" />
                  <input
                    type="text"
                    value={signupName}
                    onBlur={() => setSignupTouched((prev) => ({ ...prev, name: true }))}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Aayan Qureshi"
                    className={`w-full pl-10 pr-9 py-2.5 bg-white/70 border rounded-xl text-xs sm:text-sm text-[#274c77] placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      signupTouched.name && !isNameValid
                        ? 'border-rose-400 focus:ring-rose-300'
                        : signupName && isNameValid
                        ? 'border-emerald-400 focus:ring-emerald-300'
                        : 'border-white/80 focus:ring-[#6096ba]/40 focus:border-[#274c77]'
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
                  <p className="text-[10px] text-rose-600 font-semibold pl-1">
                    Please enter your full name (minimum 2 characters).
                  </p>
                )}
              </div>

              {/* Business Name Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#274c77] uppercase tracking-wider">
                  Business Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-3 text-[#6096ba]" />
                  <input
                    type="text"
                    value={signupBusinessName}
                    onBlur={() => setSignupTouched((prev) => ({ ...prev, businessName: true }))}
                    onChange={(e) => setSignupBusinessName(e.target.value)}
                    placeholder="e.g. Arc Company"
                    className={`w-full pl-10 pr-9 py-2.5 bg-white/70 border rounded-xl text-xs sm:text-sm text-[#274c77] placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      signupTouched.businessName && !isBusinessNameValid
                        ? 'border-rose-400 focus:ring-rose-300'
                        : signupBusinessName && isBusinessNameValid
                        ? 'border-emerald-400 focus:ring-emerald-300'
                        : 'border-white/80 focus:ring-[#6096ba]/40 focus:border-[#274c77]'
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
                  <p className="text-[10px] text-rose-600 font-semibold pl-1">
                    Business name is required for tenant workspace.
                  </p>
                )}
              </div>

              {/* Work Email Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#274c77] uppercase tracking-wider">
                  Work Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#6096ba]" />
                  <input
                    type="email"
                    value={signupEmail}
                    onBlur={() => setSignupTouched((prev) => ({ ...prev, email: true }))}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="aqureshi.1020@gmail.com"
                    className={`w-full pl-10 pr-9 py-2.5 bg-white/70 border rounded-xl text-xs sm:text-sm text-[#274c77] placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      signupTouched.email && !isEmailValid(signupEmail)
                        ? 'border-rose-400 focus:ring-rose-300'
                        : signupEmail && isEmailValid(signupEmail)
                        ? 'border-emerald-400 focus:ring-emerald-300'
                        : 'border-white/80 focus:ring-[#6096ba]/40 focus:border-[#274c77]'
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
                  <p className="text-[10px] text-rose-600 font-semibold pl-1">
                    Please enter a valid email address.
                  </p>
                )}
              </div>

              {/* Password Input with Strength Meter */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#274c77] uppercase tracking-wider">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#6096ba]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onBlur={() => setSignupTouched((prev) => ({ ...prev, password: true }))}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className={`w-full pl-10 pr-10 py-2.5 bg-white/70 border rounded-xl text-xs sm:text-sm text-[#274c77] placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      signupTouched.password && !isPasswordValid
                        ? 'border-rose-400 focus:ring-rose-300'
                        : signupPassword && isPasswordValid
                        ? 'border-emerald-400 focus:ring-emerald-300'
                        : 'border-white/80 focus:ring-[#6096ba]/40 focus:border-[#274c77]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {signupPassword.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-500">Password strength:</span>
                      <span
                        className={
                          passwordStrength.score === 1
                            ? 'text-rose-600'
                            : passwordStrength.score === 2
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden flex gap-1">
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
                  <p className="text-[10px] text-rose-600 font-semibold pl-1">
                    Password must be at least 6 characters.
                  </p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#274c77] uppercase tracking-wider">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 absolute left-3.5 top-3 text-[#6096ba]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={signupConfirmPassword}
                    onBlur={() => setSignupTouched((prev) => ({ ...prev, confirmPassword: true }))}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className={`w-full pl-10 pr-10 py-2.5 bg-white/70 border rounded-xl text-xs sm:text-sm text-[#274c77] placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      signupTouched.confirmPassword && !isConfirmPasswordValid
                        ? 'border-rose-400 focus:ring-rose-300'
                        : signupConfirmPassword && isConfirmPasswordValid
                        ? 'border-emerald-400 focus:ring-emerald-300'
                        : 'border-white/80 focus:ring-[#6096ba]/40 focus:border-[#274c77]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {signupTouched.confirmPassword && !isConfirmPasswordValid && (
                  <p className="text-[10px] text-rose-600 font-semibold pl-1">
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
                  className="w-4 h-4 mt-0.5 rounded text-[#274c77] focus:ring-[#6096ba] border-white/80 cursor-pointer"
                />
                <label htmlFor="agreedTerms" className="text-xs text-[#274c77] cursor-pointer leading-tight">
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

          {/* Guest / Back to App Link */}
          {onClose && (
            <div className="mt-4 pt-3 border-t border-white/60 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-[#6096ba] hover:text-[#274c77] transition-colors cursor-pointer"
              >
                ← Return to Bookify App
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
