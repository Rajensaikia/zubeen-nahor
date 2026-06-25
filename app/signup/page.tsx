'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Leaf, User, Mail, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Signup() {
  const { signup, googleLogin } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await signup(email, username, displayName, password);
    setLoading(false);

    if (res.success) {
      router.push('/');
    } else {
      setError(res.error || 'Signup failed');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    
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

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-muted shadow-md mb-2">
            <img
              src="/images/logo.jpg"
              alt="Zubeen Nahor Logo"
              className="h-full w-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-black text-foreground">{t('nav_signup')}</h2>
          <p className="text-xs text-muted-foreground">Register to join the tree plantation tribute movement.</p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-650 p-3 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Pranab Deka"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2 pl-9 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1">Username</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="pranab_deka"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2 pl-9 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">@</span>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="pranab@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2 pl-9 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1">Password</label>
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
            <span>{loading ? 'Registering...' : t('nav_signup')}</span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-3 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Or</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        {/* Google Mock */}
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
          <span>Sign Up with Google</span>
        </button>

        {/* Redirect Link */}
        <p className="text-center text-[11px] text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-primary hover:underline">
            {t('nav_login')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
