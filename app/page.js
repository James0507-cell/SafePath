'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Map as MapIcon, 
  Rss, 
  Calendar, 
  Settings, 
  LogOut, 
  Shield, 
  Search,
  Bell,
  User
} from 'lucide-react';
import { createClient } from '@/src/lib/supabaseClient';
import MapView from '@/src/components/MapView';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('maps');
  const [user, setUser] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Listen for auth state changes (e.g. sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/login');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router, supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // The onAuthStateChange listener will handle the redirect
    } catch (err) {
      console.error('Error logging out:', err);
      router.replace('/login');
    }
  };

  const navItems = [
    { id: 'maps', label: 'Maps', icon: MapIcon },
    { id: 'feed', label: 'Feed', icon: Rss },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-white text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      
      {/* 1. DESKTOP SIDEBAR (Hidden on mobile) */}
      <aside className="hidden md:flex w-[72px] flex-col bg-white border-r border-slate-200 shrink-0 z-30">
        <div className="h-16 flex items-center justify-center border-b border-slate-100">
          <div className="bg-slate-900 p-1.5 rounded-lg">
            <Shield className="text-white" size={20} strokeWidth={1.5} />
          </div>
        </div>
        
        <nav className="flex-1 py-6 flex flex-col items-center gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-[60px] py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                activeTab === item.id 
                  ? 'bg-slate-100 text-slate-900' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2 : 1.5} />
              <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pb-6 flex flex-col items-center gap-4">
          <button className="p-3 text-slate-400 hover:text-slate-900 transition-colors">
            <Bell size={20} strokeWidth={1.5} />
          </button>
          <button 
            type="button"
            onClick={handleLogout}
            className="p-3 text-slate-400 hover:text-red-600 transition-colors"
            title="Sign Out"
          >
            <LogOut size={20} strokeWidth={1.5} />
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* RESPONSIVE HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-8 justify-between shrink-0 z-20">
          <div className="flex items-center gap-3 md:hidden mr-2">
            <div className="bg-slate-900 p-1.5 rounded-lg">
              <Shield className="text-white" size={18} strokeWidth={1.5} />
            </div>
          </div>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} strokeWidth={1.5} />
              <input 
                type="text" 
                placeholder="Search locations..."
                className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-hidden focus:border-slate-300 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-3 md:ml-6">
            <button className="hidden sm:block md:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <Bell size={20} strokeWidth={1.5} />
            </button>
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs md:text-sm shadow-sm">
              {user?.email?.charAt(0).toUpperCase() || <User size={18} strokeWidth={1.5} />}
            </div>
          </div>
        </header>

        {/* VIEWPORT */}
        <main className="flex-1 relative bg-slate-50 overflow-hidden">
          {activeTab === 'maps' ? (
            <MapView />
          ) : (
            <div className="h-full flex items-center justify-center p-6 md:p-12 text-center">
               <div className="max-w-sm">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                  <p className="text-slate-500 text-sm font-medium">This feature is currently being prepared for the next update.</p>
               </div>
            </div>
          )}
        </main>

        {/* 3. MOBILE BOTTOM NAVIGATION (Visible only on mobile) */}
        <nav className="md:hidden h-16 bg-white border-t border-slate-200 flex items-center justify-around px-1 shrink-0 z-30 pb-safe">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 transition-all ${
                activeTab === item.id 
                  ? 'text-slate-900' 
                  : 'text-slate-400'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all ${activeTab === item.id ? 'bg-slate-100' : ''}`}>
                <item.icon size={ activeTab === item.id ? 22 : 20} strokeWidth={activeTab === item.id ? 2 : 1.5} />
              </div>
              <span className={`text-[10px] font-semibold tracking-wide ${activeTab === item.id ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
            </button>
          ))}
          <button 
            type="button"
            onClick={handleLogout}
            className="flex-1 py-1 flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-red-600 transition-colors"
          >
            <div className="p-1.5">
              <LogOut size={20} strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-semibold tracking-wide opacity-80">Exit</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
