import React, { useState, useEffect } from 'react';
import { Trophy, LogIn, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { authenticate, initAuthDB, processGoogleToken } from '../utils/auth';
import { User } from '../types';
import { GOOGLE_CLIENT_ID } from '../constants';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    initAuthDB();

    // Initialize Google Sign In
    if (typeof window !== 'undefined' && (window as any).google) {
        try {
            (window as any).google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleCallback,
                auto_select: false,
                cancel_on_tap_outside: true,
            });
            
            (window as any).google.accounts.id.renderButton(
                document.getElementById("googleButtonDiv"),
                { theme: "outline", size: "large", width: "100%" } 
            );
        } catch (e) {
            console.error("Error initializing Google Sign-In", e);
        }
    }
  }, []);

  const handleGoogleCallback = async (response: any) => {
    if (response.credential) {
        setIsSubmitting(true);
        try {
            const user = await processGoogleToken(response.credential);
            if (user) {
                onLogin(user);
            } else {
                setError("Failed to sign in with Google.");
            }
        } catch (e) {
            setError("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
        const user = await authenticate(username, password);
        if (user) {
            onLogin(user);
        } else {
            setError('Invalid credentials');
        }
    } catch (e) {
        setError("Connection error. Is the server running?");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
      <div className="w-full max-w-sm bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <Trophy className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Sign in to manage your scoreboards</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50"
              placeholder="Enter username"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-xs text-center bg-red-50 dark:bg-red-400/10 py-2 rounded-lg border border-red-200 dark:border-red-400/20">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting} icon={isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

          {/* Google Button Container */}
          <div id="googleButtonDiv" className="flex justify-center w-full h-[40px]"></div>

          <div className="text-center text-xs text-slate-500 mt-4">
            Default Admin: admin / admin
          </div>
        </form>
      </div>
    </div>
  );
};