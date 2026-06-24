'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AuthForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [from, setFrom] = useState('portal');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlFrom = searchParams.get('from') || 'portal';
      setFrom(urlFrom);
    }
  }, []);

  const getBackLink = () => {
    return from === 'admin' ? '/admin/login' : '/portal/login';
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please provide your email address.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    })
      .then(async (res) => {
        const data = await res.json();
        setIsLoading(false);
        if (res.ok) {
          setSuccess(data.message || 'A secure password reset link has been dispatched to your email address.');
        } else {
          setError(data.error || 'Failed to request reset link.');
        }
      })
      .catch(() => {
        setIsLoading(false);
        setError('A network error occurred. Failed to request password reset.');
      });
  };

  return (
    <div className="glass-panel rounded-3xl border border-gold-400/20 p-6 sm:p-8 shadow-2xl relative bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
      
      {/* Back to Login link */}
      <Link 
        href={getBackLink()} 
        className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground/60 hover:text-gold-500 transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Login</span>
      </Link>

      {success ? (
        /* Success Screen */
        <div className="text-center py-6 space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-500/20 shadow-inner animate-bounce-once">
            <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-bold text-foreground">
              Link Dispatched!
            </h3>
            <p className="text-xs text-foreground/60 leading-relaxed max-w-xs mx-auto">
              {success}
            </p>
            <div className="text-[10px] text-foreground/40 mt-4 leading-relaxed bg-gold-400/5 p-3 rounded-lg border border-gold-400/10">
              <strong>Local Testing Note:</strong> If no Resend API key is set, check <code className="text-gold-600 font-mono">server/scratch/email-logs.txt</code> for the reset link.
            </div>
          </div>

          <Link
            href={getBackLink()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 py-3.5 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-lg shadow-gold-600/15 hover:from-gold-500 hover:to-gold-300 transition-all cursor-pointer"
          >
            <span>Return to Login</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        /* Form Step */
        <div className="space-y-5">
          <div className="text-center mb-6">
            <h3 className="font-serif text-2xl font-bold text-foreground">
              Recover Password
            </h3>
            <p className="text-xs text-foreground/50 mt-1">
              Enter your registered email address to receive a secure recovery reset link
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 text-xs text-red-500 bg-red-500/5 p-3.5 rounded-xl border border-red-500/10">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/45">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. customer@example.com"
                  disabled={isLoading}
                  className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-900/50 pl-10 pr-4 py-3 text-xs text-foreground outline-none focus:border-gold-400 focus:bg-white dark:focus:bg-zinc-950 transition-all disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 py-3.5 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-lg shadow-gold-600/15 hover:from-gold-500 hover:to-gold-300 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
