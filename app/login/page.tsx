'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Leaf, LogIn, Lock, Mail, Globe, AlertCircle, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const { login, googleLogin } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push('/');
    } else {
      setError(res.error || 'Invalid email or password');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    
    // Simulate picking a Google profile
    const mockProfiles = [
      { email: 'assam_greener@gmail.com', displayName: 'Jubilee Baruah', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' },
      { email: 'zubeen_da_fan@gmail.com', displayName: 'Nayan Jyoti', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200' },
      { email: 'eco_vol@gmail.com', displayName: 'Garima Deka', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
    ];
    const pickedProfile = mockProfiles[Math.floor(Math.random() * mockProfiles.length)];
    
    const res = await googleLogin(pickedProfile.email, pickedProfile.displayName, pickedProfile.avatarUrl);
    setLoading(false);

    if (res.success) {
      router.push('/');
    } else {
      setError(res.error || 'Google Sign-In failed');
    }
  };

  const handleResetPassword = () => {
    if (!email) {
      setError('Please enter your email address to reset password.');
      return;
    }
    setError('');
    setResetMessage(`A password reset link has been simulated and sent to ${email}!`);
    setTimeout(() => setResetMessage(''), 8000);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md mb-2">
            <Leaf className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-foreground">{t('nav_login')}</h2>
          <p className="text-xs text-muted-foreground">Sign in to Zubeen Nahor tree plantation social community.</p>
        </div>

        {/* Error / Reset alerts */}
        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-650 p-3 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {resetMessage && (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 text-emerald-650 p-3 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{resetMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2 pl-9 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center mb-1">
              <label className="block font-bold uppercase tracking-wider text-muted-foreground">Password</label>
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2 pl-9 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-secondary text-primary-foreground font-semibold py-2.5 text-xs shadow-md shadow-primary/10 transition-transform active:scale-95 mt-2"
          >
            <LogIn className="h-4 w-4" />
            <span>{loading ? 'Signing In...' : t('nav_login')}</span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-3 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Or</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        {/* Google Mock Login */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold py-2.5 text-xs shadow-sm"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.136 4.113-3.41 0-6.19-2.78-6.19-6.19s2.78-6.19 6.19-6.19c1.7 0 3.24.69 4.36 1.81l3.07-3.07C18.94 1.77 15.77.75 12.24.75 6.02.75 1 5.77 1 12s5.02 11.25 11.24 11.25c6.26 0 11.24-5.02 11.24-11.25 0-.74-.08-1.46-.24-2.165H12.24z"
            />
          </svg>
          <span>Sign In with Google</span>
        </button>

        {/* Redirect Link */}
        <p className="text-center text-[11px] text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="font-bold text-primary hover:underline">
            Register Now
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <path d="m9 11 3 3L22 4"/>
  </svg>
);
export { CheckCircle };
