import React, { useState } from 'react';
import { Song } from '../types';
import { 
  Search, 
  Play, 
  Pause, 
  Heart, 
  Sparkles, 
  Wand2, 
  Layers, 
  Download,
  Flame,
  Radio
} from 'lucide-react';

interface SunoExploreViewProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onToggleLike: (songId: string) => void;
  onUsePrompt: (song: Song) => void;
  onSplitStems: (song: Song) => void;
}

const CATEGORIES = ['All', 'Synthwave', 'Lo-Fi', 'Cyberpunk', 'Acoustic', 'Rock', 'Electronic'];

export const SunoExploreView: React.FC<SunoExploreViewProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onToggleLike,
  onUsePrompt,
  onSplitStems
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredSongs = songs.filter(s => {
    const matchesSearch = 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.prompt.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      selectedCategory === 'All' || 
      s.tags.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 pb-28 flex flex-col gap-8 max-w-7xl mx-auto w-full select-none">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden p-8 border border-[#232a35] bg-gradient-to-r from-[#181320] via-[#151c28] to-[#121922] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-3 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff3366]/20 border border-[#ff3366]/40 text-[#ff3366] text-xs font-bold w-fit">
            <Flame className="w-3.5 h-3.5 fill-[#ff3366]" />
            Trending Tracks
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Explore Music Created with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff3366] via-[#ff9900] to-[#00f5d4]">Suno & Udio</span>
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            Listen to full tracks generated from text prompts, view generated lyrics, split vocal and instrumental stems, or remix prompts to create your own variations.
          </p>
        </div>

        <div className="relative w-44 h-44 shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
          <img 
            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop" 
            alt="Hero Banner Artwork" 
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-[#00f5d4] animate-pulse" /> Rhapsody Top 10
            </span>
          </div>
        </div>
      </div>

      {/* Search & Categories Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-white text-black shadow-md'
                  : 'bg-[#141922] text-gray-400 hover:text-white hover:bg-[#1c232f] border border-[#222a36]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles, tags, prompts..."
            className="w-full bg-[#141922] border border-[#222a36] focus:border-[#ff3366] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Grid of Song Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredSongs.map(song => {
          const isThisPlaying = currentSong?.id === song.id && isPlaying;

          return (
            <div 
              key={song.id}
              className="group bg-[#11161e] border border-[#1e2633] hover:border-[#2f3b4c] rounded-2xl p-3.5 flex flex-col justify-between gap-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
            >
              {/* Artwork Container */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#1a212b] shadow-md group/img">
                <img 
                  src={song.imageUrl} 
                  alt={song.title} 
                  className="w-full h-full object-cover group-hover/img:scale-105 transition duration-500"
                />

                {/* Model badge */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-gray-300 uppercase tracking-wider border border-white/10">
                  {song.provider} {song.model}
                </div>

                {/* Play Button Overlay */}
                <div 
                  onClick={() => onPlaySong(song)}
                  className={`absolute inset-0 bg-black/40 flex items-center justify-center transition cursor-pointer ${
                    isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <button className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition">
                    {isThisPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black ml-0.5" />}
                  </button>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-white font-medium">
                  {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm text-white truncate group-hover:text-[#ff3366] transition">
                    {song.title}
                  </h3>
                  <button 
                    onClick={() => onToggleLike(song.id)}
                    className="p-1 text-gray-400 hover:text-[#ff3366] transition shrink-0"
                  >
                    <Heart className={`w-4 h-4 ${song.isLiked ? 'text-[#ff3366] fill-[#ff3366]' : ''}`} />
                  </button>
                </div>

                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                  {song.prompt}
                </p>

                <div className="flex flex-wrap gap-1 mt-1">
                  {song.tags.split(',').slice(0, 3).map((tag, i) => (
                    <span 
                      key={i} 
                      className="text-[10px] bg-[#1a222e] text-gray-400 px-2 py-0.5 rounded-md font-mono"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#1d2531] flex items-center justify-between gap-2">
                <button
                  onClick={() => onUsePrompt(song)}
                  className="flex-1 py-1.5 px-3 bg-[#18202b] hover:bg-[#232c3a] text-gray-200 hover:text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  title="Use this prompt in Create"
                >
                  <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Remix</span>
                </button>

                <button
                  onClick={() => onSplitStems(song)}
                  className="py-1.5 px-3 bg-[#18202b] hover:bg-[#232c3a] text-gray-300 hover:text-white rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5"
                  title="Separate Vocal and Instrumental stems"
                >
                  <Layers className="w-3.5 h-3.5 text-[#00f5d4]" />
                  <span>Stems</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
