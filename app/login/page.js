'use client';

import { useState } from 'react';
import { Eye, EyeOff, Loader2, Shield, MapPin, Navigation, Info, ArrowLeft, ArrowRight, UserPlus, LogIn, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/src/lib/supabaseClient';
import { login, signup } from '@/src/services/auth';

export default function LoginPage() {
  const [authState, setAuthState] = useState('selection'); // 'selection', 'login', 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  
  const supabase = createClient();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const formData = { email, password };

    try {
      if (authState === 'signup') {
        const result = await signup(formData);
        if (result?.error) throw new Error(result.error);
        if (result?.success) setMessage(result.message);
      } else {
        const result = await login(formData);
        if (result?.error) throw new Error(result.error);
        if (result?.success) {
            window.location.href = '/';
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  const BlueprintBackground = () => (
    <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="blueprint-mobile" width="80" height="80" patternUnits="userSpaceOnUse">
                    <path d="M 0 40 L 80 40" stroke="#334155" strokeWidth="1" fill="none" />
                    <path d="M 40 0 L 40 80" stroke="#334155" strokeWidth="1" fill="none" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#blueprint-mobile)" />
            <path d="M-50,100 Q100,50 200,150 T400,100" stroke="#3b82f6" strokeWidth="20" fill="none" opacity="0.1" />
            <circle cx="180" cy="120" r="8" fill="#3b82f6" opacity="0.4" />
            <circle cx="180" cy="120" r="4" fill="#60a5fa" />
        </svg>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* Auth Interaction Panel */}
      <div className="flex flex-col w-full lg:w-[520px] bg-white dark:bg-slate-900 z-20 relative shadow-2xl lg:justify-center">
        
        {authState === 'selection' ? (
          <div className="flex flex-col min-h-screen lg:min-h-0 lg:p-16">
            {/* Top Illustration Area (Mobile Only) */}
            <div className="lg:hidden relative h-[45vh] bg-[#0f172a] flex items-center justify-center overflow-hidden rounded-b-[40px] shadow-2xl">
              <BlueprintBackground />
              <div className="relative z-10 bg-blue-600 p-6 rounded-3xl shadow-2xl shadow-blue-500/20 animate-in zoom-in duration-700">
                <Shield className="text-white" size={64} strokeWidth={2} />
              </div>
            </div>

            <div className="flex-1 p-8 md:p-12 lg:p-0 flex flex-col justify-center max-w-sm mx-auto w-full">
              {/* Desktop Logo */}
              <div className="hidden lg:flex items-center gap-3 mb-12">
                <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                  <Shield className="text-white" size={24} strokeWidth={2.5} />
                </div>
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">SafePath</span>
              </div>

              <div className="mb-10 text-center lg:text-left">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Earn safety for every step you take.
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-4 text-base md:text-lg font-medium leading-relaxed">
                  More than tracking, transform navigation into a secure community experience.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 w-full">
                <button 
                  onClick={() => setAuthState('login')}
                  className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-900/10 dark:shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <LogIn size={20} />
                  <span>Log in</span>
                </button>

                <button 
                  onClick={() => setAuthState('signup')}
                  className="w-full py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold transition-all hover:border-blue-500 dark:hover:border-blue-500 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <UserPlus size={20} className="text-slate-400" />
                  <span>Sign up</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col min-h-screen lg:min-h-0 p-8 md:p-16 max-w-sm mx-auto w-full">
            {/* Back Button */}
            <button 
              onClick={() => {
                setAuthState('selection');
                setError(null);
                setMessage(null);
              }}
              className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl mb-12 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
            >
              <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <div className="mb-10">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {authState === 'signup' ? 'Create Account' : 'Log in'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                By {authState === 'signup' ? 'joining' : 'logging in'}, you agree to our <span className="text-slate-900 dark:text-white font-bold underline decoration-slate-200 underline-offset-4 cursor-pointer hover:text-blue-600">Terms of Use</span>.
              </p>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium flex items-start gap-3">
                <Info className="shrink-0 mt-0.5" size={18} />
                <div>{error}</div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleAuth}>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-hidden transition-all text-slate-900 dark:text-white" 
                  placeholder="name@example.com" 
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</label>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-hidden transition-all text-slate-900 dark:text-white" 
                    placeholder="••••••••" 
                    required
                  />
                  <button 
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl text-base font-bold hover:bg-slate-800 dark:hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 dark:shadow-blue-500/20 active:scale-[0.99]"
              >
                {loading && <Loader2 className="animate-spin" size={20} />}
                {authState === 'signup' ? 'Join Now' : 'Connect'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-10">
              <div className="relative mb-8 text-center">
                <span className="relative z-10 bg-white dark:bg-slate-900 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Auth_Interface</span>
                <div className="absolute inset-0 top-1/2 -translate-y-1/2 border-t border-slate-100 dark:border-slate-800"></div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => handleOAuth('google')} className="flex items-center justify-center gap-3 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-bold text-slate-700 dark:text-slate-300">
                  <Image src="https://authjs.dev/img/providers/google.svg" alt="" width={18} height={18} />
                  Sign in with Google
                </button>
                <button onClick={() => handleOAuth('apple')} className="flex items-center justify-center gap-3 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-bold text-slate-700 dark:text-slate-300">
                  <Image src="https://authjs.dev/img/providers/apple.svg" alt="" width={18} height={18} className="dark:invert" />
                  Sign in with Apple
                </button>
              </div>
            </div>

            <p className="mt-12 text-center text-xs text-slate-400 leading-relaxed max-w-[240px] mx-auto">
              For more information, please see our <span className="text-slate-900 dark:text-white font-bold underline decoration-slate-200 underline-offset-4 cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        )}
      </div>

      {/* Desktop Hero Section (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-1 flex-col relative bg-[#0f172a] overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="blueprint" width="160" height="160" patternUnits="userSpaceOnUse">
                        <path d="M 0 80 L 160 80" stroke="#334155" strokeWidth="2" fill="none" />
                        <path d="M 80 0 L 80 160" stroke="#334155" strokeWidth="2" fill="none" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#blueprint)" />
                <path d="M-50,200 Q150,150 300,350 T600,250" stroke="#3b82f6" strokeWidth="40" fill="none" opacity="0.1" />
                <circle cx="280" cy="300" r="12" fill="#3b82f6" opacity="0.4" />
                <circle cx="280" cy="300" r="6" fill="#60a5fa" />
            </svg>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-between p-20">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-bold text-blue-400 mb-10">
              <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
              Now monitoring 4,200+ safety nodes
            </div>
            <h2 className="text-6xl font-extrabold text-white tracking-tight mb-8 leading-tight">
              Safety is <br/>
              <span className="text-blue-500 italic font-medium">Non-Negotiable.</span>
            </h2>
            <p className="text-xl text-slate-400 leading-relaxed mb-12 max-w-md">
              The world's first navigation engine built on community-verified safety intelligence.
            </p>
          </div>
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500 tracking-widest uppercase">
            <span>&copy; 2026 SafePath Systems</span>
            <div className="flex gap-8">
              <a href="#" className="hover:text-blue-400 transition-colors">Legal</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Infrastructure</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
