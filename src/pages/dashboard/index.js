// src/pages/dashboard.js (or wherever your index/dashboard is located)
import React from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
// Importing Lucide icons to replace emojis and enhance the athlete dashboard
import { 
  Trophy, 
  Lock, 
  ArrowRight, 
  Flame, 
  Dumbbell, 
  ChevronRight,
  TrendingUp 
} from 'lucide-react';

export default function Dashboard() {
  return (
    <Layout>
      <div className="p-8 max-w-5xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-6 h-6 text-fbOrange animate-pulse" />
            <span className="text-xs font-black text-fbOrange uppercase tracking-widest">Athlete Portal</span>
          </div>
          <h1 className="text-4xl font-black text-fbNavy tracking-tight">
            Welcome back, <span className="text-fbOrange">Athlete</span>
          </h1>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Practicum 1 Summary Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-fbOrange/10 text-fbOrange text-[10px] font-black px-2 py-1 rounded uppercase flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Current
              </span>
              <div className="p-2 bg-fbAmber/10 rounded-lg">
                <Trophy className="w-6 h-6 text-fbAmber" />
              </div>
            </div>
            <h3 className="font-bold text-fbNavy text-xl flex items-center gap-2">
              Practicum 1
            </h3>
            <p className="text-sm text-gray-400 mb-6 flex items-center gap-1">
              <Dumbbell className="w-3 h-3" />
              Foundational Movements
            </p>
            
            <Link href="/practicum/1">
              <button className="w-full bg-fbGray text-fbNavy font-bold py-3 rounded-xl hover:bg-fbOrange hover:text-white transition-all flex items-center justify-center gap-2 group">
                Open Log
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {/* Practicum 2 Summary Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm opacity-60 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-gray-100 text-gray-400 text-[10px] font-black px-2 py-1 rounded uppercase flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Locked
              </span>
              <div className="p-2 bg-gray-50 rounded-lg">
                <Lock className="w-6 h-6 text-gray-300" />
              </div>
            </div>
            <h3 className="font-bold text-fbNavy text-xl">Practicum 2</h3>
            <p className="text-sm text-gray-400 mb-6 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Advanced Conditioning
            </p>
            
            {/* Overlay hint for locked content */}
            <div className="absolute inset-x-0 bottom-4 px-6">
              <div className="text-[9px] text-gray-300 font-bold uppercase tracking-tighter text-center">
                Complete Practicum 1 to unlock
              </div>
            </div>
          </div>
        </div>

        {/* Optional Footer Decoration */}
        <div className="mt-12 p-6 rounded-3xl bg-fbNavy text-white flex items-center justify-between overflow-hidden relative">
          <div className="z-10">
            <p className="text-fbOrange font-black text-xs uppercase tracking-widest mb-1">Consistency is Key</p>
            <h4 className="font-bold text-lg">Maintain your 5-day streak!</h4>
          </div>
          <Flame className="w-20 h-20 text-white/5 absolute -right-4 -bottom-4 rotate-12" />
        </div>
      </div>
    </Layout>
  );
}
