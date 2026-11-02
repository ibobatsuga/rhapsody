import React, { useState } from 'react';
import { Song } from '../types';
import { 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  ListFilter, 
  Share2, 
  ThumbsUp, 
  ThumbsDown, 
  MoreHorizontal, 
  Play, 
  Pause, 
  Scissors, 
  FastForward, 
  Download, 
  Trash2,
  Sliders
} from 'lucide-react';

interface SunoWorkspaceFeedProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onToggleLike: (songId: string) => void;
  onSplitStems: (song: Song) => void;
  onExtend: (song: Song) => void;
  onDelete: (songId: string) => void;
  onOpenInStudio: (song: Song) => void;
}

export const SunoWorkspaceFeed: React.FC<SunoWorkspaceFeedProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onToggleLike,
  onSplitStems,
  onExtend,
  onDelete,
  onOpenInStudio
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'liked' | 'public' | 'uploads'>('all');
  const [activeMenuSongId, setActiveMenuSongId] = useState<string | null>(null);

  // Filter songs
  const filteredSongs = songs.filter(song => {
    const matchesSearch = 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.tags.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === 'liked') return !!song.isLiked;
    return true;
  });

  // Group by dateGroup (e.g. "Wednesday, Oct 14", "Sunday, Sep 13")
  const groupedSongs: { [key: string]: Song[] } = {};
  filteredSongs.forEach(song => {
    const group = song.dateGroup || 'Recent Tracks';
    if (!groupedSongs[group]) groupedSongs[group] = [];
    groupedSongs[group].push(song);
  });

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 h-full overflow-y-auto px-6 py-5 pb-28 flex flex-col gap-5 select-none font-sans scrollbar-thin scrollbar-thumb-[#1e2531]">
      {/* 1. Top Breadcrumbs Bar & Share Button */}
      <div className="flex items-center justify-between pb-2 border-b border-[#181c25]">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
          <span className="text-gray-200">Workspaces</span>
          <span>&gt;</span>
          <span className="text-white font-bold">My Workspace</span>
        </div>

        <button className="px-3 py-1.5 bg-[#141822] hover:bg-[#1f2533] text-gray-200 text-xs font-semibold rounded-xl border border-[#212836] flex items-center gap-1.5 transition">
          <Share2 className="w-3.5 h-3.5 text-gray-400" />
          <span>Share</span>
        </button>
      </div>

      {/* 2. Search & Toolbar Controls (Exact match to Screenshots) */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Left: Search input */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-[#11141c] border border-[#1e2533] focus:border-[#ff3366] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none transition"
          />
        </div>

        {/* Right: Filters (3), New ⌄, List ⌄, Filter pills, Pagination */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <button className="px-3 py-1.5 bg-[#141822] hover:bg-[#1f2533] text-gray-300 font-semibold rounded-xl border border-[#212836] flex items-center gap-1.5 transition">
            <ListFilter className="w-3.5 h-3.5 text-gray-400" />
            <span>Filters (3)</span>
          </button>

          <button className="px-3 py-1.5 bg-[#141822] hover:bg-[#1f2533] text-gray-300 font-semibold rounded-xl border border-[#212836] flex items-center gap-1 transition">
            <span>New</span>
            <ChevronDown className="w-3 h-3 text-gray-500 ml-1" />
          </button>

          <button className="px-3 py-1.5 bg-[#141822] hover:bg-[#1f2533] text-gray-300 font-semibold rounded-xl border border-[#212836] flex items-center gap-1 transition">
            <span>List</span>
            <ChevronDown className="w-3 h-3 text-gray-500 ml-1" />
          </button>

          {/* Filter Pills */}
          <div className="flex items-center bg-[#11141c] p-0.5 rounded-xl border border-[#1e2533]">
            <button
              onClick={() => setActiveFilter(activeFilter === 'liked' ? 'all' : 'liked')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                activeFilter === 'liked' ? 'bg-[#212937] text-[#ff3366]' : 'text-gray-400 hover:text-white'
              }`}
            >
              Liked
            </button>
            <button
              onClick={() => setActiveFilter(activeFilter === 'public' ? 'all' : 'public')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                activeFilter === 'public' ? 'bg-[#212937] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Public
            </button>
            <button
              onClick={() => setActiveFilter(activeFilter === 'uploads' ? 'all' : 'uploads')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                activeFilter === 'uploads' ? 'bg-[#212937] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Uploads
            </button>
          </div>

          {/* Pagination */}
          <div className="flex items-center gap-1 text-gray-400">
            <button className="w-7 h-7 rounded-lg bg-[#141822] flex items-center justify-center hover:text-white text-xs">&lt;</button>
            <span className="w-6 text-center text-xs text-white font-mono font-bold">1</span>
            <button className="w-7 h-7 rounded-lg bg-[#141822] flex items-center justify-center hover:text-white text-xs">&gt;</button>
          </div>
        </div>
      </div>

      {/* 3. Date Grouped Track Lists */}
      <div className="flex flex-col gap-6">
        {Object.entries(groupedSongs).map(([dateLabel, dateSongs]) => (
          <div key={dateLabel} className="flex flex-col gap-2.5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
              {dateLabel}
            </h3>

            <div className="flex flex-col gap-2">
              {dateSongs.map(song => {
                const isThisPlaying = currentSong?.id === song.id && isPlaying;
                const isSelected = currentSong?.id === song.id;

                return (
                  <div
                    key={song.id}
                    className="group relative p-2.5 bg-[#0f121a] hover:bg-[#141822] border border-[#1a202c] hover:border-[#283244] rounded-2xl flex items-center justify-between gap-4 transition shadow-sm select-none"
                  >
                    {/* Active Track Pink Indicator Dot (Screenshot 1 & 2) */}
                    {isSelected && (
                      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#ff3366] ring-4 ring-[#ff3366]/20" />
                    )}

                    {/* Left: Artwork Thumbnail with Duration Overlay & Play Button */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div
                        onClick={() => onPlaySong(song)}
                        className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#1a202c] shrink-0 cursor-pointer shadow group/thumb"
                      >
                        <img
                          src={song.imageUrl}
                          alt={song.title}
                          className="w-full h-full object-cover group-hover/thumb:scale-105 transition duration-300"
                        />

                        {/* Overlay Play/Pause Button */}
                        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition ${
                          isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover/thumb:opacity-100'
                        }`}>
                          <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center shadow">
                            {isThisPlaying ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black ml-0.5" />}
                          </div>
                        </div>

                        {/* Duration Badge on Bottom Overlay */}
                        <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/75 text-[9px] font-mono text-gray-200">
                          {formatDuration(song.duration)}
                        </div>
                      </div>

                      {/* Middle: Title, Tags, Thumbs Up / Down / Share */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            onClick={() => onPlaySong(song)}
                            className="font-bold text-xs text-white hover:text-[#ff3366] transition cursor-pointer truncate max-w-md"
                          >
                            {song.title}
                          </span>

                          {/* Model Badge (e.g. V6-MINI, V6) */}
                          {song.modelBadge && (
                            <span className="text-[9px] font-mono font-bold text-gray-400 bg-[#1a202c] px-1.5 py-0.2 rounded border border-[#2b3545]">
                              {song.modelBadge}
                            </span>
                          )}

                          {/* Extend Badge */}
                          {song.extendCount && (
                            <span className="text-[9px] font-mono font-bold text-gray-400 bg-[#1a202c] px-1.5 py-0.2 rounded border border-[#2b3545]">
                              EXTEND {song.extendCount}
                            </span>
                          )}

                          {/* Cover Badge */}
                          {song.isCover && (
                            <span className="text-[9px] font-mono font-bold text-[#ff3366] bg-[#ff3366]/10 px-1.5 py-0.2 rounded border border-[#ff3366]/30">
                              COVER
                            </span>
                          )}
                        </div>

                        {/* Prompt Description */}
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {song.prompt}
                        </p>

                        {/* Action Buttons Row: Thumbs Up, Thumbs Down, Share */}
                        <div className="flex items-center gap-3 mt-1 text-gray-500">
                          <button
                            onClick={() => onToggleLike(song.id)}
                            className={`hover:text-white transition ${song.isLiked ? 'text-[#ff3366]' : ''}`}
                            title="Thumbs Up / Like"
                          >
                            <ThumbsUp className={`w-3 h-3 ${song.isLiked ? 'fill-current' : ''}`} />
                          </button>

                          <button
                            className="hover:text-white transition"
                            title="Thumbs Down"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>

                          <button
                            className="hover:text-white transition flex items-center gap-1 text-[10px]"
                            title="Share"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: More Options `...` menu */}
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setActiveMenuSongId(activeMenuSongId === song.id ? null : song.id)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1f2533] rounded-lg transition"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuSongId === song.id && (
                        <div
                          onMouseLeave={() => setActiveMenuSongId(null)}
                          className="absolute right-0 top-8 w-48 bg-[#151922] border border-[#273241] rounded-xl shadow-2xl py-1 z-30 flex flex-col text-xs text-gray-200"
                        >
                          <button
                            onClick={() => { onOpenInStudio(song); setActiveMenuSongId(null); }}
                            className="px-3 py-2 hover:bg-[#202735] flex items-center gap-2 text-left text-[#ff9900]"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span>Open in Studio (DAW)</span>
                          </button>

                          <button
                            onClick={() => { onSplitStems(song); setActiveMenuSongId(null); }}
                            className="px-3 py-2 hover:bg-[#202735] flex items-center gap-2 text-left"
                          >
                            <Scissors className="w-3.5 h-3.5 text-[#00f5d4]" />
                            <span>Separate Stems</span>
                          </button>

                          <button
                            onClick={() => { onExtend(song); setActiveMenuSongId(null); }}
                            className="px-3 py-2 hover:bg-[#202735] flex items-center gap-2 text-left"
                          >
                            <FastForward className="w-3.5 h-3.5 text-amber-400" />
                            <span>Extend Track</span>
                          </button>

                          <a
                            href={song.audioUrl}
                            download={`${song.title}.mp3`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 hover:bg-[#202735] flex items-center gap-2 text-left"
                          >
                            <Download className="w-3.5 h-3.5 text-blue-400" />
                            <span>Download MP3</span>
                          </a>

                          <div className="w-full h-[1px] bg-[#273241] my-1" />

                          <button
                            onClick={() => { onDelete(song.id); setActiveMenuSongId(null); }}
                            className="px-3 py-2 hover:bg-[#202735] text-red-400 flex items-center gap-2 text-left"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
