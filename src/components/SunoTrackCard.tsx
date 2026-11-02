import React, { useState } from 'react';
import { Song } from '../types';
import { 
  Play, 
  Pause, 
  Heart, 
  MoreHorizontal, 
  Scissors, 
  Download, 
  FastForward, 
  Sparkles,
  Layers,
  Trash2
} from 'lucide-react';

interface SunoTrackCardProps {
  song: Song;
  isPlaying: boolean;
  onPlay: (song: Song) => void;
  onToggleLike: (songId: string) => void;
  onSplitStems: (song: Song) => void;
  onExtend: (song: Song) => void;
  onDelete: (songId: string) => void;
}

export const SunoTrackCard: React.FC<SunoTrackCardProps> = ({
  song,
  isPlaying,
  onPlay,
  onToggleLike,
  onSplitStems,
  onExtend,
  onDelete
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = Math.floor(secs % 60);
    return `${mins}:${remSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="group relative p-3 bg-[#11151c] hover:bg-[#151a23] border border-[#1e2530] hover:border-[#2d3846] rounded-2xl flex items-center justify-between gap-4 transition shadow-sm select-none">
      {/* Left: Thumbnail with Play Button */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div 
          onClick={() => onPlay(song)}
          className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#1f2632] shrink-0 cursor-pointer shadow-md group/thumb"
        >
          <img 
            src={song.imageUrl} 
            alt={song.title} 
            className="w-full h-full object-cover group-hover/thumb:scale-105 transition duration-300"
          />
          {/* Overlay Play/Pause Icon */}
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition ${
            isPlaying ? 'opacity-100' : 'opacity-0 group-hover/thumb:opacity-100'
          }`}>
            <div className="w-8 h-8 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg">
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-black" />
              ) : (
                <Play className="w-4 h-4 fill-black ml-0.5" />
              )}
            </div>
          </div>
        </div>

        {/* Title, Prompt / Lyrics, Tags */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 
              onClick={() => onPlay(song)}
              className="font-bold text-sm text-white hover:text-[#ff3366] transition cursor-pointer truncate"
            >
              {song.title}
            </h4>
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
              song.provider === 'suno' 
                ? 'bg-[#ff3366]/20 text-[#ff3366] border border-[#ff3366]/30' 
                : 'bg-[#9d4edd]/20 text-[#9d4edd] border border-[#9d4edd]/30'
            }`}>
              {song.provider} {song.model}
            </span>
          </div>

          <p className="text-xs text-gray-400 truncate mt-0.5">
            {song.prompt}
          </p>

          {/* Tags */}
          <div className="flex items-center gap-1.5 mt-1 overflow-hidden">
            {song.tags.split(',').slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-[10px] text-gray-500 font-medium truncate">
                #{tag.trim()}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Duration, Like, Menu */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs font-mono text-gray-400">
          {formatDuration(song.duration)}
        </span>

        {/* Like Button */}
        <button
          onClick={() => onToggleLike(song.id)}
          className={`p-2 rounded-lg transition ${
            song.isLiked ? 'text-[#ff3366]' : 'text-gray-500 hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${song.isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Context Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#1e2530] rounded-lg transition"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div 
              onMouseLeave={() => setShowMenu(false)}
              className="absolute right-0 top-10 w-44 bg-[#161c24] border border-[#2b3542] rounded-xl shadow-2xl py-1 z-30 flex flex-col text-xs text-gray-200"
            >
              <button
                onClick={() => { onSplitStems(song); setShowMenu(false); }}
                className="px-3 py-2 hover:bg-[#202732] flex items-center gap-2 text-left"
              >
                <Scissors className="w-3.5 h-3.5 text-[#00f5d4]" />
                <span>Separate Stems</span>
              </button>

              <button
                onClick={() => { onExtend(song); setShowMenu(false); }}
                className="px-3 py-2 hover:bg-[#202732] flex items-center gap-2 text-left"
              >
                <FastForward className="w-3.5 h-3.5 text-amber-400" />
                <span>Extend Track</span>
              </button>

              <a
                href={song.audioUrl}
                download={`${song.title}.mp3`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 hover:bg-[#202732] flex items-center gap-2 text-left"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Download Audio</span>
              </a>

              <div className="w-full h-[1px] bg-[#2b3542] my-1" />

              <button
                onClick={() => { onDelete(song.id); setShowMenu(false); }}
                className="px-3 py-2 hover:bg-[#202732] text-red-400 flex items-center gap-2 text-left"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Track</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
