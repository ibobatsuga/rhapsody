import React from 'react';
import { AppTab } from '../types';
import { 
  PanelLeft,
  Home, 
  Search, 
  Music, 
  SlidersHorizontal,
  Library, 
  Flame, 
  Gift, 
  FlaskConical, 
  Bell, 
  MoreHorizontal,
  Settings
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
    <aside className="w-[56px] min-w-[56px] h-screen bg-[#080a0d] border-r border-[#171b22] flex flex-col justify-between items-center py-3 select-none z-30">
      {/* Top Group: Collapse Toggle & Main Navigation Icons */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Sidebar Toggle Icon */}
        <button 
          title="Toggle Sidebar"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#141820] transition"
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        <div className="w-8 h-[1px] bg-[#1a1f28]" />

        {/* Navigation Icons */}
        <nav className="flex flex-col items-center gap-2 w-full px-2">
          {/* Home */}
          <button
            onClick={() => onSelectTab('explore')}
            title="Home"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
              currentTab === 'explore'
                ? 'bg-[#1b222d] text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#12161f]'
            }`}
          >
            <Home className="w-5 h-5" />
          </button>

          {/* Search / Explore */}
          <button
            onClick={() => onSelectTab('explore')}
            title="Search & Explore"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
              currentTab === 'explore'
                ? 'bg-[#1b222d] text-[#00f5d4]'
                : 'text-gray-400 hover:text-white hover:bg-[#12161f]'
            }`}
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Create (Music Note) */}
          <button
            onClick={() => onSelectTab('create')}
            title="Create Music (Suno & Udio)"
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition ${
              currentTab === 'create'
                ? 'bg-[#1e2532] text-white shadow-inner'
                : 'text-gray-400 hover:text-white hover:bg-[#12161f]'
            }`}
          >
            <Music className={`w-5 h-5 ${currentTab === 'create' ? 'text-[#ff3366]' : ''}`} />
            {currentTab === 'create' && (
              <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#ff3366] rounded-r" />
            )}
          </button>

          {/* Studio (Multitrack Timeline DAW) - Exactly as in Screenshot 4 */}
          <button
            onClick={() => onSelectTab('studio')}
            title="Suno Studio (Multitrack DAW & AI Copilot)"
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition ${
              currentTab === 'studio'
                ? 'bg-[#1e2532] text-white shadow-inner'
                : 'text-gray-400 hover:text-white hover:bg-[#12161f]'
            }`}
          >
            <SlidersHorizontal className={`w-5 h-5 ${currentTab === 'studio' ? 'text-[#ff9900]' : ''}`} />
            <span className="absolute -top-1 -right-1 text-[8px] bg-[#ff3366] text-white px-1 rounded-full font-mono font-bold">
              DAW
            </span>
            {currentTab === 'studio' && (
              <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#ff9900] rounded-r" />
            )}
          </button>

          {/* Library */}
          <button
            onClick={() => onSelectTab('library')}
            title="Library"
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
              currentTab === 'library'
                ? 'bg-[#1b222d] text-[#9d4edd]'
                : 'text-gray-400 hover:text-white hover:bg-[#12161f]'
            }`}
          >
            <Library className="w-5 h-5" />
          </button>

          {/* Suno / Rhapsody Brand Icon */}
          <div 
            title="Rhapsody AI Engine"
            className="w-10 h-10 rounded-full flex items-center justify-center mt-2 cursor-pointer group"
            onClick={() => onSelectTab('create')}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#ff3366] via-[#ff5e3a] to-[#ff9900] flex items-center justify-center shadow-lg shadow-[#ff3366]/30 group-hover:scale-110 transition">
              <Flame className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
        </nav>
      </div>

      {/* Bottom Group: Gift, Lab, Bell, More/Settings, User Profile */}
      <div className="flex flex-col items-center gap-2.5 w-full">
        {/* Credits / Gift */}
        <button
          onClick={onOpenSettings}
          title={`Credits: ${credits} / 50`}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-amber-400 hover:bg-[#141820] transition relative"
        >
          <Gift className="w-4 h-4" />
          <span className="absolute bottom-1 right-1 text-[8px] font-mono font-bold text-gray-300">
            {credits}
          </span>
        </button>

        {/* AI Lab */}
        <button
          onClick={() => onSelectTab('studio')}
          title="AI Audio Lab"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#141820] transition"
        >
          <FlaskConical className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button
          title="Notifications"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#141820] transition"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          title="Settings & API Key"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#141820] transition"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>

        {/* User Profile Avatar */}
        <div 
          onClick={onOpenSettings}
          title="ibobatsuga (Free Plan)"
          className="w-8 h-8 rounded-full overflow-hidden border border-[#2d3846] cursor-pointer mt-1 hover:ring-2 hover:ring-[#ff3366] transition"
        >
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" 
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </aside>
  );
};
