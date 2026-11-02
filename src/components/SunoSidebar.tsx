import React from 'react';
import { AppTab } from '../types';
import { 
  PlusCircle, 
  Compass, 
  Library, 
  Settings, 
  Zap, 
  Music, 
  Sparkles,
  Radio
} from 'lucide-react';

interface SunoSidebarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenSettings: () => void;
  credits: number;
}

export const SunoSidebar: React.FC<SunoSidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSettings,
  credits
}) => {
  return (
    <aside className="w-64 min-w-[256px] h-screen bg-[#090b0e] border-r border-[#1a1f26] flex flex-col justify-between p-4 select-none z-20">
      {/* Top: Logo & Main Nav */}
      <div className="flex flex-col gap-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff3366] via-[#ff5e3a] to-[#ff9900] flex items-center justify-center shadow-lg shadow-[#ff3366]/20">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white font-sans">
                Rhapsody
              </span>
              <span className="text-[10px] bg-gradient-to-r from-[#ff3366] to-[#ff9900] text-white px-1.5 py-0.2 rounded font-mono font-bold tracking-wider">
                AI
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium">Powered by Suno & Udio</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5">
          <button
            onClick={() => onSelectTab('create')}
            className={`w-full px-3.5 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-3 ${
              currentTab === 'create'
                ? 'bg-[#1e242d] text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#14181e]'
            }`}
          >
            <PlusCircle className={`w-5 h-5 ${currentTab === 'create' ? 'text-[#ff3366]' : 'text-gray-400'}`} />
            <span>Create</span>
            <span className="ml-auto text-[10px] bg-[#ff3366]/20 text-[#ff3366] px-1.5 py-0.5 rounded-full font-mono font-bold">
              HOT
            </span>
          </button>

          <button
            onClick={() => onSelectTab('explore')}
            className={`w-full px-3.5 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-3 ${
              currentTab === 'explore'
                ? 'bg-[#1e242d] text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#14181e]'
            }`}
          >
            <Compass className={`w-5 h-5 ${currentTab === 'explore' ? 'text-[#00f5d4]' : 'text-gray-400'}`} />
            <span>Explore</span>
          </button>

          <button
            onClick={() => onSelectTab('library')}
            className={`w-full px-3.5 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-3 ${
              currentTab === 'library'
                ? 'bg-[#1e242d] text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#14181e]'
            }`}
          >
            <Library className={`w-5 h-5 ${currentTab === 'library' ? 'text-[#9d4edd]' : 'text-gray-400'}`} />
            <span>Library</span>
          </button>
        </nav>
      </div>

      {/* Middle: Credits Banner */}
      <div className="bg-gradient-to-b from-[#151920] to-[#0f1318] p-3.5 rounded-2xl border border-[#232a34] flex flex-col gap-2.5 shadow-md">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-gray-300 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            Credits
          </span>
          <span className="font-mono text-xs font-bold text-white">
            {credits} / 50
          </span>
        </div>
        <div className="w-full bg-[#232a34] h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-amber-400 to-[#ff3366] h-full rounded-full transition-all duration-300" 
            style={{ width: `${(credits / 50) * 100}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-500 leading-tight">
          Renewed daily. GoAPI Key unlocks unlimited live generation.
        </p>
      </div>

      {/* Bottom: Settings & User Profile */}
      <div className="flex flex-col gap-2 pt-2 border-t border-[#1a1f26]">
        <button
          onClick={onOpenSettings}
          className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#14181e] transition flex items-center gap-2.5"
        >
          <Settings className="w-4 h-4 text-gray-400" />
          <span>API Settings (GoAPI)</span>
        </button>

        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#12161c] border border-[#1e242d]">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#242b35] border border-[#2d3642] shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces" 
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="leading-tight truncate">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-gray-200">ibobatsuga</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[10px] text-gray-500 font-mono">Free Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
