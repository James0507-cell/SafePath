'use client';

import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/src/lib/supabaseClient';
import { login, signup } from '@/src/services/auth';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const supabase = createClient();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const formData = { email, password };

    try {
      if (isSignUp) {
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center text-zinc-900 dark:text-zinc-50">
          {isSignUp ? 'Create an Account' : 'Sign In to Safe Path'}
        </h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {message}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleAuth}>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mt-1 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-700" 
              placeholder="you@example.com" 
              required
            />
          </div>
          
          <div className="relative">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mt-1 border border-zinc-300 rounded-lg dark:bg-zinc-800 dark:border-zinc-700" 
              placeholder="••••••••" 
              required
            />
            <button 
              type="button"
              className="absolute right-3 top-10 text-zinc-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          {!isSignUp && (
            <div className="text-right">
              <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
            </div>
          )}
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setMessage(null);
            }}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>

        <div className="my-6 flex items-center gap-2">
            <hr className="flex-1 border-zinc-300 dark:border-zinc-700" />
            <span className="text-sm text-zinc-500">or continue with</span>
            <hr className="flex-1 border-zinc-300 dark:border-zinc-700" />
        </div>

        <div className="flex gap-4">
            <button 
              type="button"
              onClick={() => handleOAuth('google')}
              className="flex-1 flex items-center justify-center gap-2 py-2 border border-zinc-300 rounded-lg dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
                <Image src="https://authjs.dev/img/providers/google.svg" alt="Google" width={20} height={20} />
                Google
            </button>
            <button 
              type="button"
              onClick={() => handleOAuth('apple')}
              className="flex-1 flex items-center justify-center gap-2 py-2 border border-zinc-300 rounded-lg dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
                <Image src="https://authjs.dev/img/providers/apple.svg" alt="Apple" width={20} height={20} className="dark:invert" />
                Apple
            </button>
        </div>
      </div>
    </div>
  );
}
